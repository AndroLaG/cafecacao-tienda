import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

function Auth() {
  const [modo, setModo]         = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError]       = useState(null);
  const [mensaje, setMensaje]   = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMensaje(null);

    if (modo === 'registro') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        await supabase.from('clientes').insert({
          id:              data.user.id,
          nombre_completo: nombre,
        });
        setMensaje('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
        setModo('login');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError('Correo o contraseña incorrectos.');
      } else {
        window.location.href = '/';
      }
    }

    setLoading(false);
  }

  async function handleGoogle() {
    setLoadingGoogle(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setError('No se pudo conectar con Google. Intenta de nuevo.');
      setLoadingGoogle(false);
    }
    // Si no hay error, Google redirige automáticamente
  }

  async function handleOlvidePassword() {
    if (!email) {
      setError('Escribe tu correo electrónico primero.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      setError('No se pudo enviar el correo. Verifica tu email.');
    } else {
      setMensaje('Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
    }
    setLoading(false);
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

        <p style={{
          color:        'var(--color-texto-muted)',
          textAlign:    'center',
          marginBottom: '2rem',
          fontSize:     '0.9rem',
        }}>
          {modo === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
        </p>

        {/* Botón Google */}
        <button
          onClick={handleGoogle}
          disabled={loadingGoogle}
          style={{
            width:           '100%',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            gap:             '0.75rem',
            padding:         '0.75rem 1rem',
            borderRadius:    'var(--radius-md)',
            border:          '1px solid #e0d5c8',
            backgroundColor: '#fff',
            fontFamily:      'var(--font-body)',
            fontSize:        '0.95rem',
            fontWeight:      '500',
            color:           'var(--color-texto)',
            cursor:          loadingGoogle ? 'not-allowed' : 'pointer',
            transition:      'background-color 0.2s, border-color 0.2s',
            marginBottom:    '1.25rem',
            opacity:         loadingGoogle ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-crema)';
            e.currentTarget.style.borderColor = 'var(--color-marron)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.borderColor = '#e0d5c8';
          }}
        >
          {/* Ícono Google SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          {loadingGoogle ? 'Conectando...' : 'Continuar con Google'}
        </button>

        {/* Divisor */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d5c8' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)' }}>o continúa con email</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d5c8' }} />
        </div>

        {/* Tabs login/registro */}
        <div style={{
          display:         'flex',
          borderRadius:    'var(--radius-md)',
          backgroundColor: 'var(--color-crema)',
          padding:         '4px',
          marginBottom:    '1.5rem',
        }}>
          {['login', 'registro'].map(m => (
            <button
              key={m}
              onClick={() => { setModo(m); setError(null); setMensaje(null); }}
              style={{
                flex:            1,
                padding:         '0.5rem',
                borderRadius:    'var(--radius-md)',
                border:          'none',
                fontFamily:      'var(--font-body)',
                fontSize:        '0.9rem',
                fontWeight:      '600',
                backgroundColor: modo === m ? 'var(--color-marron)' : 'transparent',
                color:           modo === m ? 'var(--color-crema)' : 'var(--color-texto-muted)',
                transition:      'all 0.2s',
              }}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modo === 'registro' && (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Andrés Sánchez"
                required
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-texto-muted)', display: 'block', marginBottom: '0.4rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              style={inputStyle}
            />
          </div>

          {/* Olvidé mi contraseña — solo en login */}
          {modo === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <button
                type="button"
                onClick={handleOlvidePassword}
                style={{
                  background:  'none',
                  border:      'none',
                  color:       'var(--color-oliva)',
                  fontSize:    '0.82rem',
                  fontFamily:  'var(--font-body)',
                  cursor:      'pointer',
                  padding:     0,
                  transition:  'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-marron)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-oliva)'}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border:          '1px solid #fecaca',
              borderRadius:    'var(--radius-md)',
              padding:         '0.75rem 1rem',
              color:           'var(--color-granate)',
              fontSize:        '0.875rem',
            }}>
              {error}
            </div>
          )}

          {mensaje && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border:          '1px solid #bbf7d0',
              borderRadius:    'var(--radius-md)',
              padding:         '0.75rem 1rem',
              color:           '#166534',
              fontSize:        '0.875rem',
            }}>
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? 'var(--color-texto-muted)' : 'var(--color-marron)',
              color:           'var(--color-crema)',
              border:          'none',
              borderRadius:    'var(--radius-md)',
              padding:         '0.875rem',
              fontSize:        '1rem',
              fontWeight:      '600',
              fontFamily:      'var(--font-body)',
              marginTop:       '0.5rem',
              transition:      'background-color 0.2s',
              cursor:          loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-marron-claro)'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--color-marron)'; }}
          >
            {loading ? 'Cargando...' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;