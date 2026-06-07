import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { crearPedido } from '../services/orderService';
import { cargarSDKCulqi, abrirModalCulqi } from '../services/culqiService';
import { supabase } from '../services/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function Checkout() {
  const { items, subtotal, costoEnvio, total, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    nombre:        '',
    email:         '',
    telefono:      '',
    direccion:     '',
    distrito:      '',
    provincia:     '',
    departamento:  '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

useEffect(() => {
  cargarSDKCulqi();

  async function preRellenarDatos() {
    if (!user) return;

    // Pre-rellenar email
    setForm(f => ({ ...f, email: user.email }));

    // Buscar el último pedido del usuario para autocompletar dirección
    const { data: ultimoPedido } = await supabase
      .from('pedidos')
      .select('envio_nombre, envio_telefono, envio_direccion, envio_distrito, envio_provincia, envio_departamento')
      .eq('cliente_id', user.id)
      .not('envio_nombre', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (ultimoPedido) {
      setForm(f => ({
        ...f,
        nombre:       ultimoPedido.envio_nombre       ?? '',
        telefono:     ultimoPedido.envio_telefono     ?? '',
        direccion:    ultimoPedido.envio_direccion    ?? '',
        distrito:     ultimoPedido.envio_distrito     ?? '',
        provincia:    ultimoPedido.envio_provincia    ?? '',
        departamento: ultimoPedido.envio_departamento ?? '',
      }));
    }
  }

  preRellenarDatos();
}, [user]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pedido = await crearPedido({
        clienteId:     user?.id ?? null,
        emailInvitado: user ? null : form.email,
        items,
        subtotal,
        costoEnvio,
        total,
        datosEnvio:    form,
      });

      handlePago(pedido.id);

    } catch (err) {
      setError('Error al crear el pedido: ' + err.message);
      setLoading(false);
    }
  }

  async function handlePago(pedidoId) {
    abrirModalCulqi({
      total: total,
      email: user?.email ?? form.email,
      onToken: async (token) => {
        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase.functions.invoke('procesar-pago', {
            body: { pedido_id: pedidoId, culqi_token: token },
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          clearCart();
          window.location.href = '/orden-exitosa';
        } catch (err) {
          setError('Error al procesar el pago: ' + err.message);
        } finally {
          setLoading(false);
        }
      },
      onError: (msg) => {
        setError('Error en el pago: ' + msg);
      },
    });
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

  const labelStyle = {
    fontSize:     '0.85rem',
    fontWeight:   '600',
    color:        'var(--color-texto-muted)',
    display:      'block',
    marginBottom: '0.4rem',
  };

  if (items.length === 0 && !loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{
          flex:      1,
          textAlign: 'center',
          padding:   '4rem 1.5rem',
          color:     'var(--color-texto-muted)',
        }}>
          <p style={{ fontSize: '1.1rem' }}>Tu carrito está vacío.</p>
          <a href="/" style={{
            display:         'inline-block',
            marginTop:       '1rem',
            backgroundColor: 'var(--color-marron)',
            color:           'var(--color-crema)',
            padding:         '0.75rem 1.5rem',
            borderRadius:    'var(--radius-md)',
            fontWeight:      '600',
          }}>
            Ver productos
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{
        flex:     1,
        padding:  '2rem 1.5rem',
        maxWidth: '900px',
        margin:   '0 auto',
        width:    '100%',
      }}>
        <h2 style={{
          fontFamily:   'var(--font-heading)',
          color:        'var(--color-marron)',
          fontSize:     '1.5rem',
          marginBottom: '0.5rem',
        }}>
          Datos de envío
        </h2>

        {/* Mensaje si no está logueado */}
        {!user && (
          <p style={{
            fontSize:     '0.875rem',
            color:        'var(--color-texto-muted)',
            marginBottom: '1.5rem',
          }}>
            ¿Ya tienes cuenta?{' '}
            <a href="/auth" style={{ color: 'var(--color-marron)', fontWeight: '600' }}>
              Inicia sesión
            </a>{' '}
            para autocompletar tus datos. O continúa como invitado.
          </p>
        )}

        {user && (
          <p style={{
            fontSize:     '0.875rem',
            color:        'var(--color-texto-muted)',
            marginBottom: '1.5rem',
          }}>
            Comprando como <strong>{user.email}</strong>
          </p>
        )}

        {/* Aviso de cobertura de envío */}
<div style={{
  backgroundColor: '#fff8e1',
  border:          '1px solid #f59e0b',
  borderRadius:    'var(--radius-md)',
  padding:         '0.75rem 1rem',
  marginBottom:    '1.5rem',
  display:         'flex',
  alignItems:      'flex-start',
  gap:             '0.5rem',
}}>
  <span style={{ fontSize: '1rem', flexShrink: 0 }}>🚚</span>
  <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
    <strong>Zona de cobertura:</strong> Por el momento Lily's Caffe realiza envíos
    únicamente dentro de <strong>Lima Metropolitana</strong>. Si te encuentras en
    provincia, puedes contactarnos para coordinar una alternativa.
  </p>
</div>

        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap:                 '2rem',
          alignItems:          'start',
        }}>
          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Email — siempre visible */}
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                required
                readOnly={!!user}
                style={{
                  ...inputStyle,
                  backgroundColor: user ? '#f5f0e8' : '#fff',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Andrés Sánchez"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="999 999 999"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Dirección</label>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Av. Ejemplo 123, Dpto 4B"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Distrito</label>
                <input
                  name="distrito"
                  value={form.distrito}
                  onChange={handleChange}
                  placeholder="Miraflores"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Provincia</label>
                <input
                  name="provincia"
                  value={form.provincia}
                  onChange={handleChange}
                  placeholder="Lima"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Departamento</label>
                <input
                  name="departamento"
                  value={form.departamento}
                  onChange={handleChange}
                  placeholder="Lima"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

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
                width:           '100%',
                transition:      'background-color 0.2s',
              }}
            >
              {loading ? 'Procesando...' : `Confirmar y pagar — S/ ${total.toFixed(2)}`}
            </button>

            <p style={{
              fontSize:  '0.75rem',
              color:     'var(--color-texto-muted)',
              textAlign: 'center',
            }}>
              🔒 Pago seguro procesado por Culqi
            </p>
          </form>

          {/* Resumen del pedido */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius:    'var(--radius-lg)',
            boxShadow:       'var(--shadow-card)',
            padding:         '1.5rem',
            position:        'sticky',
            top:             '80px',
          }}>
            <h3 style={{
              fontFamily:   'var(--font-heading)',
              color:        'var(--color-marron)',
              fontSize:     '1.1rem',
              marginBottom: '1rem',
            }}>
              Resumen del pedido
            </h3>

            {items.map(item => (
              <div key={item.id} style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'center',
                padding:        '0.5rem 0',
                borderBottom:   '1px solid #f0e8de',
                fontSize:       '0.875rem',
              }}>
                <span style={{ color: 'var(--color-texto)' }}>
                  {item.nombre} × {item.cantidad}
                </span>
                <span style={{ fontWeight: '600', color: 'var(--color-marron)' }}>
                  S/ {(item.precio * item.cantidad).toFixed(2)}
                </span>
              </div>
            ))}

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-texto-muted)' }}>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-texto-muted)' }}>Envío</span>
                <span style={{ color: costoEnvio === 0 ? 'green' : 'inherit' }}>
                  {costoEnvio === 0 ? 'Gratis' : `S/ ${costoEnvio.toFixed(2)}`}
                </span>
              </div>
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                paddingTop:     '0.75rem',
                borderTop:      '2px solid var(--color-marron)',
              }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-marron)' }}>
                  S/ {total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;