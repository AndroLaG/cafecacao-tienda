import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function Auth() {
  const params     = new URLSearchParams(window.location.search);
  const redirectTo = params.get('from') === 'checkout' ? '/checkout' : '/';

  const [modo, setModo]               = useState('login');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [nombre, setNombre]           = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showPass2, setShowPass2]     = useState(false);
  const [loadingLogin, setLoadingLogin]         = useState(false);
  const [loadingRegistro, setLoadingRegistro]   = useState(false);
  const [loadingGoogle, setLoadingGoogle]       = useState(false);
  const [loadingOtp, setLoadingOtp]             = useState(false);
  const [loadingReset, setLoadingReset]         = useState(false);
  const [error, setError]             = useState(null);
  const [mensaje, setMensaje]         = useState(null);

  // OTP
  const [otpEnviado, setOtpEnviado]   = useState(false);
  const [otp, setOtp]                 = useState('');
  const [segundos, setSegundos]       = useState(60);
  const [puedeReenviar, setPuedeReenviar] = useState(false);

  // Reset contraseña
  const [modoReset, setModoReset]     = useState(false);
  const [nuevaPass, setNuevaPass]     = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');

  // Turnstile
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [intentosFallidos, setIntentosFallidos] = useState(0);

  // ✅ Detectar token de reset en la URL
  useEffect(function() {
    var hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setModoReset(true);
    }

    // Supabase también puede venir con #access_token tras el recovery
    var hashParams = new URLSearchParams(hash.replace('#', ''));
    var type = hashParams.get('type');
    if (type === 'recovery') {
      setModoReset(true);
    }

    // Escuchar evento de Supabase para recovery
    var { data: { subscription } } = supabase.auth.onAuthStateChange(function(event) {
      if (event === 'PASSWORD_RECOVERY') {
        setModoReset(true);
      }
    });

    return function() { subscription.unsubscribe(); };
  }, []);

  // Resetear errores al cambiar de tab
  function cambiarModo(m) {
    setModo(m);
    setError(null);
    setMensaje(null);
    setLoadingLogin(false);
    setLoadingRegistro(false);
  }

  // Cargar Turnstile SDK
  useEffect(function() {
    if (!TURNSTILE_SITE_KEY) return;
    var script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    window.onTurnstileSuccess = function(token) { setTurnstileToken(token); };
    return function() {
      if (document.head.contains(script)) document.head.removeChild(script);
      delete window.onTurnstileSuccess;
    };
  }, []);

  // Temporizador OTP
  useEffect(function() {
    if (!otpEnviado) return;
    setSegundos(60);
    setPuedeReenviar(false);
    var intervalo = setInterval(function() {
      setSegundos(function(s) {
        if (s <= 1) { clearInterval(intervalo); setPuedeReenviar(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return function() { clearInterval(intervalo); };
  }, [otpEnviado]);

  // ── RESET CONTRASEÑA
  async function handleNuevaPassword(e) {
    e.preventDefault();
    setError(null);

    if (nuevaPass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevaPass !== confirmarPass) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoadingReset(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: nuevaPass });
      if (error) {
        setError('No se pudo actualizar la contraseña. Intenta de nuevo.');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setLoadingReset(false);
    }
  }

  // ── LOGIN
  async function handleLogin(e) {
    e.preventDefault();
    setError(null);

    if (intentosFallidos >= 3 && !turnstileToken) {
      setError('Por favor completa la verificación de seguridad.');
      return;
    }

    setLoadingLogin(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setIntentosFallidos(function(f) { return f + 1; });
        setError('Correo o contraseña incorrectos.');
        setTurnstileToken(null);
        if (window.turnstile) window.turnstile.reset();
      } else {
        window.location.href = redirectTo;
      }
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoadingLogin(false);
    }
  }

  // ── REGISTRO paso 1: enviar OTP
  async function handleRegistro(e) {
    e.preventDefault();
    setLoadingRegistro(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setError(error.message);
    } else {
      setOtpEnviado(true);
    }
    setLoadingRegistro(false);
  }

  // ── REGISTRO paso 2: verificar OTP
  async function handleVerificarOTP(e) {
    e.preventDefault();
    setLoadingOtp(true);
    setError(null);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type:  'email',
    });
    if (error) {
      setError('Código incorrecto o expirado. Intenta de nuevo.');
      setLoadingOtp(false);
      return;
    }
    if (data?.user) {
      if (password) await supabase.auth.updateUser({ password });
      await supabase.from('clientes').upsert({
        id:              data.user.id,
        nombre_completo: nombre,
      }, { onConflict: 'id' });
    }
    window.location.href = redirectTo;
  }

  // ── REENVIAR OTP
  async function handleReenviarOTP() {
    setPuedeReenviar(false);
    setOtp('');
    setError(null);
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setOtpEnviado(true);
  }

  // ── GOOGLE
  async function handleGoogle() {
    setLoadingGoogle(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + redirectTo },
    });
    if (error) {
      setError('No se pudo conectar con Google.');
      setLoadingGoogle(false);
    }
  }

  // ── OLVIDÉ CONTRASEÑA
  async function handleOlvidePassword() {
    if (!email) { setError('Escribe tu correo primero.'); return; }
    setLoadingLogin(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth',
    });
    if (error) {
      setError('No se pudo enviar el correo.');
    } else {
      setMensaje('Te enviamos un correo para restablecer tu contraseña.');
    }
    setLoadingLogin(false);
  }

  const inputStyle = {
    width:           '100%',
    padding:         '0.75rem 1rem',
    borderRadius:    'var(--radius-md)',
    border:          '1px solid #e0d5c8',
    fontFamily:      'var(--font-body)',
    fontSize:        '0.95rem',
    color:           'var(--color-texto)',
    backgroundColor: '#fff',
    outline:         'none',
  };

  function btnPrimary(disabled) {
    return {
      backgroundColor: disabled ? 'var(--color-texto-muted)' : 'var(--color-marron)',
      color:           'var(--color-crema)',
      border:          'none',
      borderRadius:    'var(--radius-md)',
      padding:         '0.875rem',
      fontSize:        '1rem',
      fontWeight:      '600',
      fontFamily:      'var(--font-body)',
      marginTop:       '0.5rem',
      cursor:          disabled ? 'not-allowed' : 'pointer',
      width:           '100%',
      transition:      'background-color 0.2s',
    };
  }

  return (
    <div style={{
      minHeight:       '100vh',
      backgroundColor: 'var(--color-crema)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '2rem',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius:    'var(--radius-lg)',
        boxShadow:       'var(--shadow-hover)',
        padding:         '2.5rem',
        width:           '100%',
        maxWidth:        '420px',
      }}>
        <h1 style={{
          fontFamily:   'var(--font-heading)',
          color:        'var(--color-marron)',
          fontSize:     '1.75rem',
          marginBottom: '0.5rem',
          textAlign:    'center',
        }}>
          Lily's Caffe
        </h1>

        {/* ── PANTALLA NUEVA CONTRASEÑA ── */}
        {modoReset ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
              <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Crea tu nueva contraseña
              </p>
            </div>

            <form onSubmit={handleNuevaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Nueva contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={nuevaPass}
                    onChange={function(e) { setNuevaPass(e.target.value); }}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    style={{ ...inputStyle, paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={function() { setShowPass(!showPass); }}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: '1rem',
                      color: 'var(--color-texto-muted)', padding: '0.25rem',
                    }}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Confirmar contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass2 ? 'text' : 'password'}
                    value={confirmarPass}
                    onChange={function(e) { setConfirmarPass(e.target.value); }}
                    placeholder="Repite tu contraseña"
                    required
                    minLength={6}
                    style={{
                      ...inputStyle,
                      paddingRight: '3rem',
                      borderColor: confirmarPass && nuevaPass !== confirmarPass ? 'var(--color-granate)' : '#e0d5c8',
                    }}
                  />
                  <button
                    type="button"
                    onClick={function() { setShowPass2(!showPass2); }}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: '1rem',
                      color: 'var(--color-texto-muted)', padding: '0.25rem',
                    }}
                  >
                    {showPass2 ? '🙈' : '👁️'}
                  </button>
                </div>
                {confirmarPass && nuevaPass !== confirmarPass && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-granate)', marginTop: '0.3rem' }}>
                    Las contraseñas no coinciden.
                  </p>
                )}
                {confirmarPass && nuevaPass === confirmarPass && (
                  <p style={{ fontSize: '0.78rem', color: '#166534', marginTop: '0.3rem' }}>
                    ✓ Las contraseñas coinciden.
                  </p>
                )}
              </div>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--color-granate)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingReset || nuevaPass !== confirmarPass || nuevaPass.length < 6}
                style={btnPrimary(loadingReset || nuevaPass !== confirmarPass || nuevaPass.length < 6)}
              >
                {loadingReset ? 'Guardando...' : 'Guardar nueva contraseña'}
              </button>
            </form>
          </div>

        ) : otpEnviado ? (
          /* ── PANTALLA OTP ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📧</div>
              <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Enviamos un código de verificación a<br />
                <strong style={{ color: 'var(--color-marron)' }}>{email}</strong>
              </p>
              <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Revisa también tu carpeta de spam.
              </p>
            </div>

            <form onSubmit={handleVerificarOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Código de verificación
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={function(e) { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); }}
                  placeholder="000000"
                  required
                  maxLength={6}
                  style={{
                    ...inputStyle,
                    fontSize:      '1.5rem',
                    textAlign:     'center',
                    letterSpacing: '0.5rem',
                    fontWeight:    '700',
                  }}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                {puedeReenviar ? (
                  <button type="button" onClick={handleReenviarOTP} style={{ background: 'none', border: 'none', color: 'var(--color-marron)', fontSize: '0.875rem', fontWeight: '600', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                    Reenviar código
                  </button>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-texto-muted)' }}>
                    Reenviar en <strong style={{ color: 'var(--color-marron)' }}>{segundos}s</strong>
                  </p>
                )}
              </div>

              {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--color-granate)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loadingOtp || otp.length < 6} style={btnPrimary(loadingOtp || otp.length < 6)}>
                {loadingOtp ? 'Verificando...' : 'Verificar código'}
              </button>

              <button type="button" onClick={function() { setOtpEnviado(false); setOtp(''); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--color-texto-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', cursor: 'pointer', textAlign: 'center' }}>
                ← Volver
              </button>
            </form>
          </div>

        ) : (
          /* ── PANTALLA PRINCIPAL ── */
          <>
            <p style={{ color: 'var(--color-texto-muted)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {modo === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
            </p>

            <button
              onClick={handleGoogle}
              disabled={loadingGoogle}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                border: '1px solid #e0d5c8', backgroundColor: '#fff',
                fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                fontWeight: '500', color: 'var(--color-texto)',
                cursor: loadingGoogle ? 'not-allowed' : 'pointer',
                marginBottom: '1.25rem', opacity: loadingGoogle ? 0.7 : 1,
                transition: 'background-color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={function(e) { e.currentTarget.style.backgroundColor = 'var(--color-crema)'; e.currentTarget.style.borderColor = 'var(--color-marron)'; }}
              onMouseLeave={function(e) { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e0d5c8'; }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {loadingGoogle ? 'Conectando...' : 'Continuar con Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d5c8' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)' }}>o continúa con email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d5c8' }} />
            </div>

            <div style={{ display: 'flex', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-crema)', padding: '4px', marginBottom: '1.5rem' }}>
              {['login', 'registro'].map(function(m) {
                return (
                  <button
                    key={m}
                    onClick={function() { cambiarModo(m); }}
                    style={{
                      flex: 1, padding: '0.5rem',
                      borderRadius: 'var(--radius-md)', border: 'none',
                      fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: '600',
                      backgroundColor: modo === m ? 'var(--color-marron)' : 'transparent',
                      color: modo === m ? 'var(--color-crema)' : 'var(--color-texto-muted)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                  </button>
                );
              })}
            </div>

            {modo === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>Correo electrónico</label>
                  <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="correo@ejemplo.com" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={function(e) { setPassword(e.target.value); }} placeholder="Tu contraseña" required style={{ ...inputStyle, paddingRight: '3rem' }} />
                    <button type="button" onClick={function() { setShowPass(!showPass); }} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-texto-muted)', padding: '0.25rem' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                  <button type="button" onClick={handleOlvidePassword} style={{ background: 'none', border: 'none', color: 'var(--color-oliva)', fontSize: '0.82rem', fontFamily: 'var(--font-body)', cursor: 'pointer', padding: 0 }}>
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                {intentosFallidos >= 3 && TURNSTILE_SITE_KEY && (
                  <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-callback="onTurnstileSuccess" data-theme="light" />
                )}
                {error && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--color-granate)', fontSize: '0.875rem' }}>
                    {error}
                    {intentosFallidos >= 2 && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                        ¿No recuerdas tu contraseña?{' '}
                        <button type="button" onClick={handleOlvidePassword} style={{ background: 'none', border: 'none', color: 'var(--color-marron)', fontWeight: '600', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: '0.8rem' }}>
                          Recupérala aquí
                        </button>
                      </p>
                    )}
                  </div>
                )}
                {mensaje && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: '#166534', fontSize: '0.875rem' }}>
                    {mensaje}
                  </div>
                )}
                <button type="submit" disabled={loadingLogin} style={btnPrimary(loadingLogin)}>
                  {loadingLogin ? 'Cargando...' : 'Iniciar sesión'}
                </button>
              </form>
            )}

            {modo === 'registro' && (
              <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>Nombre completo</label>
                  <input type="text" value={nombre} onChange={function(e) { setNombre(e.target.value); }} placeholder="Andrés Sánchez" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>Correo electrónico</label>
                  <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="correo@ejemplo.com" required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={function(e) { setPassword(e.target.value); }} placeholder="Mínimo 6 caracteres" required minLength={6} style={{ ...inputStyle, paddingRight: '3rem' }} />
                    <button type="button" onClick={function() { setShowPass(!showPass); }} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-texto-muted)', padding: '0.25rem' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)', marginTop: '0.3rem' }}>
                    Te enviaremos un código de verificación a tu correo.
                  </p>
                </div>
                {error && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--color-granate)', fontSize: '0.875rem' }}>
                    {error}
                  </div>
                )}
                <button type="submit" disabled={loadingRegistro} style={btnPrimary(loadingRegistro)}>
                  {loadingRegistro ? 'Enviando código...' : 'Crear cuenta'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;