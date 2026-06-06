function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-marron)',
      color:           'var(--color-crema)',
      padding:         '3rem 1.5rem 1.5rem',
      marginTop:       'auto',
    }}>
      <div style={{
        maxWidth:             '1200px',
        margin:               '0 auto',
        display:              'grid',
        gridTemplateColumns:  'repeat(auto-fit, minmax(220px, 1fr))',
        gap:                  '2rem',
        paddingBottom:        '2rem',
        borderBottom:         '1px solid rgba(250,246,239,0.2)',
      }}>

        {/* Columna 1 — Marca */}
        <div>
          <h3 style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1.4rem',
            marginBottom: '0.75rem',
            color:        'var(--color-crema)',
          }}>
            Lily's Caffe
          </h3>
          <p style={{
            fontSize:   '0.875rem',
            opacity:    0.8,
            lineHeight: '1.7',
          }}>
            Café y cacao de origen peruano, cultivado con amor y llevado
            directamente a tu mesa. Sabor auténtico, calidad garantizada.
          </p>
        </div>

        {/* Columna 2 — Contacto */}
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
            <a href="tel:+51924029050" style={{
              color:          'var(--color-crema)',
              opacity:        0.8,
              fontSize:       '0.875rem',
              textDecoration: 'none',
              display:        'flex',
              alignItems:     'center',
              gap:            '0.5rem',
            }}>
              📞 +51 924 029 050
            </a>
            <a href="tel:+51924029051" style={{
              color:          'var(--color-crema)',
              opacity:        0.8,
              fontSize:       '0.875rem',
              textDecoration: 'none',
              display:        'flex',
              alignItems:     'center',
              gap:            '0.5rem',
            }}>
              📞 +51 924 029 051
            </a>
            <a href="mailto:contacto@lilyscaffe.pe" style={{
              color:          'var(--color-crema)',
              opacity:        0.8,
              fontSize:       '0.875rem',
              textDecoration: 'none',
              display:        'flex',
              alignItems:     'center',
              gap:            '0.5rem',
            }}>
              ✉️ contacto@lilyscaffe.pe
            </a>
            <a href="mailto:pedidos@lilyscaffe.pe" style={{
              color:          'var(--color-crema)',
              opacity:        0.8,
              fontSize:       '0.875rem',
              textDecoration: 'none',
              display:        'flex',
              alignItems:     'center',
              gap:            '0.5rem',
            }}>
              ✉️ pedidos@lilyscaffe.pe
            </a>
          </div>
        </div>

        {/* Columna 3 — Horarios */}
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
              { dia: 'Domingo',         hora: 'Cerrado' },
            ].map(({ dia, hora }) => (
              <div key={dia} style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                <span style={{ fontWeight: '600' }}>{dia}</span>
                <br />
                <span>{hora}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna 4 — Links */}
        <div>
          <h4 style={{
            fontFamily:   'var(--font-heading)',
            fontSize:     '1rem',
            marginBottom: '1rem',
            color:        'var(--color-crema)',
          }}>
            Enlaces
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Inicio',             href: '/'        },
              { label: 'Catálogo',           href: '/catalogo'},
              { label: 'Mi cuenta',          href: '/auth'    },
              { label: 'Términos y condiciones', href: '#'    },
              { label: 'Política de privacidad', href: '#'    },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{
                color:          'var(--color-crema)',
                opacity:        0.8,
                fontSize:       '0.875rem',
                textDecoration: 'none',
              }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Barra inferior */}
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