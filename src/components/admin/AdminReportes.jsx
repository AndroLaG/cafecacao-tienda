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

  async function exportarExcel() {
    if (!datos) return;
    const ExcelJS = (await import('exceljs')).default;
    const { pedidos, productos, totalVentas, pedidosPorEstado } = datos;

    const wb = new ExcelJS.Workbook();
    wb.creator  = "Lily's Caffe";
    wb.created  = new Date();

    // ── Paleta de colores ─────────────────────────────────────────────
    const MARRON       = '83401D';
    const MARRON_CLARO = '97522D';
    const CREMA        = 'FAF6EF';
    const BLANCO       = 'FFFFFF';

    const colorEstado = {
      pagado:     { bg: 'C6EFCE', fg: '166534' },
      preparando: { bg: 'FFEB9C', fg: '92400E' },
      enviado:    { bg: 'BDD7EE', fg: '1E3A5F' },
      entregado:  { bg: 'D9EAD3', fg: '14532D' },
      pendiente:  { bg: 'FCE4D6', fg: '991B1B' },
      cancelado:  { bg: 'F4CCCC', fg: '7F1D1D' },
    };

    function estiloEncabezado(bg, fg) {
      var bgColor = bg || MARRON;
      var fgColor = fg || BLANCO;
      return {
        font:      { bold: true, color: { argb: fgColor }, size: 11 },
        fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top:    { style: 'thin', color: { argb: MARRON_CLARO } },
          bottom: { style: 'thin', color: { argb: MARRON_CLARO } },
          left:   { style: 'thin', color: { argb: MARRON_CLARO } },
          right:  { style: 'thin', color: { argb: MARRON_CLARO } },
        },
      };
    }

    function estiloCelda(bg, alineacion) {
      var bgColor = bg || BLANCO;
      var align   = alineacion || 'left';
      return {
        fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } },
        alignment: { horizontal: align, vertical: 'middle' },
        border: {
          top:    { style: 'hair', color: { argb: 'E0D5C8' } },
          bottom: { style: 'hair', color: { argb: 'E0D5C8' } },
          left:   { style: 'hair', color: { argb: 'E0D5C8' } },
          right:  { style: 'hair', color: { argb: 'E0D5C8' } },
        },
      };
    }

    // ══════════════════════════════════════════════════════════════════
    // HOJA 1 — RESUMEN
    // ══════════════════════════════════════════════════════════════════
    var wsResumen = wb.addWorksheet('Resumen');
    wsResumen.columns = [{ width: 32 }, { width: 20 }, { width: 16 }];

    wsResumen.mergeCells('A1:C1');
    var titulo = wsResumen.getCell('A1');
    titulo.value = "REPORTE DE VENTAS — LILY'S CAFFE";
    titulo.style = {
      font:      { bold: true, size: 16, color: { argb: BLANCO } },
      fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: MARRON } },
      alignment: { horizontal: 'center', vertical: 'middle' },
    };
    wsResumen.getRow(1).height = 36;

    wsResumen.mergeCells('A2:C2');
    var subtitulo = wsResumen.getCell('A2');
    subtitulo.value = 'Generado el ' + new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    subtitulo.style = {
      font:      { italic: true, color: { argb: MARRON_CLARO }, size: 10 },
      fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: CREMA } },
      alignment: { horizontal: 'center' },
    };
    wsResumen.getRow(2).height = 20;
    wsResumen.addRow([]);

    wsResumen.mergeCells('A4:C4');
    var secMetricas = wsResumen.getCell('A4');
    secMetricas.value = 'MÉTRICAS GENERALES';
    secMetricas.style = {
      font: { bold: true, size: 12, color: { argb: MARRON } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: CREMA } },
    };
    wsResumen.getRow(4).height = 22;

    var encMetricas = wsResumen.addRow(['Indicador', 'Valor', '']);
    encMetricas.eachCell(function(cell, col) {
      if (col <= 2) cell.style = estiloEncabezado();
    });
    wsResumen.getRow(5).height = 20;

    var metricas = [
      ['Ventas totales (S/)', 'S/ ' + totalVentas.toFixed(2)],
      ['Total de pedidos',    pedidos.length],
      ['Productos activos',   productos.filter(function(p) { return p.activo; }).length],
    ];
    metricas.forEach(function(fila, i) {
      var row = wsResumen.addRow([fila[0], fila[1], '']);
      var bg  = i % 2 === 0 ? BLANCO : CREMA;
      row.getCell(1).style = Object.assign({}, estiloCelda(bg));
      row.getCell(2).style = Object.assign({}, estiloCelda(bg, 'center'), { font: { bold: true, color: { argb: MARRON } } });
      row.height = 18;
    });

    wsResumen.addRow([]);

    var nextRow = wsResumen.rowCount + 1;
    wsResumen.mergeCells('A' + nextRow + ':C' + nextRow);
    var secEstados = wsResumen.getCell('A' + nextRow);
    secEstados.value = 'PEDIDOS POR ESTADO';
    secEstados.style = {
      font: { bold: true, size: 12, color: { argb: MARRON } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: CREMA } },
    };

    var encEstados = wsResumen.addRow(['Estado', 'Cantidad', '% del total']);
    encEstados.eachCell(function(cell) { cell.style = estiloEncabezado(); });

    Object.entries(pedidosPorEstado).forEach(function(entry, i) {
      var estado   = entry[0];
      var cantidad = entry[1];
      var pct  = ((cantidad / pedidos.length) * 100).toFixed(1) + '%';
      var bg   = i % 2 === 0 ? BLANCO : CREMA;
      var col  = colorEstado[estado] || { bg: BLANCO, fg: '000000' };
      var row  = wsResumen.addRow([
        estado.charAt(0).toUpperCase() + estado.slice(1),
        cantidad,
        pct,
      ]);
      row.getCell(1).style = Object.assign({}, estiloCelda(col.bg), { font: { bold: true, color: { argb: col.fg } } });
      row.getCell(2).style = Object.assign({}, estiloCelda(bg, 'center'), { font: { bold: true } });
      row.getCell(3).style = estiloCelda(bg, 'center');
      row.height = 18;
    });

    // ══════════════════════════════════════════════════════════════════
    // HOJA 2 — PEDIDOS
    // ══════════════════════════════════════════════════════════════════
    var wsPedidos = wb.addWorksheet('Pedidos');
    wsPedidos.columns = [
      { header: 'N° Pedido',    key: 'id',        width: 13 },
      { header: 'Fecha',        key: 'fecha',      width: 13 },
      { header: 'Hora',         key: 'hora',       width: 9  },
      { header: 'Cliente',      key: 'cliente',    width: 22 },
      { header: 'Email',        key: 'email',      width: 28 },
      { header: 'Teléfono',     key: 'telefono',   width: 13 },
      { header: 'Dirección',    key: 'direccion',  width: 34 },
      { header: 'Distrito',     key: 'distrito',   width: 18 },
      { header: 'Subtotal (S/)',key: 'subtotal',   width: 14 },
      { header: 'Envío (S/)',   key: 'envio',      width: 11 },
      { header: 'Total (S/)',   key: 'total',      width: 12 },
      { header: 'Estado',       key: 'estado',     width: 13 },
    ];

    wsPedidos.getRow(1).eachCell(function(cell) { cell.style = estiloEncabezado(); });
    wsPedidos.getRow(1).height = 22;
    wsPedidos.views = [{ state: 'frozen', ySplit: 1 }];

    pedidos.forEach(function(p) {
      var col = colorEstado[p.estado] || { bg: BLANCO, fg: '000000' };
      var row = wsPedidos.addRow({
        id:        p.id.slice(0, 8).toUpperCase(),
        fecha:     new Date(p.created_at).toLocaleDateString('es-PE'),
        hora:      new Date(p.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        cliente:   p.envio_nombre      || '—',
        email:     p.email_invitado    || '—',
        telefono:  p.envio_telefono    || '—',
        direccion: p.envio_direccion   || '—',
        distrito:  p.envio_distrito    || '—',
        subtotal:  Number(p.subtotal   || 0).toFixed(2),
        envio:     Number(p.costo_envio || 0).toFixed(2),
        total:     Number(p.total).toFixed(2),
        estado:    p.estado.charAt(0).toUpperCase() + p.estado.slice(1),
      });
      row.eachCell(function(cell, colNum) {
        var esNumero = colNum >= 9 && colNum <= 11;
        var esEstado = colNum === 12;
        cell.style = Object.assign({}, estiloCelda(col.bg, esNumero ? 'right' : 'left'), {
          font: esEstado
            ? { bold: true, color: { argb: col.fg } }
            : { color: { argb: '333333' } },
        });
      });
      row.height = 17;
    });

    // ══════════════════════════════════════════════════════════════════
    // HOJA 3 — INVENTARIO
    // ══════════════════════════════════════════════════════════════════
    var wsInventario = wb.addWorksheet('Inventario');
    wsInventario.columns = [
      { header: 'Producto',    key: 'nombre', width: 30 },
      { header: 'Precio (S/)',key: 'precio', width: 14 },
      { header: 'Stock',       key: 'stock',  width: 10 },
      { header: 'Estado',      key: 'estado', width: 12 },
    ];

    wsInventario.getRow(1).eachCell(function(cell) { cell.style = estiloEncabezado(); });
    wsInventario.getRow(1).height = 22;
    wsInventario.views = [{ state: 'frozen', ySplit: 1 }];

    productos.forEach(function(p, i) {
      var bg  = !p.activo ? 'F4CCCC' : p.stock < 10 ? 'FCE4D6' : i % 2 === 0 ? BLANCO : CREMA;
      var row = wsInventario.addRow({
        nombre: p.nombre,
        precio: Number(p.precio).toFixed(2),
        stock:  p.stock,
        estado: p.activo ? 'Activo' : 'Inactivo',
      });
      row.eachCell(function(cell, colNum) {
        cell.style = Object.assign({}, estiloCelda(bg, colNum >= 2 ? 'center' : 'left'), {
          font: colNum === 3 && p.stock < 10
            ? { bold: true, color: { argb: '991B1B' } }
            : { color: { argb: '333333' } },
        });
      });
      row.height = 17;
    });

    // ── Descargar ────────────────────────────────────────────────────
    var buffer = await wb.xlsx.writeBuffer();
    var blob   = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    var url = URL.createObjectURL(blob);
    var a   = document.createElement('a');
    a.href     = url;
    a.download = 'lilyscaffe-reporte-' + new Date().toISOString().slice(0, 10) + '.xlsx';
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