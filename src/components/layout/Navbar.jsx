import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import CartDrawer from '../cart/CartDrawer';

function Navbar() {
  const { totalItems } = useCart();
  const { user, primerNombre, cerrarSesion } = useAuth();
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [hoveredLink,  setHoveredLink]  = useState(null);

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
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = href;
      }
    } else {
      window.location.href = href;
    }
  }

  const linkStyle = (label) => ({
    color:          'var(--color-crema)',
    fontSize:       '0.95rem',
    textDecoration: 'none',
    position:       'relative',
    paddingBottom:  '4px',
    opacity:        hoveredLink === label ? 1 : 0.9,
    transition:     'opacity 0.2s',
  });

  const underlineStyle = (label) => ({
    position:        'absolute',
    bottom:          0,
    left:            0,
    width:           hoveredLink === label ? '100%' : '0%',
    height:          '2px',
    backgroundColor: 'var(--color-crema)',
    borderRadius:    'var(--radius-pill)',
    transition:      'width 0.25s ease',
  });

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
          transition:     'opacity 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Lily's Caffe
        </a>

        {/* Desktop menu */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {enlaces.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={e => { e.preventDefault(); handleNavClick(href); }}
              onMouseEnter={() => setHoveredLink(label)}
              onMouseLeave={() => setHoveredLink(null)}
              style={linkStyle(label)}
            >
              {label}
              <span style={underlineStyle(label)} />
            </a>
          ))}

          {user ? (
            <>
              <a
                href="/mis-pedidos"
                onMouseEnter={() => setHoveredLink('mis-pedidos')}
                onMouseLeave={() => setHoveredLink(null)}
                style={linkStyle('mis-pedidos')}
              >
                Mis Pedidos
                <span style={underlineStyle('mis-pedidos')} />
              </a>

              {/* Saludo con primer nombre */}
              <span style={{
                color:      'var(--color-crema)',
                fontSize:   '0.88rem',
                opacity:    0.85,
                fontWeight: '500',
              }}>
                Hola, {primerNombre ?? user.email.split('@')[0]} 👋
              </span>

              <button
                onClick={cerrarSesion}
                style={{
                  backgroundColor: 'transparent',
                  color:           'var(--color-crema)',
                  border:          '1px solid rgba(250,246,239,0.4)',
                  borderRadius:    'var(--radius-pill)',
                  padding:         '0.4rem 1rem',
                  fontSize:        '0.85rem',
                  fontFamily:      'var(--font-body)',
                  transition:      'background-color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(250,246,239,0.15)';
                  e.currentTarget.style.borderColor = 'rgba(250,246,239,0.8)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(250,246,239,0.4)';
                }}
              >
                Salir
              </button>
            </>
          ) : (
            <a
              href="/auth"
              onMouseEnter={() => setHoveredLink('ingresar')}
              onMouseLeave={() => setHoveredLink(null)}
              style={linkStyle('ingresar')}
            >
              Ingresar
              <span style={underlineStyle('ingresar')} />
            </a>
          )}

          <button
            onClick={() => setDrawerOpen(true)}
            style={{
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
              transition:      'background-color 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#a32b3e';
              e.currentTarget.style.transform = 'scale(1.04)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--color-granate)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
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
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
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
              transition:      'background-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a32b3e'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-granate)'}
          >
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

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background:  'none',
              border:      'none',
              color:       'var(--color-crema)',
              fontSize:    '1.5rem',
              lineHeight:  1,
              padding:     '0.25rem',
              transition:  'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
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
              style={{ color: 'var(--color-crema)', fontSize: '1rem', textDecoration: 'none', transition: 'opacity 0.2s, padding-left 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.paddingLeft = '6px'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.paddingLeft = '0px'; }}
            >
              {label}
            </a>
          ))}

          {user ? (
            <>
              <a
                href="/mis-pedidos"
                onClick={() => setMenuOpen(false)}
                style={{ color: 'var(--color-crema)', fontSize: '1rem', textDecoration: 'none', transition: 'opacity 0.2s, padding-left 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; e.currentTarget.style.paddingLeft = '6px'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.paddingLeft = '0px'; }}
              >
                Mis Pedidos
              </a>

              <span style={{ color: 'var(--color-crema)', fontSize: '0.9rem', opacity: 0.85, fontWeight: '500' }}>
                Hola, {primerNombre ?? user.email.split('@')[0]} 👋
              </span>

              <button
                onClick={() => { cerrarSesion(); setMenuOpen(false); }}
                style={{
                  backgroundColor: 'transparent',
                  color:           'var(--color-crema)',
                  border:          '1px solid rgba(250,246,239,0.4)',
                  borderRadius:    'var(--radius-pill)',
                  padding:         '0.5rem 1rem',
                  fontFamily:      'var(--font-body)',
                  fontSize:        '0.9rem',
                  textAlign:       'left',
                  transition:      'background-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(250,246,239,0.12)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <a
              href="/auth"
              onClick={() => setMenuOpen(false)}
              style={{ color: 'var(--color-crema)', fontSize: '1rem', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
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