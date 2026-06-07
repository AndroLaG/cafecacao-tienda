import { useRef, useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductGrid from '../components/product/ProductGrid';

const VIDEO_URL = 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/videos/Hero-Cacao2.mp4';

// ─────────────────────────────────────────────
// SECCIÓN NOSOTROS — Rediseñada
// ─────────────────────────────────────────────

// Pasos de elaboración del CAFÉ
const PASOS_CAFE = [
  {
    numero: '01',
    titulo: 'Cultivo',
    descripcion:
      'Nuestros cafetales crecen en las laderas de Pangoa, a más de 1 200 m s. n. m., bajo sombra de árboles nativos. El suelo volcánico y el microclima de selva alta aportan complejidad al grano.',
    // reemplaza con la URL real de tu imagen en Supabase Storage:
    imagen: null,
  },
  {
    numero: '02',
    titulo: 'Cosecha selectiva',
    descripcion:
      'Solo se recogen los frutos maduros — de color rojo intenso — de forma manual. Este proceso garantiza que cada grano que llega al beneficio esté en su punto óptimo de madurez.',
    imagen: null,
  },
  {
    numero: '03',
    titulo: 'Fermentación',
    descripcion:
      'Los granos se fermentan en tinas de madera durante 36–48 horas. Este paso es clave: desarrolla los azúcares naturales que darán los matices frutales y florales del café.',
    imagen: null,
  },
  {
    numero: '04',
    titulo: 'Secado al sol',
    descripcion:
      'Extendidos en camas africanas, los granos se secan lentamente bajo el sol de la selva durante 12–20 días. El secado natural preserva los aceites esenciales del grano.',
    imagen: null,
  },
  {
    numero: '05',
    titulo: 'Selección y trilla',
    descripcion:
      'Se retira la cáscara seca y se seleccionan manualmente los granos, descartando los defectuosos. Solo el grano verde de primera calidad avanza.',
    imagen: null,
  },
  {
    numero: '06',
    titulo: 'Tostado artesanal',
    descripcion:
      'El tostado se hace en pequeños lotes para controlar el perfil de sabor. Usamos tueste medio que resalta las notas frutales sin opacar la acidez natural.',
    imagen: null,
  },
];

// Pasos de elaboración del CACAO
const PASOS_CACAO = [
  {
    numero: '01',
    titulo: 'Cosecha de mazorcas',
    descripcion:
      'Las mazorcas de cacao se cortan a mano cuando tienen el color y peso adecuados. En Pangoa se cosecha principalmente cacao Chuncho y CCN-51 de alta calidad.',
    imagen: null,
  },
  {
    numero: '02',
    titulo: 'Desgranado',
    descripcion:
      'Cada mazorca se abre y los granos rodeados de pulpa blanca son extraídos cuidadosamente para iniciar el proceso de transformación.',
    imagen: null,
  },
  {
    numero: '03',
    titulo: 'Fermentación',
    descripcion:
      'Los granos se colocan en cajones de madera y se fermentan entre 5 y 7 días. Durante este proceso la pulpa se descompone y los precursores del sabor se desarrollan.',
    imagen: null,
  },
  {
    numero: '04',
    titulo: 'Secado',
    descripcion:
      'Tras la fermentación, los granos se extienden al sol entre 7 y 10 días hasta alcanzar menos del 7 % de humedad, punto ideal para el almacenamiento y transporte.',
    imagen: null,
  },
  {
    numero: '05',
    titulo: 'Descascarillado y tostado',
    descripcion:
      'El grano seco se tuesta suavemente para liberar aromas, luego se descascarilla obteniendo el nibs de cacao, la base de todos nuestros productos.',
    imagen: null,
  },
  {
    numero: '06',
    titulo: 'Molienda y refinado',
    descripcion:
      'Los nibs se muelen hasta obtener licor de cacao, que luego se prensa para separar la manteca y el cacao en polvo, o se tempera para las barras y chocolates.',
    imagen: null,
  },
];

// Placeholder de imagen mientras no se sube la foto real
function ImagenPaso({ imagen, alt }) {
  if (imagen) {
    return (
      <img
        src={imagen}
        alt={alt}
        style={{
          width:        '100%',
          height:       '220px',
          objectFit:    'cover',
          borderRadius: 'var(--radius-lg)',
          display:      'block',
        }}
      />
    );
  }
  return (
    <div style={{
      width:           '100%',
      height:          '220px',
      borderRadius:    'var(--radius-lg)',
      backgroundColor: 'rgba(131,64,29,0.08)',
      border:          '2px dashed rgba(131,64,29,0.25)',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             '0.5rem',
    }}>
      <span style={{ fontSize: '2rem', opacity: 0.35 }}>📷</span>
      <span style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)', opacity: 0.6 }}>
        Imagen próximamente
      </span>
    </div>
  );
}

