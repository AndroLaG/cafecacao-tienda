import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function Perfil() {
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    nombre_completo: '',
    telefono:        '',
    direccion:       '',
    distrito:        '',
    provincia:       '',
    departamento:    '',
    codigo_postal:   '',
  });

  const [errores,   setErrores]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje,   setMensaje]   = useState(null);

  // Estados para cambio de contraseña
  const [showPassword,     setShowPassword]     = useState(false);
  const [passForm,         setPassForm]         = useState({ nueva: '', confirmar: '' });
  const [passErrores,      setPassErrores]      = useState({});
  const [guardandoPass,    setGuardandoPass]    = useState(false);
  const [mensajePass,      setMensajePass]      = useState(null);

  useEffect(() => {
    if (!user) return;
    async function cargarPerfil() {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm({
          nombre_completo: data.nombre_completo ?? '',
          telefono:        data.telefono        ?? '',
          direccion:       data.direccion       ?? '',
          distrito:        data.distrito        ?? '',
          provincia:       data.provincia       ?? '',
          departamento:    data.departamento    ?? '',
          codigo_postal:   data.codigo_postal   ?? '',
        });
      }
      setLoading(false);
    }
    cargarPerfil();
  }, [user]);

  function validarCampo(name, value) {
    switch (name) {
      case 'nombre_completo':
        if (!value.trim()) return 'El nombre es obligatorio.';
        if (value.trim().length < 3) return 'Mínimo 3 caracteres.';
        return '';
      case 'telefono':
        if (value && !/^\d{9}$/.test(value)) return 'Debe tener exactamente 9 dígitos.';
        return '';
      case 'codigo_postal':
        if (value && !/^\d{5}$/.test(value)) return 'Debe tener 5 dígitos.';
        return '';
      default:
        return '';
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    // Teléfono: solo números, máximo 9 dígitos
    if (name === 'telefono') {
      const soloNumeros = value.replace(/\D/g, '').slice(0, 9);
      setForm(f => ({ ...f, telefono: soloNumeros }));
      setErrores(err => ({ ...err, telefono: validarCampo('telefono', soloNumeros) }));
      return;
    }

    // Código postal: solo números, máximo 5 dígitos
    if (name === 'codigo_postal') {
      const soloNumeros = value.replace(/\D/g, '').slice(0, 5);
      setForm(f => ({ ...f, codigo_postal: soloNumeros }));
      setErrores(err => ({ ...err, codigo_postal: validarCampo('codigo_postal', soloNumeros) }));
      return;
    }

    setForm(f => ({ ...f, [name]: value }));
    setErrores(err => ({ ...err, [name]: validarCampo(name, value) }));
  }

  function validarFormulario() {
    const nuevosErrores = {};
    Object.keys(form).forEach(key => {
      const error = validarCampo(key, form[key]);
      if (error) nuevosErrores[key] = error;
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validarFormulario()) return;

    setGuardando(true);
    setMensaje(null);

    const { error } = await supabase
      .from('clientes')
      .upsert({ id: user.id, ...form });

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message });
    } else {
      setMensaje({ tipo: 'ok', texto: '¡Perfil actualizado correctamente!' });
    }

    setGuardando(false);
    setTimeout(() => setMensaje(null), 4000);
  }

  function handlePassChange(e) {
    const { name, value } = e.target;
    setPassForm(f => ({ ...f, [name]: value }));
    setPassErrores(err => ({ ...err, [name]: '' }));
  }

  async function handleCambiarPassword(e) {
    e.preventDefault();
    const errores = {};

    if (passForm.nueva.length < 6) errores.nueva = 'Mínimo 6 caracteres.';
    if (passForm.nueva !== passForm.confirmar) errores.confirmar = 'Las contraseñas no coinciden.';

    if (Object.keys(errores).length > 0) {
      setPassErrores(errores);
      return;
    }

    setGuardandoPass(true);
    setMensajePass(null);

    const { error } = await supabase.auth.updateUser({ password: passForm.nueva });

    if (error) {
      setMensajePass({ tipo: 'error', texto: 'Error: ' + error.message });
    } else {
      setMensajePass({ tipo: 'ok', texto: '¡Contraseña actualizada correctamente!' });
      setPassForm({ nueva: '', confirmar: '' });
    }

    setGuardandoPass(false);
    setTimeout(() => setMensajePass(null), 4000);
  }

  const inputStyle = (error) => ({
    width:           '100%',
    padding:         '0.75rem 1rem',
    borderRadius:    '8px',
    border:          error ? '1px solid var(--color-granate)' : '1px solid #e0d5c8',
    fontFamily:      'var(--font-body)',
    fontSize:        '0.95rem',
    color:           'var(--color-texto)',
    backgroundColor: '#fff',
    outline:         'none',
    transition:      'border-color 0.2s',
  });

  const labelStyle = {
    fontSize:     '0.85rem',
    fontWeight:   '600',
    color:        'var(--color-texto-muted)',
    display:      'block',
    marginBottom: '0.4rem',
  };

  const errorStyle = {
    fontSize:   '0.78rem',
    color:      'var(--color-granate)',
    marginTop:  '0.3rem',
    display:    'block',
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-texto-muted)' }}>Cargando perfil...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  // Detectar si el usuario usó Google (no tiene proveedor de contraseña)
  const usaGoogle = user.app_metadata?.provider === 'google';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Mi perfil
          </h1>
          <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.9rem' }}>
            {user.email}
          </p>
        </div>

        {mensaje && (
          <div style={{
            backgroundColor: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
            color:           mensaje.tipo === 'ok' ? '#166534' : '#991b1b',
            border:          mensaje.tipo === 'ok' ? '1px solid #bbf7d0' : '1px solid #fecaca',
            padding:         '0.875rem 1rem',
            borderRadius:    '8px',
            marginBottom:    '1.5rem',
            fontSize:        '0.9rem',
            fontWeight:      '600',
          }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Datos personales */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              Datos personales
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  name="nombre_completo"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  placeholder="Andrés Sánchez"
                  required
                  style={inputStyle(errores.nombre_completo)}
                />
                {errores.nombre_completo && <span style={errorStyle}>{errores.nombre_completo}</span>}
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-texto-muted)', fontSize: '0.9rem' }}>
                    +51
                  </span>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="999999999"
                    maxLength={9}
                    inputMode="numeric"
                    style={{ ...inputStyle(errores.telefono), paddingLeft: '3rem' }}
                  />
                </div>
                {errores.telefono
                  ? <span style={errorStyle}>{errores.telefono}</span>
                  : <span style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)', marginTop: '0.3rem', display: 'block' }}>
                      {form.telefono.length}/9 dígitos
                    </span>
                }
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              Dirección de envío
            </h2>
            <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Esta dirección se autocompletará en tu próxima compra.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Dirección</label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Av. Ejemplo 123, Dpto 4B"
                  style={inputStyle(errores.direccion)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Distrito</label>
                  <input
                    name="distrito"
                    value={form.distrito}
                    onChange={handleChange}
                    placeholder="Miraflores"
                    style={inputStyle(errores.distrito)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Provincia</label>
                  <input
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    placeholder="Lima"
                    style={inputStyle(errores.provincia)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Departamento</label>
                  <input
                    name="departamento"
                    value={form.departamento}
                    onChange={handleChange}
                    placeholder="Lima"
                    style={inputStyle(errores.departamento)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Código postal</label>
                  <input
                    name="codigo_postal"
                    value={form.codigo_postal}
                    onChange={handleChange}
                    placeholder="15001"
                    maxLength={5}
                    inputMode="numeric"
                    style={inputStyle(errores.codigo_postal)}
                  />
                  {errores.codigo_postal && <span style={errorStyle}>{errores.codigo_postal}</span>}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            style={{
              backgroundColor: guardando ? 'var(--color-texto-muted)' : 'var(--color-marron)',
              color:           '#fff',
              border:          'none',
              borderRadius:    '8px',
              padding:         '0.875rem',
              fontSize:        '1rem',
              fontWeight:      '600',
              fontFamily:      'var(--font-body)',
              cursor:          guardando ? 'not-allowed' : 'pointer',
              transition:      'background-color 0.2s',
            }}
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        {/* Sección cambio de contraseña */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPassword ? '1.25rem' : 0 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', margin: 0 }}>
                Cambiar contraseña
              </h2>
              {usaGoogle && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)', marginTop: '0.25rem' }}>
                  Tu cuenta usa Google. Puedes establecer una contraseña adicional.
                </p>
              )}
            </div>
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                backgroundColor: showPassword ? 'var(--color-crema)' : 'var(--color-marron)',
                color:           showPassword ? 'var(--color-marron)' : '#fff',
                border:          '1px solid var(--color-marron)',
                borderRadius:    '8px',
                padding:         '0.4rem 1rem',
                fontSize:        '0.85rem',
                fontWeight:      '600',
                fontFamily:      'var(--font-body)',
                cursor:          'pointer',
                flexShrink:      0,
              }}
            >
              {showPassword ? 'Cancelar' : 'Cambiar'}
            </button>
          </div>

          {showPassword && (
            <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mensajePass && (
                <div style={{
                  backgroundColor: mensajePass.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
                  color:           mensajePass.tipo === 'ok' ? '#166534' : '#991b1b',
                  padding:         '0.75rem 1rem',
                  borderRadius:    '8px',
                  fontSize:        '0.875rem',
                  fontWeight:      '600',
                }}>
                  {mensajePass.texto}
                </div>
              )}

              <div>
                <label style={labelStyle}>Nueva contraseña</label>
                <input
                  name="nueva"
                  type="password"
                  value={passForm.nueva}
                  onChange={handlePassChange}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  style={inputStyle(passErrores.nueva)}
                />
                {passErrores.nueva && <span style={errorStyle}>{passErrores.nueva}</span>}
              </div>

              <div>
                <label style={labelStyle}>Confirmar nueva contraseña</label>
                <input
                  name="confirmar"
                  type="password"
                  value={passForm.confirmar}
                  onChange={handlePassChange}
                  placeholder="Repite la contraseña"
                  required
                  style={inputStyle(passErrores.confirmar)}
                />
                {passErrores.confirmar && <span style={errorStyle}>{passErrores.confirmar}</span>}
              </div>

              <button
                type="submit"
                disabled={guardandoPass}
                style={{
                  backgroundColor: guardandoPass ? 'var(--color-texto-muted)' : 'var(--color-oliva)',
                  color:           '#fff',
                  border:          'none',
                  borderRadius:    '8px',
                  padding:         '0.75rem',
                  fontSize:        '0.95rem',
                  fontWeight:      '600',
                  fontFamily:      'var(--font-body)',
                  cursor:          guardandoPass ? 'not-allowed' : 'pointer',
                }}
              >
                {guardandoPass ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Perfil;