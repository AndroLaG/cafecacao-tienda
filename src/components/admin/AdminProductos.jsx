import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editando,  setEditando]  = useState(null);
  const [form,      setForm]      = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje,   setMensaje]   = useState(null);

  useEffect(() => { cargarProductos(); }, []);

  async function cargarProductos() {
    setLoading(true);
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: true });
    setProductos(data ?? []);
    setLoading(false);
  }

  function iniciarEdicion(producto) {
    setEditando(producto.id);
    setForm({
      nombre:      producto.nombre,
      descripcion: producto.descripcion,
      precio:      producto.precio,
      stock:       producto.stock,
      activo:      producto.activo,
    });
  }

  function cancelarEdicion() {
    setEditando(null);
    setForm({});
  }

  async function guardarCambios(id) {
    setGuardando(true);
    const { error } = await supabase
      .from('productos')
      .update({
        nombre:      form.nombre,
        descripcion: form.descripcion,
        precio:      parseFloat(form.precio),
        stock:       parseInt(form.stock),
        activo:      form.activo,
      })
      .eq('id', id);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message });
    } else {
      setMensaje({ tipo: 'ok', texto: 'Producto actualizado correctamente.' });
      setEditando(null);
      cargarProductos();
    }
    setGuardando(false);
    setTimeout(() => setMensaje(null), 3000);
  }

  async function toggleActivo(id, activo) {
    await supabase
      .from('productos')
      .update({ activo: !activo })
      .eq('id', id);
    cargarProductos();
  }

  const inputStyle = {
    width:           '100%',
    padding:         '0.5rem 0.75rem',
    borderRadius:    'var(--radius-md)',
    border:          '1px solid #e0d5c8',
    fontFamily:      'var(--font-body)',
    fontSize:        '0.875rem',
    color:           'var(--color-texto)',
    backgroundColor: '#fff',
    outline:         'none',
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-texto-muted)' }}>
      Cargando productos...
    </div>
  );

  return (
    <div>
      {mensaje && (
        <div style={{
          backgroundColor: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
          color:           mensaje.tipo === 'ok' ? '#166534' : '#991b1b',
          padding:         '0.75rem 1rem',
          borderRadius:    'var(--radius-md)',
          marginBottom:    '1rem',
          fontSize:        '0.875rem',
          fontWeight:      '600',
        }}>
          {mensaje.texto}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {productos.map(producto => (
          <div key={producto.id} style={{
            backgroundColor: '#fff',
            borderRadius:    'var(--radius-lg)',
            padding:         '1.25rem',
            boxShadow:       'var(--shadow-card)',
            border:          producto.activo ? 'none' : '2px dashed #e0d5c8',
            opacity:         producto.activo ? 1 : 0.7,
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
              />

              <div style={{ flex: 1 }}>
                {editando === producto.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre</label>
                        <input
                          value={form.nombre}
                          onChange={e => setForm({ ...form, nombre: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.3rem' }}>Precio (S/)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.precio}
                          onChange={e => setForm({ ...form, precio: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.3rem' }}>Stock</label>
                        <input
                          type="number"
                          value={form.stock}
                          onChange={e => setForm({ ...form, stock: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.3rem' }}>Descripción</label>
                      <textarea
                        value={form.descripcion}
                        onChange={e => setForm({ ...form, descripcion: e.target.value })}
                        rows={2}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => guardarCambios(producto.id)}
                        disabled={guardando}
                        style={{
                          backgroundColor: 'var(--color-oliva)',
                          color:           '#fff',
                          border:          'none',
                          borderRadius:    'var(--radius-md)',
                          padding:         '0.5rem 1.25rem',
                          fontSize:        '0.875rem',
                          fontWeight:      '600',
                          fontFamily:      'var(--font-body)',
                          cursor:          'pointer',
                        }}
                      >
                        {guardando ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        style={{
                          backgroundColor: 'transparent',
                          color:           'var(--color-texto-muted)',
                          border:          '1px solid #e0d5c8',
                          borderRadius:    'var(--radius-md)',
                          padding:         '0.5rem 1.25rem',
                          fontSize:        '0.875rem',
                          fontFamily:      'var(--font-body)',
                          cursor:          'pointer',
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                          {producto.nombre}
                        </h3>
                        <p style={{ fontSize: '0.825rem', color: 'var(--color-texto-muted)', marginBottom: '0.5rem' }}>
                          {producto.descripcion}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-marron)' }}>
                            S/ {Number(producto.precio).toFixed(2)}
                          </span>
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-texto-muted)' }}>
                            Stock: <strong>{producto.stock}</strong>
                          </span>
                          <span style={{
                            fontSize:        '0.78rem',
                            fontWeight:      '600',
                            padding:         '0.2rem 0.6rem',
                            borderRadius:    'var(--radius-pill)',
                            backgroundColor: producto.activo ? '#dcfce7' : '#fee2e2',
                            color:           producto.activo ? '#166534' : '#991b1b',
                          }}>
                            {producto.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <button
                          onClick={() => iniciarEdicion(producto)}
                          style={{
                            backgroundColor: 'var(--color-crema)',
                            color:           'var(--color-marron)',
                            border:          '1px solid #e0d5c8',
                            borderRadius:    'var(--radius-md)',
                            padding:         '0.4rem 1rem',
                            fontSize:        '0.825rem',
                            fontWeight:      '600',
                            fontFamily:      'var(--font-body)',
                            cursor:          'pointer',
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => toggleActivo(producto.id, producto.activo)}
                          style={{
                            backgroundColor: producto.activo ? '#fee2e2' : '#dcfce7',
                            color:           producto.activo ? '#991b1b' : '#166534',
                            border:          'none',
                            borderRadius:    'var(--radius-md)',
                            padding:         '0.4rem 1rem',
                            fontSize:        '0.825rem',
                            fontWeight:      '600',
                            fontFamily:      'var(--font-body)',
                            cursor:          'pointer',
                          }}
                        >
                          {producto.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminProductos;