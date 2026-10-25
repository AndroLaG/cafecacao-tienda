import { useProducts } from '../../hooks/useProducts';
import ProductCard from './ProductCard';

function ProductGrid() {
  const { productos, loading, error } = useProducts();

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-texto-muted)' }}>
      <div style={{
        display:      'inline-block',
        width:        '40px',
        height:       '40px',
        border:       '3px solid var(--color-crema)',
        borderTop:    '3px solid var(--color-marron)',
        borderRadius: '50%',
        animation:    'spinLoader 0.8s linear infinite',
        marginBottom: '1rem',
      }}/>
      <style>{`@keyframes spinLoader { to { transform: rotate(360deg); } }`}</style>
      <p>Cargando productos...</p>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ color: 'var(--color-texto-muted)', marginBottom: '1rem' }}>
        No se pudieron cargar los productos.
      </p>
      <button
        onClick={function() { window.location.reload(); }}
        style={{
          backgroundColor: 'var(--color-marron)',
          color:           '#fff',
          border:          'none',
          borderRadius:    '8px',
          padding:         '0.6rem 1.5rem',
          fontSize:        '0.875rem',
          fontWeight:      '600',
          fontFamily:      'var(--font-body)',
          cursor:          'pointer',
        }}
      >
        Reintentar
      </button>
    </div>
  );

  if (productos.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-texto-muted)' }}>
      No hay productos disponibles.
    </div>
  );

  return (
    <div style={{
      display:             'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap:                 '1.5rem',
      padding:             '2rem',
      maxWidth:            '1200px',
      margin:              '0 auto',
    }}>
      {productos.map(function(producto) {
        return <ProductCard key={producto.id} producto={producto} />;
      })}
    </div>
  );
}

export default ProductGrid;