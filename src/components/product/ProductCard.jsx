import { useCart } from '../../context/CartContext';

function ProductCard({ producto }) {
  const { addItem } = useCart();

  const categoriaColor = {
    cafe:   'var(--color-marron)',
    cacao:  'var(--color-oliva)',
    bundle: 'var(--color-granate)',
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
          }}
        />
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: categoriaColor[producto.categoria],
          color: '#fff',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'capitalize',
        }}>
          {producto.categoria}
        </span>
      </div>

      <div style={{ padding: '1.25rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-marron)',
          fontSize: '1.1rem',
          marginBottom: '0.5rem',
        }}>
          {producto.nombre}
        </h3>

        <p style={{
          color: 'var(--color-texto-muted)',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          marginBottom: '0.75rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {producto.descripcion}
        </p>

        {producto.notas_cata && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            marginBottom: '1rem',
          }}>
            {producto.notas_cata.map(nota => (
              <span key={nota} style={{
                backgroundColor: 'var(--color-crema)',
                color: 'var(--color-oliva)',
                border: '1px solid var(--color-oliva-claro)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.15rem 0.6rem',
                fontSize: '0.72rem',
              }}>
                {nota}
              </span>
            ))}
          </div>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: '700',
              color: 'var(--color-marron)',
            }}>
              S/ {producto.precio.toFixed(2)}
            </span>
            {producto.peso_gramos && (
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--color-texto-muted)',
                marginLeft: '0.4rem',
              }}>
                {producto.peso_gramos}g
              </span>
            )}
          </div>

          <button
            onClick={() => addItem(producto)}
            style={{
              backgroundColor: 'var(--color-marron)',
              color: 'var(--color-crema)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 1.2rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'background-color 0.2s',
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