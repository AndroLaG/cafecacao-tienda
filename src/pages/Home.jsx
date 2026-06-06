import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductGrid from '../components/product/ProductGrid';

function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <div style={{
          backgroundColor: 'var(--color-marron)',
          padding:         '4rem 1.5rem',
          textAlign:       'center',
        }}>
          <h1 style={{
            fontFamily:   'var(--font-heading)',
            color:        'var(--color-crema)',
            fontSize:     'clamp(1.75rem, 5vw, 2.5rem)',
            marginBottom: '1rem',
          }}>
            Lily's Caffe
          </h1>
          <p style={{
            color:     'var(--color-crema)',
            opacity:   0.85,
            fontSize:  'clamp(0.95rem, 2.5vw, 1.1rem)',
            maxWidth:  '500px',
            margin:    '0 auto',
          }}>
            Origen directo, sabor auténtico. Del campo peruano de Satipo, Pangoa a tu taza.
          </p>
        </div>
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
}

export default Home;