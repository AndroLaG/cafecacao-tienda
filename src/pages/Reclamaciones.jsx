import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function Reclamaciones() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    tipo:        'reclamo',
    nombre:      '',
    email:       user?.email ?? '',
    telefono:    '',
    dni:         '',
    pedido_id:   '',
    producto:    '',
    descripcion: '',
  });

  const [errores,   setErrores]   = useState({});
  const [enviando,  setEnviando]  = useState(false);
  const [enviado,   setEnviado]   = useState(false);
  const [error,     setError]     = useState(null);
  const [nroReclamo, setNroReclamo] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === 'telefono') {
      const soloNum = value.replace(/\D/g, '').slice(0, 9);
      setForm(f => ({ ...f, telefono: soloNum }));
      return;
    }
    if (name === 'dni') {
      const soloNum = value.replace(/\D/g, '').slice(0, 8);
      setForm(f => ({ ...f, dni: soloNum }));
      return;
    }

    setForm(f => ({ ...f, [name]: value }));
    setErrores(err => ({ ...err, [name]: '' }));
  }

  function validar() {
    const e = {};
    if (!form.nombre.trim())      e.nombre      = 'El nombre es obligatorio.';
    if (!form.email.trim())       e.email       = 'El correo es obligatorio.';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido.';
    if (!form.descripcion.trim()) e.descripcion = 'Describe tu reclamo o queja.';
    if (form.descripcion.trim().length < 20) e.descripcion = 'Mínimo 20 caracteres.';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    setError(null);

    const { data, error: dbError } = await supabase
      .from('reclamos')
      .insert({
        tipo:        form.tipo,
        nombre:      form.nombre.trim(),
        email:       form.email.trim(),
        telefono:    form.telefono || null,
        dni:         form.dni || null,
        pedido_id:   form.pedido_id || null,
        producto:    form.producto || null,
        descripcion: form.descripcion.trim(),
      })
      .select('id')
      .single();

    if (dbError) {
      setError('Error al enviar. Por favor inténtalo de nuevo.');
    } else {
      setNroReclamo(data.id.slice(0, 8).toUpperCase());
      setEnviado(true);
    }

    setEnviando(false);
  }

  const inputStyle = (err) => ({
    width:           '100%',
    padding:         '0.75rem 1rem',
    borderRadius:    '8px',
    border:          err ? '1px solid var(--color-granate)' : '1px solid #e0d5c8',
    fontFamily:      'var(--font-body)',
    fontSize:        '0.95rem',
    color:           'var(--color-texto)',
    backgroundColor: '#fff',
    outline:         'none',
  });

  const labelStyle = {
    fontSize:     '0.85rem',
    fontWeight:   '600',
    color:        'var(--color-texto-muted)',
    display:      'block',
    marginBottom: '0.4rem',
  };

  const errorStyle = {
    fontSize:  '0.78rem',
    color:     'var(--color-granate)',
    marginTop: '0.3rem',
    display:   'block',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '3rem 1.5rem', maxWidth: '700px', margin: '0 auto', width: '100%' }}>

        {/* Encabezado */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily:   'var(--font-heading)',
            color:        'var(--color-marron)',
            fontSize:     'clamp(1.75rem, 4vw, 2.25rem)',
            marginBottom: '0.5rem',
          }}>
            Libro de Reclamaciones
          </h1>
          <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Conforme al <strong>Código de Protección y Defensa del Consumidor (Ley N° 29571)</strong>,
            Lily's Caffe pone a tu disposición el presente Libro de Reclamaciones virtual.
            Tu reclamo o queja será atendido en un plazo máximo de <strong>15 días hábiles</strong>.
          </p>
        </div>

        {enviado ? (
          /* Confirmación de envío */
          <div style={{
            backgroundColor: '#f0fdf4',
            border:          '1px solid #bbf7d0',
            borderRadius:    '16px',
            padding:         '2.5rem',
            textAlign:       'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#166534', fontSize: '1.4rem', marginBottom: '0.75rem' }}>
              Reclamo registrado
            </h2>
            <p style={{ color: '#166534', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              Tu número de reclamo es:
            </p>
            <div style={{
              fontFamily:      'var(--font-heading)',
              fontSize:        '1.75rem',
              fontWeight:      '700',
              color:           'var(--color-marron)',
              backgroundColor: 'var(--color-crema)',
              padding:         '0.75rem 2rem',
              borderRadius:    '8px',
              display:         'inline-block',
              marginBottom:    '1.25rem',
              letterSpacing:   '2px',
            }}>
              #{nroReclamo}
            </div>
            <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Guarda este número. Te contactaremos a <strong>{form.email}</strong> en un plazo
              máximo de 15 días hábiles.
            </p>
            <button
              onClick={() => { setEnviado(false); setForm({ tipo: 'reclamo', nombre: '', email: user?.email ?? '', telefono: '', dni: '', pedido_id: '', producto: '', descripcion: '' }); }}
              style={{
                backgroundColor: 'var(--color-marron)',
                color:           '#fff',
                border:          'none',
                borderRadius:    '8px',
                padding:         '0.75rem 2rem',
                fontSize:        '0.95rem',
                fontWeight:      '600',
                fontFamily:      'var(--font-body)',
                cursor:          'pointer',
              }}
            >
              Nuevo reclamo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Tipo */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '1rem' }}>
                Tipo de registro
              </h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['reclamo', 'queja'].map(function(t) {
                  return (
                    <label
                      key={t}
                      style={{
                        flex:            1,
                        display:         'flex',
                        alignItems:      'center',
                        gap:             '0.5rem',
                        padding:         '0.875rem 1rem',
                        borderRadius:    '8px',
                        border:          form.tipo === t ? '2px solid var(--color-marron)' : '1px solid #e0d5c8',
                        backgroundColor: form.tipo === t ? 'var(--color-crema)' : '#fff',
                        cursor:          'pointer',
                        transition:      'all 0.2s',
                      }}
                    >
                      <input
                        type="radio"
                        name="tipo"
                        value={t}
                        checked={form.tipo === t}
                        onChange={handleChange}
                        style={{ accentColor: 'var(--color-marron)' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-marron)', textTransform: 'capitalize' }}>{t}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-texto-muted)' }}>
                          {t === 'reclamo' ? 'Disconformidad con producto o servicio' : 'Malestar sin disconformidad directa'}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)', marginTop: '0.75rem' }}>
                <strong>Reclamo:</strong> disconformidad relacionada a los productos o servicios adquiridos. <br />
                <strong>Queja:</strong> malestar o descontento respecto a la atención al cliente.
              </p>
            </div>

            {/* Datos del consumidor */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '1rem' }}>
                Datos del consumidor
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Nombre completo *</label>
                    <input
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Andrés Sánchez"
                      style={inputStyle(errores.nombre)}
                    />
                    {errores.nombre && <span style={errorStyle}>{errores.nombre}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>DNI</label>
                    <input
                      name="dni"
                      value={form.dni}
                      onChange={handleChange}
                      placeholder="12345678"
                      maxLength={8}
                      inputMode="numeric"
                      style={inputStyle(errores.dni)}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Correo electrónico *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="correo@ejemplo.com"
                      style={inputStyle(errores.email)}
                    />
                    {errores.email && <span style={errorStyle}>{errores.email}</span>}
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="999999999"
                      maxLength={9}
                      inputMode="numeric"
                      style={inputStyle(errores.telefono)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Detalle del reclamo */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '1rem' }}>
                Detalle del {form.tipo}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Número de pedido</label>
                    <input
                      name="pedido_id"
                      value={form.pedido_id}
                      onChange={handleChange}
                      placeholder="Ej: ABC12345"
                      style={inputStyle(false)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Producto involucrado</label>
                    <input
                      name="producto"
                      value={form.producto}
                      onChange={handleChange}
                      placeholder="Ej: Café Kametsa"
                      style={inputStyle(false)}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Descripción del {form.tipo} *</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder={`Describe detalladamente tu ${form.tipo}...`}
                    rows={5}
                    style={{ ...inputStyle(errores.descripcion), resize: 'vertical', lineHeight: 1.6 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                    {errores.descripcion
                      ? <span style={errorStyle}>{errores.descripcion}</span>
                      : <span />
                    }
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-muted)' }}>
                      {form.descripcion.length} caracteres
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso legal */}
            <div style={{
              backgroundColor: '#fff8e1',
              border:          '1px solid #f59e0b',
              borderRadius:    '8px',
              padding:         '0.875rem 1rem',
              fontSize:        '0.82rem',
              color:           '#92400e',
              lineHeight:      1.6,
            }}>
              📋 De conformidad con el <strong>Código de Protección y Defensa del Consumidor (Ley N° 29571)</strong>,
              Lily's Caffe atenderá tu {form.tipo} en un plazo no mayor a <strong>15 días hábiles</strong>.
              La presentación de este registro no impide acudir a otras vías de solución de controversias.
            </div>

            {error && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.875rem 1rem', color: '#991b1b', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              style={{
                backgroundColor: enviando ? 'var(--color-texto-muted)' : 'var(--color-marron)',
                color:           '#fff',
                border:          'none',
                borderRadius:    '8px',
                padding:         '0.875rem',
                fontSize:        '1rem',
                fontWeight:      '600',
                fontFamily:      'var(--font-body)',
                cursor:          enviando ? 'not-allowed' : 'pointer',
                transition:      'background-color 0.2s',
              }}
            >
              {enviando ? 'Enviando...' : 'Enviar ' + form.tipo}
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Reclamaciones;