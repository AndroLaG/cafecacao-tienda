import { useState } from 'react';
import { useCart } from '../../context/CartContext';

const SABORES_CHOCOLATE = [
  'Ajonjolí',
  'Almendras',
  'Café grumos',
  'Maní',
  'Naranja',
  'Arándanos',
  'Manteca de cacao',
];

function ProductCard({ producto }) {
  const { addItem } = useCart();
  const [saborSeleccionado, setSaborSeleccionado] = useState('');
  const [errorSabor, setErrorSabor] = useState(false);

  const esChocolate = producto.nombre === "Chocolate Kiatari's";

  const categoriaColor = {
    cafe:   'var(--color-marron)',
    cacao:  'var(--color-oliva)',
    bundle: 'var(--color-granate)',
  };

  function handleAgregar() {
    if (esChocolate && !saborSeleccionado) {
      setErrorSabor(true);
      return;
    }
    setErrorSabor(false);

    const itemParaCarrito = esChocolate
      ? { ...producto, nombre: `${producto.nombre} — ${saborSeleccionado}` }
      : producto;

    addItem(itemParaCarrito);
    if (esChocolate) setSaborSeleccionado('');
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius:    'var(--radius-lg)',
      overflow:        'hidden',
      boxShadow:       'var(--shadow-card)',
      transition:      'transform 0.2s, box-shadow 0.2s',
      display:         'flex',
      flexDirection:   'column',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'translateY(-4px)';
        e.currentTarget.style.boxShadow  = 'var(--shadow-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = 'translateY(0)';
        e.currentTarget.style.boxShadow  = 'var(--shadow-card)';
      }}
    >
      {/* Imagen */}
      <div style={{ position: 'relative' }}>
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
        <span style={{
          position:        'absolute',
          top:             '12px',
          left:            '12px',
          backgroundColor: categoriaColor[producto.categoria] ?? 'var(--color-marron)',
          color:           '#fff',
          padding:         '0.25rem 0.75rem',
          borderRadius:    'var(--radius-pill)',
          fontSize:        '0.75rem',
          fontWeight:      '600',
          textTransform:   'capitalize',
        }}>
          {producto.categoria}
        </span>
      </div>

      {/* Contenido */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          color:      'var(--color-marron)',
          fontSize:   '1.1rem',
        }}>
          {producto.nombre}
        </h3>

        <p style={{
          color:              'var(--color-texto-muted)',
          fontSize:           '0.875rem',
          lineHeight:         '1.5',
          display:            '-webkit-box',
          WebkitLineClamp:    2,
          WebkitBoxOrient:    'vertical',
          overflow:           'hidden',
        }}>
          {producto.descripcion}
        </p>

        {/* Notas — solo si no es chocolate */}
        {producto.notas_cata && !esChocolate && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {producto.notas_cata.map(nota => (
              <span key={nota} style={{
                backgroundColor: 'var(--color-crema)',
                color:           'var(--color-oliva)',
                border:          '1px solid var(--color-oliva-claro)',
                borderRadius:    'var(--radius-pill)',
                padding:         '0.15rem 0.6rem',
                fontSize:        '0.72rem',
              }}>
                {nota}
              </span>
            ))}
          </div>
        )}

        {/* Selector de sabor para Chocolate Kiatari's */}
        {esChocolate && (
          <div>
            <label style={{
              fontSize:     '0.85rem',
              fontWeight:   '600',
              color:        'var(--color-texto-muted)',
              display:      'block',
              marginBottom: '0.4rem',
            }}>
              Elige tu sabor
            </label>
            <select
              value={saborSeleccionado}
              onChange={e => { setSaborSeleccionado(e.target.value); setErrorSabor(false); }}
              style={{
                width:           '100%',
                padding:         '0.6rem 0.75rem',
                borderRadius:    'var(--radius-md)',
                border:          errorSabor ? '2px solid var(--color-granate)' : '1px solid #e0d5c8',
                fontFamily:      'var(--font-body)',
                fontSize:        '0.9rem',
                color:           saborSeleccionado ? 'var(--color-texto)' : 'var(--color-texto-muted)',
                backgroundColor: '#fff',
                outline:         'none',
              }}
            >
              <option value="">Selecciona un sabor...</option>
              {SABORES_CHOCOLATE.map(sabor => (
                <option key={sabor} value={sabor}>{sabor}</option>
              ))}
            </select>
            {errorSabor && (
              <p style={{ color: 'var(--color-granate)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
                Por favor elige un sabor antes de agregar.
              </p>
            )}
          </div>
        )}

        {/* Precio y botón */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize:   '1.4rem',
              fontWeight: '700',
              color:      'var(--color-marron)',
            }}>
              S/ {producto.precio.toFixed(2)}
            </span>
            {producto.peso_gramos && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-muted)', marginLeft: '0.4rem' }}>
                {producto.peso_gramos}g
              </span>
            )}
            {esChocolate && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-texto-muted)', marginLeft: '0.4rem' }}>
                8 unidades
              </span>
            )}
          </div>

          <button
            onClick={handleAgregar}
            style={{
              backgroundColor: 'var(--color-marron)',
              color:           'var(--color-crema)',
              border:          'none',
              borderRadius:    'var(--radius-md)',
              padding:         '0.6rem 1.2rem',
              fontSize:        '0.875rem',
              fontWeight:      '600',
              transition:      'background-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-marron-claro)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-marron)'}
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;