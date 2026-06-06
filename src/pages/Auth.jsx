import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

function Auth() {
  const [modo, setModo]       = useState('login'); // 'login' | 'registro'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [mensaje, setMensaje] = useState(null);

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
        // Crear perfil en tabla clientes
        await supabase.from('clientes').insert({
          id:             data.user.id,
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

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #e0d5c8',
    fontFamily: 'var(--font-body)',
    fontSize: '0.95rem',
    color: 'var(--color-texto)',
    backgroundColor: '#fff',
    outline: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-crema)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-hover)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-marron)',
          fontSize: '1.75rem',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}>
          Lily's Caffe
        </h1>

        <p style={{
          color: 'var(--color-texto-muted)',
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '0.9rem',
        }}>
          {modo === 'login' ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta'}
        </p>

        {/* Tabs login/registro */}
        <div style={{
          display: 'flex',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-crema)',
          padding: '4px',
          marginBottom: '1.5rem',
        }}>
          {['login', 'registro'].map(m => (
            <button
              key={m}
              onClick={() => { setModo(m); setError(null); setMensaje(null); }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                fontWeight: '600',
                backgroundColor: modo === m ? 'var(--color-marron)' : 'transparent',
                color: modo === m ? 'var(--color-crema)' : 'var(--color-texto-muted)',
                transition: 'all 0.2s',
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

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: 'var(--color-granate)',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          {mensaje && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              color: '#166534',
              fontSize: '0.875rem',
            }}>
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? 'var(--color-texto-muted)' : 'var(--color-marron)',
              color: 'var(--color-crema)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.875rem',
              fontSize: '1rem',
              fontWeight: '600',
              fontFamily: 'var(--font-body)',
              marginTop: '0.5rem',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Cargando...' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;