import { useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductGrid from '../components/product/ProductGrid';

const VIDEO_URL = 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/videos/Hero-Cacao2.mp4';

// ── Sección Nosotros
function SeccionNosotros() {
  return (
    <section style={{
      padding:         '5rem 1.5rem',
      backgroundColor: '#fff',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily:   'var(--font-heading)',
          color:        'var(--color-marron)',
          fontSize:     'clamp(1.75rem, 4vw, 2.25rem)',
          marginBottom: '1rem',
          textAlign:    'center',
        }}>
          Nuestra Historia
        </h2>
        <div style={{
          width:           '60px',
          height:          '3px',
          backgroundColor: 'var(--color-oliva)',
          margin:          '0 auto 2.5rem',
          borderRadius:    'var(--radius-pill)',
        }}/>

        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap:                 '2.5rem',
          alignItems:          'center',
        }}>
          <div>
            <p style={{
              color:        'var(--color-texto)',
              fontSize:     '1rem',
              lineHeight:   '1.8',
              marginBottom: '1.25rem',
            }}>
              <strong>Lily's Caffe</strong> nació del amor por los sabores
              auténticos del Perú. Nuestros productos provienen de las comunidades
              de Pangoa, en la selva central peruana, donde agricultores locales
              cultivan café y cacao con técnicas tradicionales transmitidas de
              generación en generación.
            </p>
            <p style={{
              color:      'var(--color-texto)',
              fontSize:   '1rem',
              lineHeight: '1.8',
            }}>
              Cada grano es seleccionado a mano, fermentado y secado al sol
              para preservar sus propiedades naturales. Creemos en el comercio
              justo y en llevar el mejor sabor directamente desde el campo
              hasta tu mesa, sin intermediarios.
            </p>
          </div>

          <div style={{
            display:       'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:           '1rem',
          }}>
            {[
              { numero: '100%', texto: 'Orgánico' },
              { numero: '2+',   texto: 'Años de experiencia' },
              { numero: '50+',  texto: 'Familias beneficiadas' },
              { numero: '4',    texto: 'Productos únicos' },
            ].map(({ numero, texto }) => (
              <div key={texto} style={{
                backgroundColor: 'var(--color-crema)',
                borderRadius:    'var(--radius-lg)',
                padding:         '1.5rem',
                textAlign:       'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize:   '2rem',
                  fontWeight: '700',
                  color:      'var(--color-marron)',
                }}>
                  {numero}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color:    'var(--color-texto-muted)',
                  marginTop: '0.25rem',
                }}>
                  {texto}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sección Contáctanos
function SeccionContacto() {
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    alert(`¡Mensaje recibido! Nos contactaremos con ${data.get('nombre')} pronto.`);
    e.target.reset();
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

  return (
    <section id="contacto" style={{
      padding:         '5rem 1.5rem',
      backgroundColor: 'var(--color-crema)',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily:   'var(--font-heading)',
          color:        'var(--color-marron)',
          fontSize:     'clamp(1.75rem, 4vw, 2.25rem)',
          marginBottom: '1rem',
          textAlign:    'center',
        }}>
          Contáctanos
        </h2>
        <div style={{
          width:           '60px',
          height:          '3px',
          backgroundColor: 'var(--color-oliva)',
          margin:          '0 auto 1rem',
          borderRadius:    'var(--radius-pill)',
        }}/>
        <p style={{
          textAlign:    'center',
          color:        'var(--color-texto-muted)',
          marginBottom: '2.5rem',
          fontSize:     '0.95rem',
        }}>
          ¿Tienes un pedido personalizado o alguna consulta? Escríbenos.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} style={{
          backgroundColor: '#fff',
          borderRadius:    'var(--radius-lg)',
          boxShadow:       'var(--shadow-card)',
          padding:         '2rem',
          display:         'flex',
          flexDirection:   'column',
          gap:             '1rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                name="nombre"
                type="text"
                placeholder="Tu nombre"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input
                name="telefono"
                type="tel"
                placeholder="999 999 999"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Tipo de consulta</label>
            <select
              name="tipo"
              required
              style={inputStyle}
            >
              <option value="">Selecciona una opción...</option>
              <option value="pedido-personalizado">Pedido personalizado</option>
              <option value="mayorista">Compra mayorista</option>
              <option value="distribucion">Distribución</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Mensaje</label>
            <textarea
              name="mensaje"
              placeholder="Cuéntanos en qué podemos ayudarte..."
              required
              rows={4}
              style={{
                ...inputStyle,
                resize:     'vertical',
                lineHeight: '1.5',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: 'var(--color-marron)',
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
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-marron-claro)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-marron)'}
          >
            Enviar mensaje
          </button>
        </form>
      </div>
    </section>
  );
}

// ── Página principal
function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero con video de fondo */}
      <section style={{
        position:   'relative',
        height:     'calc(100vh - 64px)',
        minHeight:  '500px',
        overflow:   'hidden',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Video de fondo */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position:   'absolute',
            inset:      0,
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            zIndex:     0,
          }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        {/* Overlay oscuro */}
        <div style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          zIndex:          1,
        }}/>

        {/* Contenido del hero */}
        <div style={{
          position:  'relative',
          zIndex:    2,
          textAlign: 'center',
          padding:   '2rem 1.5rem',
          maxWidth:  '700px',
        }}>
          <h1 style={{
            fontFamily:   'var(--font-heading)',
            color:        '#fff',
            fontSize:     'clamp(2.5rem, 8vw, 4rem)',
            marginBottom: '1rem',
            lineHeight:   1.2,
            textShadow:   '0 2px 12px rgba(0,0,0,0.4)',
          }}>
            Lily's Caffe
          </h1>
          <p style={{
            color:        'rgba(255,255,255,0.9)',
            fontSize:     'clamp(1rem, 3vw, 1.25rem)',
            marginBottom: '2rem',
            lineHeight:   1.6,
            textShadow:   '0 1px 6px rgba(0,0,0,0.4)',
          }}>
            Café y cacao de origen peruano.<br />
            Del campo de Pangoa a tu mesa.
          </p>
          <a href="#productos" style={{
            display:         'inline-block',
            backgroundColor: 'var(--color-marron)',
            color:           '#fff',
            padding:         '0.875rem 2.5rem',
            borderRadius:    'var(--radius-pill)',
            fontWeight:      '600',
            fontSize:        '1rem',
            fontFamily:      'var(--font-body)',
            textDecoration:  'none',
            boxShadow:       '0 4px 16px rgba(0,0,0,0.3)',
            transition:      'transform 0.2s',
          }}>
            Ver productos
          </a>
        </div>
      </section>

      {/* Sección Productos */}
      <section id="productos" style={{ backgroundColor: 'var(--color-crema)', paddingTop: '3rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          color:      'var(--color-marron)',
          fontSize:   'clamp(1.75rem, 4vw, 2.25rem)',
          textAlign:  'center',
          marginBottom: '0.5rem',
        }}>
          Nuestros Productos
        </h2>
        <div style={{
          width:           '60px',
          height:          '3px',
          backgroundColor: 'var(--color-oliva)',
          margin:          '0 auto 1rem',
          borderRadius:    'var(--radius-pill)',
        }}/>
        <p style={{
          textAlign:    'center',
          color:        'var(--color-texto-muted)',
          marginBottom: '1rem',
          fontSize:     '0.95rem',
          padding:      '0 1rem',
        }}>
          Productos 100% orgánicos cultivados en Pangoa, Perú.
        </p>
        <ProductGrid />
      </section>

      {/* Sección Nosotros */}
      <SeccionNosotros />

      {/* Sección Contacto */}
      <SeccionContacto />

      <Footer />
    </div>
  );
}

export default Home;