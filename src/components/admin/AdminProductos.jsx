import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

const CATEGORIAS = ['cafe', 'cacao'];
const BUCKET     = 'Productos';

function AdminProductos() {
  const [productos,      setProductos]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [editando,       setEditando]       = useState(null);
  const [form,           setForm]           = useState({});
  const [guardando,      setGuardando]      = useState(false);
  const [mensaje,        setMensaje]        = useState(null);
  const [mostrarNuevo,   setMostrarNuevo]   = useState(false);
  const [formNuevo,      setFormNuevo]      = useState({
    nombre:      '',
    descripcion: '',
    precio:      '',
    stock:       '',
    categoria:   'cafe',
  });
  const [imagenNuevo,    setImagenNuevo]    = useState(null);
  const [previaNuevo,    setPreviaNuevo]    = useState(null);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

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
    setMostrarNuevo(false);
    setForm({
      nombre:      producto.nombre,
      descripcion: producto.descripcion,
      precio:      producto.precio,
      stock:       producto.stock,
      categoria:   producto.categoria,
      activo:      producto.activo,
    });
  }

  function cancelarEdicion() {
    setEditando(null);
    setForm({});
  }

  function handleImagenNuevo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImagenNuevo(file);
    setPreviaNuevo(URL.createObjectURL(file));
  }

  async function subirImagen(file, nombre) {
    const ext      = file.name.split('.').pop();
    const fileName = nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() + '.' + ext;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
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
        categoria:   form.categoria,
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

  async function guardarNuevoProducto() {
    if (!formNuevo.nombre || !formNuevo.precio || !formNuevo.stock) {
      setMensaje({ tipo: 'error', texto: 'Nombre, precio y stock son obligatorios.' });
      setTimeout(() => setMensaje(null), 3000);
      return;
    }
    setGuardandoNuevo(true);
    try {
      let imagen_url = null;
      if (imagenNuevo) {
        imagen_url = await subirImagen(imagenNuevo, formNuevo.nombre);
      }

      const { error } = await supabase
        .from('productos')
        .insert({
          nombre:      formNuevo.nombre.trim(),
          descripcion: formNuevo.descripcion.trim(),
          precio:      parseFloat(formNuevo.precio),
          stock:       parseInt(formNuevo.stock),
          categoria:   formNuevo.categoria,
          activo:      true,
          imagen_url,
        });

      if (error) throw error;

      setMensaje({ tipo: 'ok', texto: 'Producto creado correctamente.' });
      setMostrarNuevo(false);
      setFormNuevo({ nombre: '', descripcion: '', precio: '', stock: '', categoria: 'cafe' });
      setImagenNuevo(null);
      setPreviaNuevo(null);
      cargarProductos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al crear producto: ' + err.message });
    }
    setGuardandoNuevo(false);
    setTimeout(() => setMensaje(null), 4000);
  }

  async function toggleActivo(id, activo) {
    await supabase.from('productos').update({ activo: !activo }).eq('id', id);
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

  const labelStyle = {
    fontSize:     '0.78rem',
    fontWeight:   '600',
    color:        'var(--color-texto-muted)',
    display:      'block',
    marginBottom: '0.3rem',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-texto-muted)' }}>
      Cargando productos...
    </div>
  );

  return (
    <div>
      {/* Mensaje éxito/error */}
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

      {/* Botón agregar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => { setMostrarNuevo(!mostrarNuevo); setEditando(null); }}
          style={{
            backgroundColor: mostrarNuevo ? '#fee2e2' : 'var(--color-marron)',
            color:           mostrarNuevo ? '#991b1b' : 'var(--color-crema)',
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
          {mostrarNuevo ? '✕ Cancelar' : '＋ Agregar producto'}
        </button>
      </div>

      {/* Formulario nuevo producto */}
      {mostrarNuevo && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius:    'var(--radius-lg)',
          padding:         '1.5rem',
          boxShadow:       'var(--shadow-card)',
          marginBottom:    '1.5rem',
          border:          '2px solid var(--color-marron)',
        }}>
          <h3 style={{
            fontFamily:   'var(--font-heading)',
            color:        'var(--color-marron)',
            fontSize:     '1rem',
            marginBottom: '1.25rem',
          }}>
            Nuevo producto
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Imagen */}
            <div>
              <label style={labelStyle}>Imagen del producto</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {previaNuevo && (
                  <img
                    src={previaNuevo}
                    alt="Vista previa"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid #e0d5c8' }}
                  />
                )}
                {!previaNuevo && (
                  <div style={{
                    width:           '80px',
                    height:          '80px',
                    borderRadius:    'var(--radius-md)',
                    backgroundColor: 'var(--color-crema)',
                    border:          '2px dashed #e0d5c8',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    fontSize:        '1.5rem',
                  }}>
                    📷
                  </div>
                )}
                <label style={{
                  backgroundColor: 'var(--color-crema)',
                  color:           'var(--color-marron)',
                  border:          '1px solid #e0d5c8',
                  borderRadius:    'var(--radius-md)',
                  padding:         '0.5rem 1rem',
                  fontSize:        '0.825rem',
                  fontWeight:      '600',
                  fontFamily:      'var(--font-body)',
                  cursor:          'pointer',
                }}>
                  {imagenNuevo ? '📷 Cambiar imagen' : '📷 Seleccionar imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenNuevo}
                    style={{ display: 'none' }}
                  />
                </label>
                {imagenNuevo && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)' }}>
                    {imagenNuevo.name}
                  </span>
                )}
              </div>
            </div>

            {/* Nombre, Precio, Stock, Categoría */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  value={formNuevo.nombre}
                  onChange={e => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                  placeholder="Café Kametsa"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Precio (S/) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formNuevo.precio}
                  onChange={e => setFormNuevo({ ...formNuevo, precio: e.target.value })}
                  placeholder="20.00"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Stock *</label>
                <input
                  type="number"
                  min="0"
                  value={formNuevo.stock}
                  onChange={e => setFormNuevo({ ...formNuevo, stock: e.target.value })}
                  placeholder="50"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Categoría *</label>
                <select
                  value={formNuevo.categoria}
                  onChange={e => setFormNuevo({ ...formNuevo, categoria: e.target.value })}
                  style={selectStyle}
                >
                  {CATEGORIAS.map(c => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea
                value={formNuevo.descripcion}
                onChange={e => setFormNuevo({ ...formNuevo, descripcion: e.target.value })}
                placeholder="Describe el producto, origen, notas de cata..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setMostrarNuevo(false);
                  setFormNuevo({ nombre: '', descripcion: '', precio: '', stock: '', categoria: 'cafe' });
                  setImagenNuevo(null);
                  setPreviaNuevo(null);
                }}
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
              <button
                onClick={guardarNuevoProducto}
                disabled={guardandoNuevo}
                style={{
                  backgroundColor: guardandoNuevo ? 'var(--color-texto-muted)' : 'var(--color-marron)',
                  color:           'var(--color-crema)',
                  border:          'none',
                  borderRadius:    'var(--radius-md)',
                  padding:         '0.5rem 1.5rem',
                  fontSize:        '0.875rem',
                  fontWeight:      '600',
                  fontFamily:      'var(--font-body)',
                  cursor:          guardandoNuevo ? 'not-allowed' : 'pointer',
                }}
              >
                {guardandoNuevo ? 'Guardando...' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de productos */}
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

              {/* Imagen o placeholder */}
              {producto.imagen_url ? (
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width:           '80px',
                  height:          '80px',
                  borderRadius:    'var(--radius-md)',
                  backgroundColor: 'var(--color-crema)',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '1.5rem',
                  flexShrink:      0,
                }}>
                  📦
                </div>
              )}

              <div style={{ flex: 1 }}>
                {editando === producto.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={labelStyle}>Nombre</label>
                        <input
                          value={form.nombre}
                          onChange={e => setForm({ ...form, nombre: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Precio (S/)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.precio}
                          onChange={e => setForm({ ...form, precio: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={form.stock}
                          onChange={e => setForm({ ...form, stock: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Categoría</label>
                        <select
                          value={form.categoria}
                          onChange={e => setForm({ ...form, categoria: e.target.value })}
                          style={selectStyle}
                        >
                          {CATEGORIAS.map(c => (
                            <option key={c} value={c}>
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Descripción</label>
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
                          backgroundColor: guardando ? 'var(--color-texto-muted)' : 'var(--color-oliva)',
                          color:           '#fff',
                          border:          'none',
                          borderRadius:    'var(--radius-md)',
                          padding:         '0.5rem 1.25rem',
                          fontSize:        '0.875rem',
                          fontWeight:      '600',
                          fontFamily:      'var(--font-body)',
                          cursor:          guardando ? 'not-allowed' : 'pointer',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                        {producto.nombre}
                      </h3>
                      <p style={{ fontSize: '0.825rem', color: 'var(--color-texto-muted)', marginBottom: '0.5rem' }}>
                        {producto.descripcion}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
                          backgroundColor: 'var(--color-crema)',
                          color:           'var(--color-oliva)',
                          textTransform:   'capitalize',
                        }}>
                          {producto.categoria}
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