import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { crearPedido } from '../services/orderService';
import Navbar from '../components/layout/Navbar';

function Checkout() {
  const { items, subtotal, costoEnvio, total, clearCart } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    nombre:       '',
    telefono:     '',
    direccion:    '',
    distrito:     '',
    provincia:    '',
    departamento: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await crearPedido({
        clienteId:  user.id,
        items,
        subtotal,
        costoEnvio,
        total,
        datosEnvio: form,
      });

      clearCart();
      window.location.href = '/orden-exitosa';
    } catch (err) {
      setError('Error al crear el pedido: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width:        '100%',
    padding:      '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border:       '1px solid #e0d5c8',
    fontFamily:   'var(--font-body)',
    fontSize:     '0.95rem',
    color:        'var(--color-texto)',
    backgroundColor: '#fff',
    outline:      'none',
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
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-texto-muted)' }}>
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
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{
        maxWidth:  '900px',
        margin:    '2rem auto',
        padding:   '0 1.5rem',
        display:   'grid',
        gridTemplateColumns: '1fr 360px',
        gap:       '2rem',
        alignItems: 'start',
      }}>

        {/* Formulario de envío */}
        <div>
          <h2 style={{
            fontFamily:    'var(--font-heading)',
            color:         'var(--color-marron)',
            fontSize:      '1.5rem',
            marginBottom:  '1.5rem',
          }}>
            Datos de envío
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                marginTop:       '0.5rem',
                transition:      'background-color 0.2s',
              }}
            >
              {loading ? 'Procesando...' : 'Confirmar pedido — S/ ' + total.toFixed(2)}
            </button>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius:    'var(--radius-lg)',
          boxShadow:       'var(--shadow-card)',
          padding:         '1.5rem',
          position:        'sticky',
          top:             '90px',
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
              display:       'flex',
              justifyContent: 'space-between',
              alignItems:    'center',
              padding:       '0.5rem 0',
              borderBottom:  '1px solid #f0e8de',
              fontSize:      '0.875rem',
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
    </div>
  );
}

export default Checkout;