// Sub-sección de elaboración (café o cacao)
function SubseccionElaboracion({ titulo, icono, color, pasos }) {
  return (
    <div style={{ marginBottom: '3.5rem' }}>
      {/* Cabecera del producto */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '0.75rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          width:           '48px',
          height:          '48px',
          borderRadius:    'var(--radius-md)',
          backgroundColor: color,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          fontSize:        '1.4rem',
          flexShrink:      0,
        }}>
          {icono}
        </div>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize:   'clamp(1.1rem, 3vw, 1.4rem)',
          color:      'var(--color-marron)',
          margin:     0,
        }}>
          {titulo}
        </h3>
        <div style={{
          flex:            1,
          height:          '1px',
          backgroundColor: 'rgba(131,64,29,0.15)',
          marginLeft:      '0.5rem',
        }} />
      </div>

      {/* Grid de pasos */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap:                 '1.5rem',
      }}>
        {pasos.map(paso => (
          <div
            key={paso.numero}
            style={{
              backgroundColor: '#fff',
              borderRadius:    'var(--radius-lg)',
              overflow:        'hidden',
              boxShadow:       'var(--shadow-card)',
              transition:      'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
          >
            <ImagenPaso imagen={paso.imagen} alt={paso.titulo} />
            <div style={{ padding: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <span style={{
                  fontFamily:  'var(--font-heading)',
                  fontSize:    '0.8rem',
                  fontWeight:  '700',
                  color:       color === 'rgba(131,64,29,0.12)' ? 'var(--color-marron)' : color,
                  opacity:     0.55,
                  letterSpacing: '0.05em',
                }}>
                  PASO {paso.numero}
                </span>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize:   '1rem',
                  fontWeight: '600',
                  color:      'var(--color-marron)',
                }}>
                  {paso.titulo}
                </span>
              </div>
              <p style={{
                fontSize:   '0.85rem',
                color:      'var(--color-texto-muted)',
                lineHeight: '1.6',
                margin:     0,
              }}>
                {paso.descripcion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Galería carrusel
const IMAGENES_GALERIA = [
  // Agrega aquí las URLs reales de tus fotos en Supabase Storage.
  // Formato: { url: 'https://...', alt: 'Descripción de la foto' }
  // Ejemplo:
  // { url: 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Productos/foto1.jpg', alt: 'Cultivos de café en Pangoa' },
];

// Número de placeholders a mostrar si no hay imágenes reales
const PLACEHOLDERS_GALERIA = 6;

function Galeria() {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  const items = IMAGENES_GALERIA.length > 0
    ? IMAGENES_GALERIA
    : Array.from({ length: PLACEHOLDERS_GALERIA }, (_, i) => ({ url: null, alt: `Foto ${i + 1}` }));

  // Auto-avance cada 4 s
  useEffect(() => {
    if (pausado) return;
    const timer = setInterval(() => {
      setIndice(prev => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [pausado, items.length]);

  function irA(i) {
    setIndice(i);
    setPausado(true);
    setTimeout(() => setPausado(false), 8000);
  }
  function anterior() { irA((indice - 1 + items.length) % items.length); }
  function siguiente() { irA((indice + 1) % items.length); }

  return (
    <div
      style={{ position: 'relative', userSelect: 'none' }}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Slide principal */}
      <div style={{
        position:     'relative',
        width:        '100%',
        height:       '420px',
        borderRadius: 'var(--radius-lg)',
        overflow:     'hidden',
        boxShadow:    'var(--shadow-hover)',
      }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              position:   'absolute',
              inset:      0,
              opacity:    i === indice ? 1 : 0,
              transition: 'opacity 0.7s ease',
            }}
          >
            {item.url ? (
              <img
                src={item.url}
                alt={item.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width:           '100%',
                height:          '100%',
                backgroundColor: i % 2 === 0 ? 'rgba(131,64,29,0.07)' : 'rgba(131,116,27,0.07)',
                display:         'flex',
                flexDirection:   'column',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             '0.75rem',
              }}>
                <span style={{ fontSize: '3rem', opacity: 0.3 }}>🌿</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-texto-muted)', opacity: 0.5 }}>
                  Foto {i + 1} — próximamente
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Flechas */}
        {[
          { onClick: anterior, label: '‹', side: 'left:  12px' },
          { onClick: siguiente, label: '›', side: 'right: 12px' },
        ].map(({ onClick, label, side }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              position:        'absolute',
              top:             '50%',
              [side.split(':')[0].trim()]: side.split(':')[1].trim(),
              transform:       'translateY(-50%)',
              backgroundColor: 'rgba(250,246,239,0.9)',
              color:           'var(--color-marron)',
              border:          'none',
              borderRadius:    'var(--radius-pill)',
              width:           '40px',
              height:          '40px',
              fontSize:        '1.4rem',
              lineHeight:      1,
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              boxShadow:       '0 2px 8px rgba(0,0,0,0.15)',
              transition:      'background-color 0.2s, transform 0.15s',
              zIndex:          2,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'rgba(250,246,239,0.9)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            {label}
          </button>
        ))}

        {/* Contador */}
        <div style={{
          position:        'absolute',
          bottom:          '12px',
          right:           '14px',
          backgroundColor: 'rgba(0,0,0,0.45)',
          color:           '#fff',
          borderRadius:    'var(--radius-pill)',
          padding:         '0.15rem 0.65rem',
          fontSize:        '0.75rem',
          fontWeight:      '600',
          zIndex:          2,
        }}>
          {indice + 1} / {items.length}
        </div>
      </div>

      {/* Puntos de navegación */}
      <div style={{
        display:        'flex',
        justifyContent: 'center',
        gap:            '0.5rem',
        marginTop:      '1rem',
      }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => irA(i)}
            style={{
              width:           i === indice ? '24px' : '8px',
              height:          '8px',
              borderRadius:    'var(--radius-pill)',
              backgroundColor: i === indice ? 'var(--color-marron)' : 'rgba(131,64,29,0.25)',
              border:          'none',
              padding:         0,
              transition:      'all 0.3s ease',
              cursor:          'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Sección Nosotros completa
function SeccionNosotros() {
  return (
    <section id="nosotros" style={{
      backgroundColor: '#fff',
      paddingBottom:   '5rem',
    }}>

      {/* ── 1. NUESTRA HISTORIA ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-marron) 0%, var(--color-marron-claro) 100%)',
        padding:    '5rem 1.5rem',
        color:      '#fff',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '0.8rem',
            fontWeight:    '600',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            opacity:       0.7,
            marginBottom:  '0.6rem',
            textAlign:     'center',
          }}>
            Nuestra historia
          </p>
          <h2 style={{
            fontFamily:   'var(--font-heading)',
            color:        'var(--color-crema)',
            fontSize:     'clamp(1.75rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            textAlign:    'center',
          }}>
            Del campo a tu mesa
          </h2>
          <div style={{
            width:           '50px',
            height:          '2px',
            backgroundColor: 'var(--color-crema)',
            margin:          '0 auto 2.5rem',
            opacity:         0.5,
          }}/>

          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap:                 '2.5rem',
            alignItems:          'center',
          }}>
            <div>
              <p style={{ lineHeight: '1.85', opacity: 0.92, marginBottom: '1.25rem', fontSize: '1rem' }}>
                <strong style={{ color: 'var(--color-crema)' }}>Lily's Caffe</strong> nació del amor por los sabores
                auténticos del Perú. Nuestros productos provienen de las comunidades
                de Pangoa, en la selva central peruana, donde agricultores locales
                cultivan café y cacao con técnicas tradicionales transmitidas de
                generación en generación.
              </p>
              <p style={{ lineHeight: '1.85', opacity: 0.92, fontSize: '1rem' }}>
                Cada grano es seleccionado a mano, fermentado y secado al sol
                para preservar sus propiedades naturales. Creemos en el comercio
                justo y en llevar el mejor sabor directamente desde el campo
                hasta tu mesa, sin intermediarios.
              </p>
            </div>

            {/* Estadísticas */}
            <div style={{
              display:             'grid',
              gridTemplateColumns: '1fr 1fr',
              gap:                 '1rem',
            }}>
              {[
                { numero: '100%', texto: 'Orgánico',             icono: '🌿' },
                { numero: '2+',   texto: 'Años de experiencia',  icono: '📅' },
                { numero: '100+', texto: 'Clientes satisfechos', icono: '❤️'  },
                { numero: '4',    texto: 'Productos únicos',      icono: '✨' },
              ].map(({ numero, texto, icono }) => (
                <div key={texto} style={{
                  backgroundColor: 'rgba(250,246,239,0.12)',
                  border:          '1px solid rgba(250,246,239,0.2)',
                  borderRadius:    'var(--radius-lg)',
                  padding:         '1.25rem',
                  textAlign:       'center',
                  backdropFilter:  'blur(4px)',
                }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{icono}</div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize:   '1.75rem',
                    fontWeight: '700',
                    color:      'var(--color-crema)',
                  }}>
                    {numero}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '0.2rem' }}>
                    {texto}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. ELABORACIÓN ── */}
      <div style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{
          fontFamily:    'var(--font-body)',
          fontSize:      '0.8rem',
          fontWeight:    '600',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color:         'var(--color-oliva)',
          marginBottom:  '0.6rem',
          textAlign:     'center',
        }}>
          Proceso
        </p>
        <h2 style={{
          fontFamily:   'var(--font-heading)',
          color:        'var(--color-marron)',
          fontSize:     'clamp(1.75rem, 4vw, 2.25rem)',
          marginBottom: '0.75rem',
          textAlign:    'center',
        }}>
          Elaboración
        </h2>
        <p style={{
          textAlign:    'center',
          color:        'var(--color-texto-muted)',
          maxWidth:     '600px',
          margin:       '0 auto 3.5rem',
          fontSize:     '0.95rem',
          lineHeight:   '1.7',
        }}>
          Cada producto que llega a tus manos pasa por un proceso artesanal
          cuidadosamente supervisado. Conoce el camino del grano a tu taza y de
          la mazorca a tu tableta.
        </p>

        {/* Café */}
        <SubseccionElaboracion
          titulo="Elaboración del Café"
          icono="☕"
          color="var(--color-marron)"
          pasos={PASOS_CAFE}
        />

        {/* Cacao */}
        <SubseccionElaboracion
          titulo="Elaboración del Cacao"
          icono="🍫"
          color="var(--color-oliva)"
          pasos={PASOS_CACAO}
        />
      </div>

      {/* ── 3. GALERÍA ── */}
      <div style={{
        backgroundColor: 'var(--color-crema)',
        padding:         '5rem 1.5rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '0.8rem',
            fontWeight:    '600',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color:         'var(--color-oliva)',
            marginBottom:  '0.6rem',
            textAlign:     'center',
          }}>
            Nuestro lugar
          </p>
          <h2 style={{
            fontFamily:   'var(--font-heading)',
            color:        'var(--color-marron)',
            fontSize:     'clamp(1.75rem, 4vw, 2.25rem)',
            marginBottom: '0.75rem',
            textAlign:    'center',
          }}>
            Galería
          </h2>
          <p style={{
            textAlign:    'center',
            color:        'var(--color-texto-muted)',
            marginBottom: '2.5rem',
            fontSize:     '0.95rem',
            lineHeight:   '1.7',
          }}>
            Cultivos, cosecha, paisajes y el día a día en Pangoa.
          </p>
          <Galeria />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// SECCIÓN CONTACTO — sin cambios
// ─────────────────────────────────────────────
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
              <input name="nombre" type="text" placeholder="Tu nombre" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input name="telefono" type="tel" placeholder="999 999 999" required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Correo electrónico</label>
            <input name="email" type="email" placeholder="correo@ejemplo.com" required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Tipo de consulta</label>
            <select name="tipo" required style={inputStyle}>
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
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
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

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────
function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero con video de fondo */}
      <section style={{
        position:       'relative',
        height:         'calc(100vh - 64px)',
        minHeight:      '500px',
        overflow:       'hidden',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <video autoPlay muted loop playsInline style={{
          position:  'absolute',
          inset:     0,
          width:     '100%',
          height:    '100%',
          objectFit: 'cover',
          zIndex:    0,
        }}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        <div style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          zIndex:          1,
        }}/>

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
            transition:      'transform 0.2s, background-color 0.2s',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.backgroundColor = 'var(--color-marron-claro)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'var(--color-marron)';
            }}
          >
            Ver productos
          </a>
        </div>
      </section>

      {/* Sección Productos */}
      <section id="productos" style={{ backgroundColor: 'var(--color-crema)', paddingTop: '3rem' }}>
        <h2 style={{
          fontFamily:   'var(--font-heading)',
          color:        'var(--color-marron)',
          fontSize:     'clamp(1.75rem, 4vw, 2.25rem)',
          textAlign:    'center',
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

      {/* Sección Nosotros — rediseñada */}
      <SeccionNosotros />

      {/* Sección Contacto */}
      <SeccionContacto />

      <Footer />
    </div>
  );
}

export default Home;
