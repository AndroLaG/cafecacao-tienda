import { useProducts } from '../../hooks/useProducts';
import ProductCard from './ProductCard';

function ProductGrid() {
  const { productos, loading, error } = useProducts();

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-texto-muted)' }}>
      Cargando productos...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-granate)' }}>
      Error al cargar productos: {error}
    </div>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {productos.map(producto => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}

export default ProductGrid;