import Navbar from '../components/layout/Navbar';

function OrdenExitosa() {
  return (
    <div>
      <Navbar />
      <div style={{
        textAlign:  'center',
        padding:    '5rem 2rem',
        maxWidth:   '500px',
        margin:     '0 auto',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{
          fontFamily:   'var(--font-heading)',
          color:        'var(--color-marron)',
          fontSize:     '2rem',
          marginBottom: '1rem',
        }}>
          ¡Pedido confirmado!
        </h1>
        <p style={{
          color:        'var(--color-texto-muted)',
          fontSize:     '1rem',
          lineHeight:   '1.6',
          marginBottom: '2rem',
        }}>
          Gracias por tu compra. Pronto recibirás un correo con los detalles de tu pedido.
        </p>
        <a href="/" style={{
          backgroundColor: 'var(--color-marron)',
          color:           'var(--color-crema)',
          padding:         '0.875rem 2rem',
          borderRadius:    'var(--radius-md)',
          fontWeight:      '600',
          fontSize:        '1rem',
          display:         'inline-block',
        }}>
          Seguir comprando
        </a>
      </div>
    </div>
  );
}

export default OrdenExitosa;