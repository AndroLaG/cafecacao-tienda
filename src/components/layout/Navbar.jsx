import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import CartDrawer from '../cart/CartDrawer';

function Navbar() {
  const { totalItems } = useCart();
  const { user, cerrarSesion } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav style={{
        backgroundColor: 'var(--color-marron)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <a href="/" style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-crema)',
          fontSize: '1.5rem',
          fontWeight: '700',
          textDecoration: 'none',
        }}>
          Café & Cacao Perú
        </a>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/" style={{
            color: 'var(--color-crema)',
            fontSize: '0.95rem',
            opacity: 0.9,
          }}>
            Inicio
          </a>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                color: 'var(--color-crema)',
                fontSize: '0.85rem',
                opacity: 0.8,
              }}>
                {user.email}
              </span>
              <button
                onClick={cerrarSesion}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-crema)',
                  border: '1px solid rgba(250,246,239,0.4)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.4rem 1rem',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)',
                  opacity: 0.9,
                }}
              >
                Salir
              </button>
            </div>
          ) : (
            <a href="/auth" style={{
              color: 'var(--color-crema)',
              fontSize: '0.95rem',
              opacity: 0.9,
            }}>
              Ingresar
            </a>
          )}

          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              backgroundColor: 'var(--color-granate)',
              color: 'var(--color-crema)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              padding: '0.5rem 1.2rem',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            🛒
            {totalItems > 0 && (
              <span style={{
                backgroundColor: 'var(--color-oliva)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.1rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}>
                {totalItems}
              </span>
            )}
            Carrito
          </button>
        </div>
      </nav>

      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

export default Navbar;