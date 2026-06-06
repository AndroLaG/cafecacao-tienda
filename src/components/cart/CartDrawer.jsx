import { useCart } from '../../context/CartContext';

function CartDrawer({ isOpen, onClose }) {
  const { items, subtotal, costoEnvio, total, removeItem, updateQty, clearCart } = useCart();

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 200,
          }}
        />
      )}

      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 'min(420px, 100vw)',
        backgroundColor: '#fff',
        zIndex: 201,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(131,64,29,0.15)',
      }}>

        {/* Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #f0e8de',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-marron)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-crema)',
            fontSize: '1.25rem',
          }}>
            Tu carrito
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-crema)',
              fontSize: '1.5rem',
              lineHeight: 1,
              opacity: 0.8,
            }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem'}}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 0',
              color: 'var(--color-texto-muted)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem 0',
                borderBottom: '1px solid #f0e8de',
              }}>
                <img
                  src={item.imagen_url}
                  alt={item.nombre}
                  style={{
                    width: '70px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: '600',
                    color: 'var(--color-marron)',
                    fontSize: '0.9rem',
                    marginBottom: '0.25rem',
                  }}>
                    {item.nombre}
                  </p>
                  <p style={{
                    color: 'var(--color-texto-muted)',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                  }}>
                    S/ {item.precio.toFixed(2)}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateQty(item.id, item.cantidad - 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-marron-claro)',
                        backgroundColor: '#fff',
                        color: 'var(--color-marron)',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.cantidad + 1)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-marron-claro)',
                        backgroundColor: '#fff',
                        color: 'var(--color-marron)',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-granate)',
                        fontSize: '0.8rem',
                        opacity: 0.7,
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con totales */}
        {items.length > 0 && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #f0e8de',
            backgroundColor: 'var(--color-crema)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--color-texto-muted)', fontSize: '0.9rem' }}>Subtotal</span>
              <span style={{ fontWeight: '600' }}>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-texto-muted)', fontSize: '0.9rem' }}>Envío</span>
              <span style={{ fontWeight: '600', color: costoEnvio === 0 ? 'green' : 'inherit' }}>
                {costoEnvio === 0 ? 'Gratis' : `S/ ${costoEnvio.toFixed(2)}`}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e0d5c8',
            }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-marron)' }}>
                S/ {total.toFixed(2)}
              </span>
            </div>

            <button
            onClick={() => { onClose(); window.location.href = '/checkout'; }}
            style={{
              width:           '100%',
              backgroundColor: 'var(--color-marron)',
              color:           'var(--color-crema)',
              border:          'none',
              borderRadius:    'var(--radius-md)',
              padding:         '0.875rem',
              fontSize:        '1rem',
              fontWeight:      '600',
              fontFamily:      'var(--font-body)',
            marginBottom:    '0.75rem',
  }}
  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-marron-claro)'}
  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-marron)'}
>
  Proceder al pago
</button>
            <button
              onClick={clearCart}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: 'var(--color-texto-muted)',
                border: '1px solid #e0d5c8',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-body)',
              }}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;