import { supabase } from '../services/supabaseClient';
import { useRef, useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductGrid from '../components/product/ProductGrid';
import Lightbox from '../components/ui/Lightbox';

const VIDEO_URL = 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/videos/Hero-Cacao2.mp4';

// ─────────────────────────────────────────────
// SECCIÓN NOSOTROS — Rediseñada
// ─────────────────────────────────────────────

// Pasos de elaboración del CAFÉ
const PASOS_CAFE = [
  {
    numero: '01',
    titulo: 'Cultivo',
    descripcion: 'Todo gran café comienza con la paciencia siempre lo dice mi padre. El se encarga de preparar la tierra antes de trasladar nuestras semillas desde el vivero, donde han sido cuidadas durante 9 meses. Una vez plantadas, aprovechamos las lluvias de temporada para su riego y realizamos el cortado de maleza constante. Recuerdo cuando corte maleza junto a mi padre, fue una semana dura pero aprendí mucho del cafe y de la vida.',
    imagenes: [
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cultivo%20-%20cafe/paso-1-cultivo.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cultivo%20-%20cafe/paso-2-cultivo-cafe.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cultivo%20-%20cafe/paso-3-cultivo-cafe.avif',
    ],
  },
  {
    numero: '02',
    titulo: 'Cosecha selectiva',
    descripcion: 'Al tercer año, llegan los frutos. Recuerdo la primera cosecha en junio, fue bastante emocionante para la familia porque todos fuimos a ayudar. Actualmente tenemos recolectores que realizan un trabajo 100% manual, seleccionando únicamente las cerezas que han alcanzado un tono rojo perfecto de maduración. Ese mismo día, los granos frescos pasan por la despulpadora para separar la cáscara',
    imagenes: [
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cosecha-cafe/paso-1-cosecha-cafe.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cosecha-cafe/paso-2-cosecha.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cosecha-cafe/paso-3-cosecha-cafe.avif'
    ],
  },
  {
    numero: '03',
    titulo: 'Fermentación',
    descripcion: 'Mi padre me dijo que si quieres un buen café, los granos deben reposar al sol entre 36 y 48 horas en un proceso de fermentación natural. Finalmente, el café se lava y se extiende al sol durante cuatro días, removiéndolo constantemente para garantizar un secado parejo y perfecto.',
    imagenes: [
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/fermentacion-cafe/paso%201-fermentacion.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/fermentacion-cafe/paso-2-fermentacion-cafe.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/fermentacion-cafe/paso-3-fermentacion-cafe.avif'
    ],
  },
];

// Pasos de elaboración del CACAO
const PASOS_CACAO = [
  {
    numero: '01',
    titulo: 'Cosecha de mazorcas',
    descripcion: 'El cacao se corta con la azada por el tallo de la mazorca, evitando dañar el árbol. Mi padre me enseñó a hacerlo correctamente para no dañar el árbol y asegurar futuras cosechas. De esta manera se recolectan los cacaos aqui en Lily\'s Caffe.',
    imagenes: [
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cosecha-cacao/paso-1-cacao.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cosecha-cacao/paso-2-cacao.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cosecha-cacao/paso-3-cacao.avif',
    ],
  },
  {
    numero: '02',
    titulo: 'Desgranado',
    descripcion: 'Cada cacao se abre con un machete y los granos rodeados de pulpa blanca se extraen cuidadosamente y solo son separados los de buena calidad. La ultima cosecha que hubo mi abuelo y yo nos encargamos de cortar y desgranar los cacaos, fue un trabajo muy duro pero valió la pena.',
    imagenes: [
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/desgranado-cacao/paso%201-desgranado_converted.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/desgranado-cacao/paso%202-desgranado_converted.avif',
      'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/desgranado-cacao/paso%203-desgranado_converted.avif',
    ],
  },
  // {
  //   numero: '03',
  //   titulo: 'Fermentación',
  //   descripcion: 'Los granos se colocan en cajones de madera y se fermentan entre 5 y 7 días. Durante este proceso la pulpa se descompone y el sabor se desarrolla.',
  //   imagenes: [
  //     'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/fermentacion-cafe/paso%201-fermentacion.avif',
  //     'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/fermentacion-cafe/paso-2-fermentacion-cafe.avif',
  //     'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/fermentacion-cafe/paso-3-fermentacion-cafe.avif',
  //   ],
  // },
];

function CarruselPaso({ imagenes, alt }) {
  var [indice, setIndice] = useState(0);
  useEffect(function() {
  var intervalo = setInterval(function() {
    setIndice(function(i) { return (i + 1) % imagenes.length; });
  }, 3000);
  return function() { clearInterval(intervalo); };
}, [imagenes.length]);
  var [lightbox, setLightbox] = useState(false);

  function anterior(e) {
    e.stopPropagation();
    setIndice(function(i) { return (i - 1 + imagenes.length) % imagenes.length; });
  }

  function siguiente(e) {
    e.stopPropagation();
    setIndice(function(i) { return (i + 1) % imagenes.length; });
  }

  var imgActual = imagenes[indice];

  return (
    <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>

      {/* Imagen o placeholder */}
      {imgActual ? (
        <img
          key={indice}
          src={imgActual}
          alt={alt + ' ' + (indice + 1)}
          onClick={function() { setLightbox(true); }}
          style={{
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            display:    'block',
            cursor:     'zoom-in',
            animation:  'fadeCarrusel 0.6s ease',
          }}
          onMouseEnter={function(e) { e.currentTarget.style.filter = 'brightness(1.08)'; }}
          onMouseLeave={function(e) { e.currentTarget.style.filter = 'brightness(1)'; }}
        />
      ) : (
        <div style={{
          width:           '100%',
          height:          '100%',
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
            Foto {indice + 1} — próximamente
          </span>
        </div>
      )}

      {/* Flechas — solo si hay más de 1 imagen */}
      {imagenes.length > 1 && (
        <>
          <button
            onClick={anterior}
            style={{
              position:        'absolute',
              left:            '8px',
              top:             '50%',
              transform:       'translateY(-50%)',
              backgroundColor: 'rgba(250,246,239,0.88)',
              color:           'var(--color-marron)',
              border:          'none',
              borderRadius:    '50%',
              width:           '32px',
              height:          '32px',
              fontSize:        '1.1rem',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              cursor:          'pointer',
              boxShadow:       '0 2px 6px rgba(0,0,0,0.15)',
              zIndex:          2,
              transition:      'background-color 0.2s',
            }}
            onMouseEnter={function(e) { e.currentTarget.style.backgroundColor = '#fff'; }}
            onMouseLeave={function(e) { e.currentTarget.style.backgroundColor = 'rgba(250,246,239,0.88)'; }}
          >
            ‹
          </button>
          <button
            onClick={siguiente}
            style={{
              position:        'absolute',
              right:           '8px',
              top:             '50%',
              transform:       'translateY(-50%)',
              backgroundColor: 'rgba(250,246,239,0.88)',
              color:           'var(--color-marron)',
              border:          'none',
              borderRadius:    '50%',
              width:           '32px',
              height:          '32px',
              fontSize:        '1.1rem',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              cursor:          'pointer',
              boxShadow:       '0 2px 6px rgba(0,0,0,0.15)',
              zIndex:          2,
              transition:      'background-color 0.2s',
            }}
            onMouseEnter={function(e) { e.currentTarget.style.backgroundColor = '#fff'; }}
            onMouseLeave={function(e) { e.currentTarget.style.backgroundColor = 'rgba(250,246,239,0.88)'; }}
          >
            ›
          </button>
        </>
      )}

      {/* Puntos indicadores */}
      {imagenes.length > 1 && (
        <div style={{
          position:       'absolute',
          bottom:         '8px',
          left:           '50%',
          transform:      'translateX(-50%)',
          display:        'flex',
          gap:            '5px',
          zIndex:         2,
        }}>
          {imagenes.map(function(_, i) {
            return (
              <div
                key={i}
                onClick={function(e) { e.stopPropagation(); setIndice(i); }}
                style={{
                  width:           i === indice ? '18px' : '7px',
                  height:          '7px',
                  borderRadius:    '999px',
                  backgroundColor: i === indice ? 'var(--color-crema)' : 'rgba(250,246,239,0.55)',
                  transition:      'all 0.3s ease',
                  cursor:          'pointer',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Contador */}
      <div style={{
        position:        'absolute',
        top:             '8px',
        right:           '10px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        color:           '#fff',
        borderRadius:    '999px',
        padding:         '0.1rem 0.55rem',
        fontSize:        '0.7rem',
        fontWeight:      '600',
        zIndex:          2,
      }}>
        {indice + 1}/{imagenes.length}
      </div>
      {lightbox && imgActual && (
  <Lightbox
    src={imgActual}
    alt={alt + ' ' + (indice + 1)}
    onClose={function() { setLightbox(false); }}
  />
)}
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
            <CarruselPaso imagenes={paso.imagenes} alt={paso.titulo} />
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
  { url: 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/flor-pulsera.avif', alt: 'Flor pulsera' },
  { url: 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/despepar-cacao.avif', alt: 'Despepar cacao' },
  { url: 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/vivero-cacao.avif', alt: 'Vivero cacao' },
  { url: 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/flor-morada.avif', alt: 'Flor morada' },
  { url: 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/trabajo-vivero.avif', alt: 'Trabajo en el vivero' },
  { url: 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/rio-niebla.avif', alt: 'Río niebla' },
  { url: 'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/secado-cacao.avif', alt: 'Secado de cacao' }

];

// Número de placeholders a mostrar si no hay imágenes reales
const PLACEHOLDERS_GALERIA = 7

function Galeria() {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [lightbox, setLightbox] = useState(false);

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
                  onClick={function() { setLightbox(true); }}
                  style={{
                    width:     '100%',
                    height:    '100%',
                    objectFit: 'cover',
                    cursor:    'zoom-in',
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={function(e) { e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={function(e) { e.currentTarget.style.transform = 'scale(1)'; }}
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
      {lightbox && items[indice]?.url && (
  <Lightbox
    src={items[indice].url}
    alt={items[indice].alt}
    onClose={function() { setLightbox(false); }}
  />
)}
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
                <strong style={{ color: 'var(--color-crema)' }}>Lily's Caffe</strong> nació del amor y esfuerzo de mi padre y madre. Es un proyecto familiar que busca compartir la riqueza de nuestros cultivos de café y cacao, cultivados en las fértiles tierras de Pangoa, Perú. Desde el primer día, nos propusimos ofrecer productos de alta calidad, respetando la naturaleza y las tradiciones locales.
              </p>
              <p style={{ lineHeight: '1.85', opacity: 0.92, fontSize: '1rem' }}>
                Cada grano ha sido seleccionado a mano, fermentado y secado al sol
                para preservar sus propiedades naturales. Creemos en el comercio
                justo y en llevar el mejor sabor directamente desde el campo
                hasta tu mesa, sin intermediarios.
              </p>
            </div>

            {/* Video vertical en bucle */}
            <div style={{
              display:        'flex',
              justifyContent: 'center',
              alignItems:     'center',
            }}>
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow:     'hidden',
                boxShadow:    '0 8px 32px rgba(0,0,0,0.3)',
                maxWidth:     '280px',
                width:        '100%',
                border:       '3px solid rgba(250,246,239,0.2)',
              }}>
                <video
                  src="https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/video-nuestra-historia.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width:     '100%',
                    display:   'block',
                    objectFit: 'cover',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. ELABORACIÓN ── */}
      <div style={{
        position:             'relative',
        backgroundImage:      'url(https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/cafe-fondo.avif)',
        backgroundSize:       'cover',
        backgroundPosition:   'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* Capa de color */}
        <div style={{
          position:        'absolute',
          inset:           0,
          backgroundColor: 'rgba(250,246,239,0.85)',
          opacity:         0.35,
          zIndex:          0,
        }}/>
        <div style={{ position: 'relative', zIndex: 1, padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>

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

function SeccionContacto() {
  const formRef = useRef(null);
  const [enviando,  setEnviando]  = useState(false);
  const [enviado,   setEnviado]   = useState(false);
  const [error,     setError]     = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const data     = new FormData(e.target);
    const nombre   = data.get('nombre');
    const email    = data.get('email');
    const telefono = data.get('telefono');
    const tipo     = data.get('tipo');
    const mensaje  = data.get('mensaje');

    try {
      const { error: fnError } = await supabase.functions.invoke('enviar-contacto', {
        body: {
          nombre,
          email,
          mensaje: `<strong>Teléfono:</strong> ${telefono}<br/><strong>Tipo:</strong> ${tipo}<br/><br/>${mensaje}`,
        },
      });

      if (fnError) throw fnError;

      setEnviado(true);
      e.target.reset();
    } catch (err) {
      setError('No se pudo enviar el mensaje. Por favor inténtalo de nuevo.');
    }

    setEnviando(false);
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

        {/* ✅ Mensaje de éxito */}
        {enviado && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border:          '1px solid #bbf7d0',
            borderRadius:    'var(--radius-lg)',
            padding:         '2rem',
            textAlign:       'center',
            marginBottom:    '1.5rem',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: '#166534', marginBottom: '0.5rem' }}>
              ¡Mensaje enviado!
            </h3>
            <p style={{ color: '#166534', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Nos contactaremos contigo a la brevedad.
            </p>
            <button
              onClick={() => setEnviado(false)}
              style={{
                backgroundColor: 'var(--color-marron)',
                color:           '#fff',
                border:          'none',
                borderRadius:    'var(--radius-md)',
                padding:         '0.6rem 1.5rem',
                fontSize:        '0.875rem',
                fontWeight:      '600',
                fontFamily:      'var(--font-body)',
                cursor:          'pointer',
              }}
            >
              Enviar otro mensaje
            </button>
          </div>
        )}

        {!enviado && (
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

            {/* Error */}
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
              disabled={enviando}
              style={{
                backgroundColor: enviando ? 'var(--color-texto-muted)' : 'var(--color-marron)',
                color:           'var(--color-crema)',
                border:          'none',
                borderRadius:    'var(--radius-md)',
                padding:         '0.875rem',
                fontSize:        '1rem',
                fontWeight:      '600',
                fontFamily:      'var(--font-body)',
                width:           '100%',
                transition:      'background-color 0.2s',
                cursor:          enviando ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!enviando) e.currentTarget.style.backgroundColor = 'var(--color-marron-claro)'; }}
              onMouseLeave={e => { if (!enviando) e.currentTarget.style.backgroundColor = 'var(--color-marron)'; }}
            >
              {enviando ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        )}
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
<section id="productos" style={{
  paddingTop:           '4rem',
  paddingBottom:        '2rem',
  position:             'relative',
  backgroundImage:      'url(https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/fondo-caca-barra.avif)',
  backgroundSize:       'cover',
  backgroundPosition:   'center',
  backgroundAttachment: 'fixed',  /* ← el efecto parallax */
}}>
  {/* Capa de color encima de la imagen */}
  <div style={{
    position:        'absolute',
    inset:           0,
    backgroundColor: 'rgba(250,246,239,0.85)',
    opacity:         0.35,
    zIndex:          0,
  }}/>

  {/* Contenido por encima de la capa */}
  <div style={{ position: 'relative', zIndex: 1 }}>
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
  </div>
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
