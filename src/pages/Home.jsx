import Navbar from '../components/layout/Navbar';
import ProductGrid from '../components/product/ProductGrid';

function Home() {
  return (
    <div>
      <Navbar />
      <main>
        <div style={{
          backgroundColor: 'var(--color-marron)',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-crema)',
            fontSize: '2.5rem',
            marginBottom: '1rem',
          }}>
            Lily's Caffe
          </h1>
          <p style={{
            color: 'var(--color-crema)',
            opacity: 0.85,
            fontSize: '1.1rem',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            Origen directo, sabor auténtico. Del campo peruano de Satipo a tu taza.
          </p>
        </div>
        <ProductGrid />
      </main>
    </div>
  );
}

export default Home;