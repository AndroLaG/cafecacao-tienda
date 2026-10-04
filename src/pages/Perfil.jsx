import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const FORM_DIR_VACIO = {
  alias:        'Mi dirección',
  nombre:       '',
  telefono:     '',
  direccion:    '',
  referencia:   '',
  distrito:     '',
  provincia:    '',
  departamento: '',
  codigo_postal: '',
  es_principal: false,
};

function Perfil() {
  const { user, loading: authLoading } = useAuth();

  // Datos personales
  const [form, setForm] = useState({
    nombre_completo: '',
    telefono:        '',
  });
  const [errores,   setErrores]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje,   setMensaje]   = useState(null);

  // Direcciones
  const [direcciones,      setDirecciones]      = useState([]);
  const [formDir,          setFormDir]          = useState(FORM_DIR_VACIO);
  const [editandoId,       setEditandoId]       = useState(null);
  const [mostrarFormDir,   setMostrarFormDir]   = useState(false);
  const [guardandoDir,     setGuardandoDir]     = useState(false);
  const [mensajeDir,       setMensajeDir]       = useState(null);

  // Contraseña
  const [showPassword,  setShowPassword]  = useState(false);
  const [passForm,      setPassForm]      = useState({ nueva: '', confirmar: '' });
  const [passErrores,   setPassErrores]   = useState({});
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [mensajePass,   setMensajePass]   = useState(null);

  useEffect(() => {
    if (!user) return;
    cargarTodo();
  }, [user]);

  async function cargarTodo() {
    const [{ data: cliente }, { data: dirs }] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', user.id).single(),
      supabase.from('direcciones').select('*').eq('cliente_id', user.id)
        .order('es_principal', { ascending: false })
        .order('created_at',   { ascending: false }),
    ]);
    if (cliente) {
      setForm({
        nombre_completo: cliente.nombre_completo ?? '',
        telefono:        cliente.telefono        ?? '',
      });
    }
    setDirecciones(dirs ?? []);
    setLoading(false);
  }

  // ── Datos personales
  function validarCampo(name, value) {
    if (name === 'nombre_completo') {
      if (!value.trim()) return 'El nombre es obligatorio.';
      if (value.trim().length < 3) return 'Mínimo 3 caracteres.';
    }
    if (name === 'telefono') {
      if (value && !/^\d{9}$/.test(value)) return 'Debe tener exactamente 9 dígitos.';
    }
    return '';
  }

  function handleChange(e) {
    var name  = e.target.name;
    var value = e.target.value;
    if (name === 'telefono') {
      var soloNum = value.replace(/\D/g, '').slice(0, 9);
      setForm(function(f) { return { ...f, telefono: soloNum }; });
      setErrores(function(err) { return { ...err, telefono: validarCampo('telefono', soloNum) }; });
      return;
    }
    setForm(function(f) { return { ...f, [name]: value }; });
    setErrores(function(err) { return { ...err, [name]: validarCampo(name, value) }; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    var nuevosErrores = {};
    Object.keys(form).forEach(function(key) {
      var err = validarCampo(key, form[key]);
      if (err) nuevosErrores[key] = err;
    });
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setGuardando(true);
    setMensaje(null);
    var result = await supabase.from('clientes').upsert({ id: user.id, ...form });
    if (result.error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + result.error.message });
    } else {
      setMensaje({ tipo: 'ok', texto: '¡Perfil actualizado correctamente!' });
    }
    setGuardando(false);
    setTimeout(function() { setMensaje(null); }, 4000);
  }

  // ── Direcciones
  function handleChangeDir(e) {
    var name  = e.target.name;
    var value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (name === 'codigo_postal') {
      value = value.replace(/\D/g, '').slice(0, 5);
    }
    setFormDir(function(f) { return { ...f, [name]: value }; });
  }

  function iniciarNuevaDireccion() {
    setFormDir(FORM_DIR_VACIO);
    setEditandoId(null);
    setMostrarFormDir(true);
    setMensajeDir(null);
  }

  function iniciarEditarDireccion(dir) {
    setFormDir({
      alias:         dir.alias         ?? 'Mi dirección',
      nombre:        dir.nombre        ?? '',
      telefono:      dir.telefono      ?? '',
      direccion:     dir.direccion     ?? '',
      referencia:    dir.referencia    ?? '',
      distrito:      dir.distrito      ?? '',
      provincia:     dir.provincia     ?? '',
      departamento:  dir.departamento  ?? '',
      codigo_postal: dir.codigo_postal ?? '',
      es_principal:  dir.es_principal  ?? false,
    });
    setEditandoId(dir.id);
    setMostrarFormDir(true);
    setMensajeDir(null);
  }

  function cancelarFormDir() {
    setMostrarFormDir(false);
    setEditandoId(null);
    setFormDir(FORM_DIR_VACIO);
    setMensajeDir(null);
  }

  async function handleGuardarDireccion(e) {
    e.preventDefault();
    if (!formDir.nombre || !formDir.direccion || !formDir.distrito) {
      setMensajeDir({ tipo: 'error', texto: 'Nombre, dirección y distrito son obligatorios.' });
      return;
    }
    setGuardandoDir(true);
    setMensajeDir(null);

    var payload = {
      cliente_id:    user.id,
      alias:         formDir.alias        || 'Mi dirección',
      nombre:        formDir.nombre,
      telefono:      formDir.telefono     || null,
      direccion:     formDir.direccion,
      referencia:    formDir.referencia   || null,
      distrito:      formDir.distrito,
      provincia:     formDir.provincia    || null,
      departamento:  formDir.departamento || null,
      codigo_postal: formDir.codigo_postal || null,
      es_principal:  formDir.es_principal,
    };

    var result;
    if (editandoId) {
      result = await supabase.from('direcciones').update(payload).eq('id', editandoId);
    } else {
      var esPrimera = direcciones.length === 0;
      result = await supabase.from('direcciones').insert({ ...payload, es_principal: esPrimera || formDir.es_principal });
    }

    if (result.error) {
      setMensajeDir({ tipo: 'error', texto: 'Error al guardar: ' + result.error.message });
    } else {
      setMensajeDir({ tipo: 'ok', texto: editandoId ? 'Dirección actualizada.' : 'Dirección guardada.' });
      cancelarFormDir();
      cargarTodo();
    }
    setGuardandoDir(false);
  }

  async function handleEliminarDireccion(id) {
    await supabase.from('direcciones').delete().eq('id', id);
    cargarTodo();
  }

  // ── Contraseña
  function handlePassChange(e) {
    var name  = e.target.name;
    var value = e.target.value;
    setPassForm(function(f) { return { ...f, [name]: value }; });
    setPassErrores(function(err) { return { ...err, [name]: '' }; });
  }

  async function handleCambiarPassword(e) {
    e.preventDefault();
    var errores = {};
    if (passForm.nueva.length < 6)              errores.nueva     = 'Mínimo 6 caracteres.';
    if (passForm.nueva !== passForm.confirmar)   errores.confirmar = 'Las contraseñas no coinciden.';
    if (Object.keys(errores).length > 0) { setPassErrores(errores); return; }

    setGuardandoPass(true);
    setMensajePass(null);
    var result = await supabase.auth.updateUser({ password: passForm.nueva });
    if (result.error) {
      setMensajePass({ tipo: 'error', texto: 'Error: ' + result.error.message });
    } else {
      setMensajePass({ tipo: 'ok', texto: '¡Contraseña actualizada correctamente!' });
      setPassForm({ nueva: '', confirmar: '' });
    }
    setGuardandoPass(false);
    setTimeout(function() { setMensajePass(null); }, 4000);
  }

  // ── Estilos
  var inputStyle = function(error) {
    return {
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
    };
  };

  var labelStyle = {
    fontSize:     '0.85rem',
    fontWeight:   '600',
    color:        'var(--color-texto-muted)',
    display:      'block',
    marginBottom: '0.4rem',
  };

  var errorStyle = {
    fontSize:  '0.78rem',
    color:     'var(--color-granate)',
    marginTop: '0.3rem',
    display:   'block',
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

  if (!user) { window.location.href = '/auth'; return null; }

  var usaGoogle = user.app_metadata?.provider === 'google';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Mi perfil
          </h1>
          <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.9rem' }}>{user.email}</p>
        </div>

        {mensaje && (
          <div style={{ backgroundColor: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2', color: mensaje.tipo === 'ok' ? '#166534' : '#991b1b', border: mensaje.tipo === 'ok' ? '1px solid #bbf7d0' : '1px solid #fecaca', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '600' }}>
            {mensaje.texto}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Datos personales */}
          <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              Datos personales
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} placeholder="Andrés Sánchez" required style={inputStyle(errores.nombre_completo)} />
                {errores.nombre_completo && <span style={errorStyle}>{errores.nombre_completo}</span>}
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-texto-muted)', fontSize: '0.9rem' }}>+51</span>
                  <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="999999999" maxLength={9} inputMode="numeric" style={{ ...inputStyle(errores.telefono), paddingLeft: '3rem' }} />
                </div>
                {errores.telefono
                  ? <span style={errorStyle}>{errores.telefono}</span>
                  : <span style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)', marginTop: '0.3rem', display: 'block' }}>{form.telefono.length}/9 dígitos</span>
                }
              </div>
            </div>
            <button type="submit" disabled={guardando} style={{ marginTop: '1.25rem', backgroundColor: guardando ? 'var(--color-texto-muted)' : 'var(--color-marron)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontSize: '0.95rem', fontWeight: '600', fontFamily: 'var(--font-body)', cursor: guardando ? 'not-allowed' : 'pointer' }}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>

          {/* Mis direcciones */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', margin: 0 }}>
                Mis direcciones
              </h2>
              {!mostrarFormDir && (
                <button
                  onClick={iniciarNuevaDireccion}
                  style={{ backgroundColor: 'var(--color-marron)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
                >
                  + Nueva
                </button>
              )}
            </div>

            {/* Lista de direcciones */}
            {!mostrarFormDir && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {direcciones.length === 0 && (
                  <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                    No tienes direcciones guardadas.
                  </p>
                )}
                {direcciones.map(function(dir) {
                  return (
                    <div key={dir.id} style={{ border: dir.es_principal ? '2px solid var(--color-marron)' : '1px solid #e0d5c8', borderRadius: '8px', padding: '0.875rem 1rem', backgroundColor: dir.es_principal ? 'var(--color-crema)' : '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--color-marron)', marginBottom: '0.2rem' }}>
                            {dir.alias}
                            {dir.es_principal && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', backgroundColor: 'var(--color-oliva)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>
                                Principal
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-texto-muted)' }}>
                            {dir.nombre} — {dir.telefono && '+51 ' + dir.telefono}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-texto-muted)' }}>
                            {dir.direccion}, {dir.distrito}
                          </div>
                          {dir.referencia && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)', marginTop: '0.1rem' }}>
                              Ref: {dir.referencia}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '0.75rem' }}>
                          <button
                            onClick={function() { iniciarEditarDireccion(dir); }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-oliva)', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={function() { handleEliminarDireccion(dir.id); }}
                            style={{ background: 'none', border: 'none', color: 'var(--color-granate)', fontSize: '0.82rem', cursor: 'pointer', opacity: 0.8, fontFamily: 'var(--font-body)' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Formulario nueva/editar dirección */}
            {mostrarFormDir && (
              <form onSubmit={handleGuardarDireccion} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', margin: '0 0 0.25rem' }}>
                  {editandoId ? 'Editar dirección' : 'Nueva dirección'}
                </h3>

                {mensajeDir && (
                  <div style={{ backgroundColor: mensajeDir.tipo === 'ok' ? '#dcfce7' : '#fee2e2', color: mensajeDir.tipo === 'ok' ? '#166534' : '#991b1b', padding: '0.6rem 0.875rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                    {mensajeDir.texto}
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Alias</label>
                  <input name="alias" value={formDir.alias} onChange={handleChangeDir} placeholder="Casa, Trabajo, etc." style={inputStyle(false)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={labelStyle}>Nombre completo *</label>
                    <input name="nombre" value={formDir.nombre} onChange={handleChangeDir} placeholder="Andrés Sánchez" required style={inputStyle(false)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input name="telefono" value={formDir.telefono} onChange={handleChangeDir} placeholder="999 999 999" style={inputStyle(false)} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Dirección *</label>
                  <input name="direccion" value={formDir.direccion} onChange={handleChangeDir} placeholder="Av. Ejemplo 123, Dpto 4B" required style={inputStyle(false)} />
                </div>

                <div>
                  <label style={labelStyle}>Referencia</label>
                  <input name="referencia" value={formDir.referencia} onChange={handleChangeDir} placeholder="Frente al parque, cerca al mercado..." style={inputStyle(false)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.875rem' }}>
                  <div>
                    <label style={labelStyle}>Distrito *</label>
                    <input name="distrito" value={formDir.distrito} onChange={handleChangeDir} placeholder="Miraflores" required style={inputStyle(false)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Provincia</label>
                    <input name="provincia" value={formDir.provincia} onChange={handleChangeDir} placeholder="Lima" style={inputStyle(false)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Departamento</label>
                    <input name="departamento" value={formDir.departamento} onChange={handleChangeDir} placeholder="Lima" style={inputStyle(false)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cód. postal</label>
                    <input name="codigo_postal" value={formDir.codigo_postal} onChange={handleChangeDir} placeholder="15001" maxLength={5} inputMode="numeric" style={inputStyle(false)} />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-texto-muted)', cursor: 'pointer' }}>
                  <input type="checkbox" name="es_principal" checked={formDir.es_principal} onChange={handleChangeDir} style={{ accentColor: 'var(--color-marron)' }} />
                  Establecer como dirección principal
                </label>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" disabled={guardandoDir} style={{ flex: 1, backgroundColor: guardandoDir ? 'var(--color-texto-muted)' : 'var(--color-marron)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.95rem', fontWeight: '600', fontFamily: 'var(--font-body)', cursor: guardandoDir ? 'not-allowed' : 'pointer' }}>
                    {guardandoDir ? 'Guardando...' : editandoId ? 'Actualizar' : 'Guardar dirección'}
                  </button>
                  <button type="button" onClick={cancelarFormDir} style={{ backgroundColor: 'transparent', color: 'var(--color-texto-muted)', border: '1px solid #e0d5c8', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.875rem', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Cambiar contraseña */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPassword ? '1.25rem' : 0 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', margin: 0 }}>Cambiar contraseña</h2>
                {usaGoogle && <p style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)', marginTop: '0.25rem' }}>Tu cuenta usa Google. Puedes establecer una contraseña adicional.</p>}
              </div>
              <button onClick={function() { setShowPassword(!showPassword); }} style={{ backgroundColor: showPassword ? 'var(--color-crema)' : 'var(--color-marron)', color: showPassword ? 'var(--color-marron)' : '#fff', border: '1px solid var(--color-marron)', borderRadius: '8px', padding: '0.4rem 1rem', fontSize: '0.85rem', fontWeight: '600', fontFamily: 'var(--font-body)', cursor: 'pointer', flexShrink: 0 }}>
                {showPassword ? 'Cancelar' : 'Cambiar'}
              </button>
            </div>

            {showPassword && (
              <form onSubmit={handleCambiarPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mensajePass && (
                  <div style={{ backgroundColor: mensajePass.tipo === 'ok' ? '#dcfce7' : '#fee2e2', color: mensajePass.tipo === 'ok' ? '#166534' : '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600' }}>
                    {mensajePass.texto}
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Nueva contraseña</label>
                  <input name="nueva" type="password" value={passForm.nueva} onChange={handlePassChange} placeholder="Mínimo 6 caracteres" minLength={6} required style={inputStyle(passErrores.nueva)} />
                  {passErrores.nueva && <span style={errorStyle}>{passErrores.nueva}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Confirmar nueva contraseña</label>
                  <input name="confirmar" type="password" value={passForm.confirmar} onChange={handlePassChange} placeholder="Repite la contraseña" required style={inputStyle(passErrores.confirmar)} />
                  {passErrores.confirmar && <span style={errorStyle}>{passErrores.confirmar}</span>}
                </div>
                <button type="submit" disabled={guardandoPass} style={{ backgroundColor: guardandoPass ? 'var(--color-texto-muted)' : 'var(--color-oliva)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.95rem', fontWeight: '600', fontFamily: 'var(--font-body)', cursor: guardandoPass ? 'not-allowed' : 'pointer' }}>
                  {guardandoPass ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Perfil;