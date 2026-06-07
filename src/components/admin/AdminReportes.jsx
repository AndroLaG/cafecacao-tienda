import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

function AdminReportes() {
  const [datos,   setDatos]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setLoading(true);

    const [{ data: pedidos }, { data: productos }] = await Promise.all([
      supabase.from('pedidos').select('*').order('created_at', { ascending: false }),
      supabase.from('productos').select('id, nombre, stock, precio, activo'),
    ]);

    const totalVentas = pedidos
      ?.filter(p => p.estado === 'pagado' || p.estado === 'entregado' || p.estado === 'enviado' || p.estado === 'preparando')
      .reduce((acc, p) => acc + Number(p.total), 0) ?? 0;

    const pedidosPorEstado = pedidos?.reduce((acc, p) => {
      acc[p.estado] = (acc[p.estado] ?? 0) + 1;
      return acc;
    }, {}) ?? {};

    const ventasPorDia = pedidos
      ?.filter(p => ['pagado', 'preparando', 'enviado', 'entregado'].includes(p.estado))
      .reduce((acc, p) => {
        const dia = new Date(p.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
        acc[dia] = (acc[dia] ?? 0) + Number(p.total);
        return acc;
      }, {}) ?? {};

    setDatos({ pedidos: pedidos ?? [], productos: productos ?? [], totalVentas, pedidosPorEstado, ventasPorDia });
    setLoading(false);
  }

  function exportarCSV() {
    if (!datos) return;
    const filas = [
      ['ID', 'Fecha', 'Cliente', 'Email', 'Distrito', 'Total', 'Estado'],
      ...datos.pedidos.map(p => [
        p.id.slice(0, 8).toUpperCase(),
        new Date(p.created_at).toLocaleDateString('es-PE'),
        p.envio_nombre ?? '—',
        p.email_invitado ?? '—',
        p.envio_distrito ?? '—',
        Number(p.total).toFixed(2),
        p.estado,
      ]),
    ];
    const csv = filas.map(f => f.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `lilyscaffe-pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-texto-muted)' }}>
      Cargando reportes...
    </div>
  );

  const { pedidos, productos, totalVentas, pedidosPorEstado, ventasPorDia } = datos;

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius:    'var(--radius-lg)',
    padding:         '1.5rem',
    boxShadow:       'var(--shadow-card)',
    textAlign:       'center',
  };

  const maxVenta = Math.max(...Object.values(ventasPorDia), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Botón exportar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={exportarCSV}
          style={{
            backgroundColor: 'var(--color-oliva)',
            color:           '#fff',
            border:          'none',
            borderRadius:    'var(--radius-md)',
            padding:         '0.6rem 1.5rem',
            fontSize:        '0.875rem',
            fontWeight:      '600',
            fontFamily:      'var(--font-body)',
            cursor:          'pointer',
          }}
        >
          Exportar CSV
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-marron)', fontFamily: 'var(--font-heading)' }}>
            S/ {totalVentas.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-texto-muted)', marginTop: '0.25rem' }}>Ventas totales</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-marron)', fontFamily: 'var(--font-heading)' }}>
            {pedidos.length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-texto-muted)', marginTop: '0.25rem' }}>Pedidos totales</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#166534', fontFamily: 'var(--font-heading)' }}>
            {pedidosPorEstado['pagado'] ?? 0}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-texto-muted)', marginTop: '0.25rem' }}>Pagados</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#991b1b', fontFamily: 'var(--font-heading)' }}>
            {pedidosPorEstado['pendiente'] ?? 0}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-texto-muted)', marginTop: '0.25rem' }}>Pendientes</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-oliva)', fontFamily: 'var(--font-heading)' }}>
            {productos.filter(p => p.activo).length}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-texto-muted)', marginTop: '0.25rem' }}>Productos activos</div>
        </div>
      </div>

      {/* Gráfica de ventas por día */}
      {Object.keys(ventasPorDia).length > 0 && (
        <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '1.25rem' }}>
            Ventas por día
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {Object.entries(ventasPorDia).slice(-14).map(([dia, monto]) => (
              <div key={dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: '48px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-texto-muted)', fontWeight: '600' }}>
                  S/{monto.toFixed(0)}
                </span>
                <div style={{
                  width:           '36px',
                  height:          `${Math.max((monto / maxVenta) * 120, 8)}px`,
                  backgroundColor: 'var(--color-marron)',
                  borderRadius:    '4px 4px 0 0',
                  opacity:         0.85,
                }}/>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-texto-muted)', whiteSpace: 'nowrap' }}>{dia}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pedidos por estado */}
      <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '1.25rem' }}>
          Pedidos por estado
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Object.entries(pedidosPorEstado).map(([estado, cantidad]) => (
            <div key={estado} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ minWidth: '90px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto)', textTransform: 'capitalize' }}>
                {estado}
              </span>
              <div style={{ flex: 1, backgroundColor: 'var(--color-crema)', borderRadius: 'var(--radius-pill)', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  width:           `${(cantidad / pedidos.length) * 100}%`,
                  height:          '100%',
                  backgroundColor: 'var(--color-marron)',
                  borderRadius:    'var(--radius-pill)',
                }}/>
              </div>
              <span style={{ minWidth: '24px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-marron)' }}>
                {cantidad}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventario */}
      <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '1.25rem' }}>
          Inventario actual
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {productos.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f0e8de', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--color-texto)', fontWeight: '500' }}>{p.nombre}</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-texto-muted)' }}>S/ {Number(p.precio).toFixed(2)}</span>
                <span style={{
                  fontWeight:      '700',
                  color:           p.stock < 10 ? '#991b1b' : '#166534',
                  backgroundColor: p.stock < 10 ? '#fee2e2' : '#dcfce7',
                  padding:         '0.2rem 0.6rem',
                  borderRadius:    'var(--radius-pill)',
                  fontSize:        '0.8rem',
                }}>
                  {p.stock} unid.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminReportes;