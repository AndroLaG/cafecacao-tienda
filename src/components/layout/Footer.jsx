function Footer() {
  function handleNavClick(e, href) {
    e.preventDefault();
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      window.location.href = '/';
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      window.location.href = href;
    }
  }

  return (
    <footer style={{
      backgroundColor: 'var(--color-marron)',
      color:           'var(--color-crema)',
      padding:         '3rem 1.5rem 1.5rem',
      marginTop:       'auto',
    }}>
      <div style={{
        maxWidth:            '1200px',
        margin:              '0 auto',
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap:                 '2rem',
        paddingBottom:       '2rem',
        borderBottom:        '1px solid rgba(250,246,239,0.2)',
      }}>

        {/* Marca */}
        <div>
          <h3 style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1.4rem',
            marginBottom: '0.75rem',
            color:        'var(--color-crema)',
          }}>
            Lily's Caffe
          </h3>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, lineHeight: '1.7' }}>
            Café y cacao de origen peruano, cultivado con amor y llevado
            directamente a tu mesa. Sabor auténtico, calidad garantizada.
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h4 style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1rem',
            marginBottom: '1rem',
            color:        'var(--color-crema)',
          }}>
            Navegación
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Inicio',    href: '/'          },
              { label: 'Productos', href: '/#productos' },
              { label: 'Nosotros',  href: '/#nosotros'  },
              { label: 'Contacto',  href: '/#contacto'  },
              { label: 'Mi cuenta', href: '/auth'       },
            ].map(({ label, href }) => (
              
                key={label}
                href={href}
                onClick={e => handleNavClick(e, href)}
                style={{
                  color:          'var(--color-crema)',
                  opacity:        0.8,
                  fontSize:       '0.875rem',
                  textDecoration: 'none',
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h4 style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1rem',
            marginBottom: '1rem',
            color:        'var(--color-crema)',
          }}>
            Contacto
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <a href="tel:+51924029050" style={{ color: 'var(--color-crema)', opacity: 0.8, fontSize: '0.875rem', textDecoration: 'none' }}>
              📞 +51 924 029 050
            </a>
            <a href="mailto:contacto@lilyscaffe.pe" style={{ color: 'var(--color-crema)', opacity: 0.8, fontSize: '0.875rem', textDecoration: 'none' }}>
              ✉️ contacto@lilyscaffe.pe
            </a>
          </div>
        </div>

        {/* Horarios */}
        <div>
          <h4 style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1rem',
            marginBottom: '1rem',
            color:        'var(--color-crema)',
          }}>
            Horario de atención
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { dia: 'Lunes — Viernes', hora: '9:00 am — 6:00 pm' },
              { dia: 'Sábado',          hora: '9:00 am — 2:00 pm' },
              { dia: 'Domingo',         hora: 'Cerrado'            },
            ].map(({ dia, hora }) => (
              <div key={dia} style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                <span style={{ fontWeight: '600' }}>{dia}</span><br />
                <span>{hora}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        maxWidth:       '1200px',
        margin:         '0 auto',
        paddingTop:     '1.25rem',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        flexWrap:       'wrap',
        gap:            '0.75rem',
      }}>
        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
          © {new Date().getFullYear()} Lily's Caffe. Todos los derechos reservados.
        </p>
        <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
          Hecho con ❤️ en Perú
        </p>
      </div>
    </footer>
  );
}

export default Footer;