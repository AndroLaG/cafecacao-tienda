import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
      ?.filter(p => ['pagado', 'entregado', 'enviado', 'preparando'].includes(p.estado))
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

  function exportarExcel() {
    if (!datos) return;
    const { pedidos, productos, totalVentas, pedidosPorEstado } = datos;
    const wb = XLSX.utils.book_new();

    // ── Colores por estado ──────────────────────────────────────────────
    const colorEstado = {
      pagado:     'C6EFCE', // verde claro
      preparando: 'FFEB9C', // amarillo
      enviado:    'BDD7EE', // azul claro
      entregado:  'D9EAD3', // verde suave
      pendiente:  'FCE4D6', // naranja claro
      cancelado:  'F4CCCC', // rojo claro
    };

    // ══════════════════════════════════════════════════════════════════
    // HOJA 1 — RESUMEN
    // ══════════════════════════════════════════════════════════════════
    const fechaReporte = new Date().toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
    });

    const resumenData = [
      ["REPORTE DE VENTAS — LILY'S CAFFE"],
      [`Generado el ${fechaReporte}`],
      [],
      ['MÉTRICAS GENERALES'],
      ['Indicador', 'Valor'],
      ['Ventas totales (S/)', totalVentas.toFixed(2)],
      ['Total de pedidos', pedidos.length],
      ['Productos activos', productos.filter(p => p.activo).length],
      [],
      ['PEDIDOS POR ESTADO'],
      ['Estado', 'Cantidad', '% del total'],
      ...Object.entries(pedidosPorEstado).map(([estado, cantidad]) => [
        estado.charAt(0).toUpperCase() + estado.slice(1),
        cantidad,
        ((cantidad / pedidos.length) * 100).toFixed(1) + '%',
      ]),
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);

    // Estilos hoja Resumen
    wsResumen['A1'] = { v: "REPORTE DE VENTAS — LILY'S CAFFE", t: 's',
      s: { font: { bold: true, sz: 16, color: { rgb: '83401D' } } } };
    wsResumen['A4'] = { v: 'MÉTRICAS GENERALES', t: 's',
      s: { font: { bold: true, sz: 12, color: { rgb: '83401D' } } } };
    wsResumen['A10'] = { v: 'PEDIDOS POR ESTADO', t: 's',
      s: { font: { bold: true, sz: 12, color: { rgb: '83401D' } } } };

    // Encabezados de tablas en negrita
    ['A5', 'B5', 'A11', 'B11', 'C11'].forEach(cell => {
      if (wsResumen[cell]) {
        wsResumen[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: 'F5EDE0' } } };
      }
    });

    wsResumen['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // ══════════════════════════════════════════════════════════════════
    // HOJA 2 — PEDIDOS
    // ══════════════════════════════════════════════════════════════════
    const encabezadosPedidos = [
      'N° Pedido', 'Fecha', 'Hora', 'Cliente', 'Email',
      'Teléfono', 'Dirección', 'Distrito', 'Subtotal (S/)',
      'Envío (S/)', 'Total (S/)', 'Estado',
    ];

    const filasPedidos = pedidos.map(p => [
      p.id.slice(0, 8).toUpperCase(),
      new Date(p.created_at).toLocaleDateString('es-PE'),
      new Date(p.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      p.envio_nombre      ?? '—',
      p.email_invitado    ?? '—',
      p.envio_telefono    ?? '—',
      p.envio_direccion   ?? '—',
      p.envio_distrito    ?? '—',
      Number(p.subtotal   ?? 0).toFixed(2),
      Number(p.costo_envio ?? 0).toFixed(2),
      Number(p.total).toFixed(2),
      p.estado.charAt(0).toUpperCase() + p.estado.slice(1),
    ]);

    const wsPedidos = XLSX.utils.aoa_to_sheet([encabezadosPedidos, ...filasPedidos]);

    // Encabezado en negrita con fondo marrón claro
    encabezadosPedidos.forEach((_, i) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: i });
      wsPedidos[cell] = {
        v: encabezadosPedidos[i],
        t: 's',
        s: {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '83401D' } },
          alignment: { horizontal: 'center' },
        },
      };
    });

    // Color de fila según estado
    pedidos.forEach((p, rowIdx) => {
      const color = colorEstado[p.estado] ?? 'FFFFFF';
      encabezadosPedidos.forEach((_, colIdx) => {
        const cell = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        if (wsPedidos[cell]) {
          wsPedidos[cell].s = {
            fill: { fgColor: { rgb: color } },
            alignment: { horizontal: colIdx >= 8 ? 'right' : 'left' },
          };
        }
      });
    });

    wsPedidos['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 8 },  { wch: 22 },
      { wch: 28 }, { wch: 12 }, { wch: 32 }, { wch: 16 },
      { wch: 13 }, { wch: 10 }, { wch: 11 }, { wch: 12 },
    ];

    // Congelar fila de encabezado
    wsPedidos['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, wsPedidos, 'Pedidos');

    // ══════════════════════════════════════════════════════════════════
    // HOJA 3 — INVENTARIO
    // ══════════════════════════════════════════════════════════════════
    const encabezadosInventario = ['Producto', 'Precio (S/)', 'Stock', 'Estado'];

    const filasInventario = productos.map(p => [
      p.nombre,
      Number(p.precio).toFixed(2),
      p.stock,
      p.activo ? 'Activo' : 'Inactivo',
    ]);

    const wsInventario = XLSX.utils.aoa_to_sheet([encabezadosInventario, ...filasInventario]);

    // Encabezado en negrita
    encabezadosInventario.forEach((_, i) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: i });
      wsInventario[cell] = {
        v: encabezadosInventario[i],
        t: 's',
        s: {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '83401D' } },
          alignment: { horizontal: 'center' },
        },
      };
    });

    // Color filas según stock bajo o inactivo
    productos.forEach((p, rowIdx) => {
      const color = !p.activo ? 'F4CCCC' : p.stock < 10 ? 'FCE4D6' : 'FFFFFF';
      encabezadosInventario.forEach((_, colIdx) => {
        const cell = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        if (wsInventario[cell]) {
          wsInventario[cell].s = { fill: { fgColor: { rgb: color } } };
        }
      });
    });

    wsInventario['!cols'] = [{ wch: 30 }, { wch: 13 }, { wch: 10 }, { wch: 12 }];
    wsInventario['!freeze'] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, wsInventario, 'Inventario');

    // ── Descargar ───────────────────────────────────────────────────
    const fecha = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `lilyscaffe-reporte-${fecha}.xlsx`, { cellStyles: true });
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
          onClick={exportarExcel}
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
            display:         'flex',
            alignItems:      'center',
            gap:             '0.5rem',
          }}
        >
          <span>📊</span> Exportar Excel
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