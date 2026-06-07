import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import CartDrawer from '../cart/CartDrawer';

function Navbar() {
  const { totalItems } = useCart();
  const { user, cerrarSesion } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  const enlaces = [
    { label: 'Inicio',    href: '/'          },
    { label: 'Productos', href: '/#productos' },
    { label: 'Nosotros',  href: '/#nosotros'  },
    { label: 'Contacto',  href: '/#contacto'  },
  ];

  function handleNavClick(href) {
    setMenuOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = href;
    }
  }

  return (
    <>
      <nav style={{
        backgroundColor: 'var(--color-marron)',
        padding:         '1rem 1.5rem',
        display:         'flex',
        justifyContent:  'space-between',
        alignItems:      'center',
        position:        'sticky',
        top:             0,
        zIndex:          100,
      }}>
        {/* Logo */}
        <a href="/" style={{
          fontFamily:     'var(--font-heading)',
          color:          'var(--color-crema)',
          fontSize:       '1.4rem',
          fontWeight:     '700',
          textDecoration: 'none',
          flexShrink:     0,
        }}>
          Lily's Caffe
        </a>

        {/* Desktop menu */}
        <div className="desktop-menu" style={{
          display:    'flex',
          gap:        '1.5rem',
          alignItems: 'center',
        }}>
          {enlaces.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={e => { e.preventDefault(); handleNavClick(href); }}
              style={{
                color:          'var(--color-crema)',
                fontSize:       '0.95rem',
                opacity:        0.9,
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}

          {user ? (
            <>
              <span style={{ color: 'var(--color-crema)', fontSize: '0.82rem', opacity: 0.75 }}>
                {user.email}
              </span>
              <button onClick={cerrarSesion} style={{
                backgroundColor: 'transparent',
                color:           'var(--color-crema)',
                border:          '1px solid rgba(250,246,239,0.4)',
                borderRadius:    'var(--radius-pill)',
                padding:         '0.4rem 1rem',
                fontSize:        '0.85rem',
                fontFamily:      'var(--font-body)',
              }}>
                Salir
              </button>
            </>
          ) : (
            <a href="/auth" style={{ color: 'var(--color-crema)', fontSize: '0.95rem', opacity: 0.9 }}>
              Ingresar
            </a>
          )}

          <button onClick={() => setDrawerOpen(true)} style={{
            backgroundColor: 'var(--color-granate)',
            color:           'var(--color-crema)',
            border:          'none',
            borderRadius:    'var(--radius-pill)',
            padding:         '0.5rem 1.2rem',
            fontFamily:      'var(--font-body)',
            fontSize:        '0.9rem',
            display:         'flex',
            alignItems:      'center',
            gap:             '0.5rem',
          }}>
            🛒
            {totalItems > 0 && (
              <span style={{
                backgroundColor: 'var(--color-oliva)',
                borderRadius:    'var(--radius-pill)',
                padding:         '0.1rem 0.5rem',
                fontSize:        '0.75rem',
                fontWeight:      '600',
              }}>
                {totalItems}
              </span>
            )}
            Carrito
          </button>
        </div>

        {/* Mobile */}
        <div className="mobile-menu" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setDrawerOpen(true)} style={{
            backgroundColor: 'var(--color-granate)',
            color:           'var(--color-crema)',
            border:          'none',
            borderRadius:    'var(--radius-pill)',
            padding:         '0.45rem 1rem',
            fontFamily:      'var(--font-body)',
            fontSize:        '0.85rem',
            display:         'flex',
            alignItems:      'center',
            gap:             '0.4rem',
          }}>
            🛒
            {totalItems > 0 && (
              <span style={{
                backgroundColor: 'var(--color-oliva)',
                borderRadius:    'var(--radius-pill)',
                padding:         '0.1rem 0.45rem',
                fontSize:        '0.72rem',
                fontWeight:      '600',
              }}>
                {totalItems}
              </span>
            )}
          </button>

          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: 'none',
            border:     'none',
            color:      'var(--color-crema)',
            fontSize:   '1.5rem',
            lineHeight: 1,
            padding:    '0.25rem',
          }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          backgroundColor: 'var(--color-marron-claro)',
          padding:         '1rem 1.5rem',
          display:         'flex',
          flexDirection:   'column',
          gap:             '1rem',
          position:        'sticky',
          top:             '60px',
          zIndex:          99,
        }}>
          {enlaces.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={e => { e.preventDefault(); handleNavClick(href); }}
              style={{ color: 'var(--color-crema)', fontSize: '1rem', textDecoration: 'none' }}
            >
              {label}
            </a>
          ))}
          {user ? (
            <>
              <span style={{ color: 'var(--color-crema)', fontSize: '0.85rem', opacity: 0.75 }}>
                {user.email}
              </span>
              <button onClick={() => { cerrarSesion(); setMenuOpen(false); }} style={{
                backgroundColor: 'transparent',
                color:           'var(--color-crema)',
                border:          '1px solid rgba(250,246,239,0.4)',
                borderRadius:    'var(--radius-pill)',
                padding:         '0.5rem 1rem',
                fontFamily:      'var(--font-body)',
                fontSize:        '0.9rem',
                textAlign:       'left',
              }}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <a href="/auth" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-crema)', fontSize: '1rem' }}>
              Ingresar
            </a>
          )}
        </div>
      )}

      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <style>{`
        .desktop-menu { display: flex !important; }
        .mobile-menu  { display: none  !important; }
        @media (max-width: 640px) {
          .desktop-menu { display: none  !important; }
          .mobile-menu  { display: flex  !important; }
        }
      `}</style>
    </>
  );
}

export default Navbar;