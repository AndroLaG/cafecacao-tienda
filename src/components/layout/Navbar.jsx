import { useState, useRef, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import CartDrawer from '../cart/CartDrawer';

const ADMIN_EMAIL = 'lilyscaffe26@gmail.com';

function Navbar() {
  const { totalItems } = useCart();
  const { user, primerNombre, cerrarSesion } = useAuth();
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const submenuRef = useRef(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const enlaces = [
    { label: 'Inicio',    href: '/'          },
    { label: 'Productos', href: '/#productos' },
    { label: 'Nosotros',  href: '/#nosotros'  },
    { label: 'Contacto',  href: '/#contacto'  },
  ];

  // Cerrar submenú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (submenuRef.current && !submenuRef.current.contains(e.target)) {
        setSubmenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const submenuItemStyle = {
    display:        'flex',
    alignItems:     'center',
    gap:            '0.5rem',
    padding:        '0.6rem 1rem',
    fontSize:       '0.875rem',
    color:          'var(--color-texto)',
    textDecoration: 'none',
    borderRadius:   'var(--radius-md)',
    transition:     'background-color 0.15s',
    cursor:         'pointer',
    border:         'none',
    backgroundColor: 'transparent',
    width:          '100%',
    textAlign:      'left',
    fontFamily:     'var(--font-body)',
  };

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
          {enlaces.map((enlace) => (
            
              key={enlace.label}
              href={enlace.href}
              onClick={e => { e.preventDefault(); handleNavClick(enlace.href); }}
              onMouseEnter={() => setHoveredLink(enlace.label)}
              onMouseLeave={() => setHoveredLink(null)}
              style={linkStyle(enlace.label)}
            >
              {enlace.label}
              <span style={underlineStyle(enlace.label)} />
            </a>
          ))}

          {user ? (
            <div ref={submenuRef} style={{ position: 'relative' }}>
              {/* Botón saludo */}
              <button
                onClick={() => setSubmenuOpen(!submenuOpen)}
                style={{
                  backgroundColor: submenuOpen ? 'rgba(250,246,239,0.15)' : 'transparent',
                  color:           'var(--color-crema)',
                  border:          '1px solid rgba(250,246,239,0.4)',
                  borderRadius:    'var(--radius-pill)',
                  padding:         '0.4rem 1rem',
                  fontSize:        '0.875rem',
                  fontWeight:      '500',
                  fontFamily:      'var(--font-body)',
                  display:         'flex',
                  alignItems:      'center',
                  gap:             '0.4rem',
                  cursor:          'pointer',
                  transition:      'background-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(250,246,239,0.15)'}
                onMouseLeave={e => { if (!submenuOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Hola, {primerNombre ?? user.email.split('@')[0]} 👋
                <span style={{ fontSize: '0.7rem', opacity: 0.8, transition: 'transform 0.2s', transform: submenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
              </button>

              {/* Submenú desplegable */}
              {submenuOpen && (
                <div style={{
                  position:        'absolute',
                  top:             'calc(100% + 8px)',
                  right:           0,
                  backgroundColor: '#fff',
                  borderRadius:    'var(--radius-lg)',
                  boxShadow:       '0 8px 32px rgba(131,64,29,0.18)',
                  minWidth:        '200px',
                  padding:         '0.5rem',
                  zIndex:          200,
                  border:          '1px solid #f0e8de',
                }}>
                  {/* Header del submenú */}
                  <div style={{
                    padding:      '0.5rem 1rem 0.75rem',
                    borderBottom: '1px solid #f0e8de',
                    marginBottom: '0.5rem',
                  }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)', margin: 0 }}>
                      {user.email}
                    </p>
                    {isAdmin && (
                      <span style={{
                        fontSize:        '0.72rem',
                        backgroundColor: 'var(--color-marron)',
                        color:           '#fff',
                        padding:         '0.1rem 0.5rem',
                        borderRadius:    'var(--radius-pill)',
                        fontWeight:      '600',
                        marginTop:       '0.25rem',
                        display:         'inline-block',
                      }}>
                        Administrador
                      </span>
                    )}
                  </div>

                  {/* Opciones del submenú */}
                  
                    href="/perfil"
                    onClick={() => setSubmenuOpen(false)}
                    style={submenuItemStyle}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-crema)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    👤 Perfil
                  </a>

                  
                    href="/mis-pedidos"
                    onClick={() => setSubmenuOpen(false)}
                    style={submenuItemStyle}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-crema)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    📦 Mis pedidos
                  </a>

                  {isAdmin && (
                    
                      href="/admin"
                      onClick={() => setSubmenuOpen(false)}
                      style={{ ...submenuItemStyle, color: 'var(--color-marron)', fontWeight: '600' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-crema)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      ⚙️ Panel administrador
                    </a>
                  )}

                  <div style={{ borderTop: '1px solid #f0e8de', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                    <button
                      onClick={() => { cerrarSesion(); setSubmenuOpen(false); }}
                      style={{ ...submenuItemStyle, color: 'var(--color-granate)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      🚪 Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            
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
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#a32b3e'; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-granate)'; e.currentTarget.style.transform = 'scale(1)'; }}
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
              background: 'none',
              border:     'none',
              color:      'var(--color-crema)',
              fontSize:   '1.5rem',
              lineHeight: 1,
              padding:    '0.25rem',
              transition: 'opacity 0.2s',
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
          gap:             '0.75rem',
          position:        'sticky',
          top:             '60px',
          zIndex:          99,
        }}>
          {enlaces.map((enlace) => (
            
              key={enlace.label}
              href={enlace.href}
              onClick={e => { e.preventDefault(); handleNavClick(enlace.href); }}
              style={{ color: 'var(--color-crema)', fontSize: '1rem', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {enlace.label}
            </a>
          ))}

          {user ? (
            <>
              <div style={{ borderTop: '1px solid rgba(250,246,239,0.2)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <p style={{ color: 'var(--color-crema)', fontSize: '0.85rem', opacity: 0.75, marginBottom: '0.75rem' }}>
                  Hola, {primerNombre ?? user.email.split('@')[0]} 👋
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="/perfil" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-crema)', fontSize: '0.95rem', textDecoration: 'none' }}>
                    👤 Perfil
                  </a>
                  <a href="/mis-pedidos" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-crema)', fontSize: '0.95rem', textDecoration: 'none' }}>
                    📦 Mis pedidos
                  </a>
                  {isAdmin && (
                    <a href="/admin" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-crema)', fontSize: '0.95rem', textDecoration: 'none', fontWeight: '600' }}>
                      ⚙️ Panel administrador
                    </a>
                  )}
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
                      cursor:          'pointer',
                      marginTop:       '0.25rem',
                    }}
                  >
                    🚪 Salir
                  </button>
                </div>
              </div>
            </>
          ) : (
            <a href="/auth" onClick={() => setMenuOpen(false)} style={{ color: 'var(--color-crema)', fontSize: '1rem', textDecoration: 'none' }}>
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