import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const ESTADOS = ['pendiente', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado', 'fallido'];

const estadoColor = {
  pendiente:  { bg: '#fef9c3', color: '#854d0e' },
  pagado:     { bg: '#dcfce7', color: '#166534' },
  preparando: { bg: '#dbeafe', color: '#1e40af' },
  enviado:    { bg: '#e0f2fe', color: '#075985' },
  entregado:  { bg: '#f0fdf4', color: '#14532d' },
  cancelado:  { bg: '#fee2e2', color: '#991b1b' },
  fallido:    { bg: '#fce7f3', color: '#9d174d' },
};

function AdminPedidos() {
  const [pedidos,  setPedidos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filtro,   setFiltro]   = useState('todos');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { cargarPedidos(); }, []);

  async function cargarPedidos() {
    setLoading(true);
    const { data } = await supabase
      .from('pedidos')
      .select(`
        *,
        pedido_items (
          nombre_producto,
          cantidad,
          precio_unitario,
          subtotal
        )
      `)
      .order('created_at', { ascending: false });
    setPedidos(data ?? []);
    setLoading(false);
  }

  async function cambiarEstado(pedidoId, nuevoEstado) {
    await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId);
    cargarPedidos();
  }

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtro);

  const thStyle = {
    padding:     '0.75rem 1rem',
    textAlign:   'left',
    fontSize:    '0.8rem',
    fontWeight:  '600',
    color:       'var(--color-texto-muted)',
    borderBottom: '2px solid #f0e8de',
    whiteSpace:  'nowrap',
  };

  const tdStyle = {
    padding:     '0.875rem 1rem',
    fontSize:    '0.875rem',
    color:       'var(--color-texto)',
    borderBottom: '1px solid #f0e8de',
    verticalAlign: 'top',
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-texto-muted)' }}>
      Cargando pedidos...
    </div>
  );

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['todos', ...ESTADOS].map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            style={{
              padding:         '0.4rem 1rem',
              borderRadius:    'var(--radius-pill)',
              border:          'none',
              fontSize:        '0.8rem',
              fontWeight:      '600',
              fontFamily:      'var(--font-body)',
              backgroundColor: filtro === e ? 'var(--color-marron)' : '#f0e8de',
              color:           filtro === e ? '#fff' : 'var(--color-texto-muted)',
              cursor:          'pointer',
            }}
          >
            {e.charAt(0).toUpperCase() + e.slice(1)}
            {e === 'todos' ? ` (${pedidos.length})` : ` (${pedidos.filter(p => p.estado === e).length})`}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {pedidosFiltrados.length === 0 ? (
        <p style={{ color: 'var(--color-texto-muted)', textAlign: 'center', padding: '2rem' }}>
          No hay pedidos con este estado.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-crema)' }}>
                <th style={thStyle}>Pedido</th>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>Fecha</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(pedido => (
                <>
                  <tr
                    key={pedido.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === pedido.id ? null : pedido.id)}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', color: 'var(--color-marron)' }}>
                        #{pedido.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '600' }}>{pedido.envio_nombre ?? '—'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)' }}>
                        {pedido.email_invitado ?? '—'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)' }}>
                        {pedido.envio_distrito}, {pedido.envio_departamento}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      {new Date(pedido.created_at).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td style={tdStyle}>
                      <strong>S/ {Number(pedido.total).toFixed(2)}</strong>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        backgroundColor: estadoColor[pedido.estado]?.bg ?? '#f3f4f6',
                        color:           estadoColor[pedido.estado]?.color ?? '#374151',
                        padding:         '0.25rem 0.75rem',
                        borderRadius:    'var(--radius-pill)',
                        fontSize:        '0.78rem',
                        fontWeight:      '600',
                      }}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td style={tdStyle} onClick={e => e.stopPropagation()}>
                      <select
                        value={pedido.estado}
                        onChange={e => cambiarEstado(pedido.id, e.target.value)}
                        style={{
                          padding:         '0.35rem 0.5rem',
                          borderRadius:    'var(--radius-md)',
                          border:          '1px solid #e0d5c8',
                          fontSize:        '0.8rem',
                          fontFamily:      'var(--font-body)',
                          backgroundColor: '#fff',
                          cursor:          'pointer',
                        }}
                      >
                        {ESTADOS.map(e => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {/* Detalle expandible */}
                  {expanded === pedido.id && (
                    <tr key={`${pedido.id}-detail`}>
                      <td colSpan={6} style={{ padding: '0 1rem 1rem', backgroundColor: '#fafaf8' }}>
                        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-crema)' }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-marron)' }}>
                            Productos del pedido:
                          </p>
                          {pedido.pedido_items?.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0' }}>
                              <span>{item.nombre_producto} × {item.cantidad}</span>
                              <span>S/ {Number(item.subtotal).toFixed(2)}</span>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px solid #e0d5c8', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>Envío</span>
                            <span>S/ {Number(pedido.costo_envio).toFixed(2)}</span>
                          </div>
                          {pedido.envio_telefono && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)', marginTop: '0.5rem' }}>
                              📞 {pedido.envio_telefono} — 📍 {pedido.envio_direccion}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPedidos;