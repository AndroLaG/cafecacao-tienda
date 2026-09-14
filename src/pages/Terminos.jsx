import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function Seccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{
        fontFamily:   'var(--font-heading)',
        color:        'var(--color-marron)',
        fontSize:     '1.25rem',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '2px solid var(--color-crema)',
      }}>
        {titulo}
      </h2>
      <div style={{ color: 'var(--color-texto)', fontSize: '0.95rem', lineHeight: '1.8' }}>
        {children}
      </div>
    </div>
  );
}

function Terminos() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '3rem 1.5rem', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{
            fontFamily:   'var(--font-heading)',
            color:        'var(--color-marron)',
            fontSize:     'clamp(1.75rem, 4vw, 2.25rem)',
            marginBottom: '0.5rem',
          }}>
            Términos, Condiciones y Políticas
          </h1>
          <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.875rem' }}>
            Última actualización: {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <Seccion titulo="1. Información general">
          <p>
            <strong>Lily's Caffe</strong> es una tienda online peruana dedicada a la venta de café y cacao
            de origen natural, cultivados en Pangoa, región Junín. Al acceder y realizar compras en
            <strong> www.lilyscaffe.com</strong>, el usuario acepta los presentes términos y condiciones.
          </p>
        </Seccion>

        <Seccion titulo="2. Productos y precios">
          <p style={{ marginBottom: '0.75rem' }}>
            Todos nuestros productos son de origen peruano, cultivados de forma natural y sin aditivos artificiales.
            Los precios están expresados en <strong>Soles peruanos (S/)</strong> e incluyen IGV cuando corresponda.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            Lily's Caffe se reserva el derecho de modificar los precios sin previo aviso. El precio válido
            es el que se muestra al momento de confirmar el pedido.
          </p>
          <p>
            Las imágenes de los productos son referenciales. Pueden existir variaciones mínimas en el
            empaque o presentación sin afectar la calidad del producto.
          </p>
        </Seccion>

        <Seccion titulo="3. Proceso de compra">
          <p style={{ marginBottom: '0.75rem' }}>
            El proceso de compra en Lily's Caffe se realiza en los siguientes pasos:
          </p>
          <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Selección de productos y agregado al carrito.</li>
            <li>Ingreso de datos de envío (nombre, teléfono, dirección).</li>
            <li>Selección del método de pago (tarjeta, Yape).</li>
            <li>Confirmación del pedido y pago seguro a través de Culqi.</li>
            <li>Recepción de confirmación por correo electrónico.</li>
          </ol>
        </Seccion>

        <Seccion titulo="4. Métodos de pago">
          <p style={{ marginBottom: '0.75rem' }}>
            Aceptamos los siguientes métodos de pago, procesados de forma segura por <strong>Culqi</strong>,
            plataforma certificada PCI-DSS:
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Tarjetas de débito y crédito Visa y Mastercard.</li>
            <li>Yape.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Lily's Caffe no almacena datos de tarjetas. Toda la información de pago es procesada
            directamente por Culqi con encriptación SSL.
          </p>
        </Seccion>

        <Seccion titulo="5. Envíos y entregas">
          <p style={{ marginBottom: '0.75rem' }}>
            Por el momento, Lily's Caffe realiza envíos <strong>únicamente dentro de Lima Metropolitana</strong>.
            Si te encuentras en provincia, puedes contactarnos para coordinar una alternativa.
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Costo de envío: <strong>S/ 15.00</strong>.</li>
            <li>Envío gratuito en pedidos mayores a <strong>S/ 40.00</strong>.</li>
            <li>Tiempo estimado de entrega: 2 a 5 días hábiles dentro de Lima.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Los tiempos de entrega son referenciales y pueden variar según la zona y disponibilidad.
          </p>
        </Seccion>

        <Seccion titulo="6. Política de devoluciones y cambios">
          <p style={{ marginBottom: '0.75rem' }}>
            En Lily's Caffe nos comprometemos con la calidad de nuestros productos. Aceptamos
            devoluciones y cambios en los siguientes casos:
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Producto recibido en mal estado o con defectos de calidad.</li>
            <li>Producto diferente al pedido.</li>
            <li>Producto vencido o con empaque dañado.</li>
          </ul>
          <p style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
            <strong>Condiciones para devolución:</strong>
          </p>
          <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>El reclamo debe realizarse dentro de las <strong>48 horas</strong> de recibido el producto.</li>
            <li>El producto debe estar sin abrir y en su empaque original.</li>
            <li>Se debe presentar foto del producto como evidencia.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Para iniciar una devolución, contáctanos a{' '}
            <a href="mailto:contacto@lilyscaffe.pe" style={{ color: 'var(--color-marron)', fontWeight: '600' }}>
              contacto@lilyscaffe.pe
            </a>{' '}
            o llámanos al <strong>+51 924 029 050</strong>.
          </p>
        </Seccion>

        <Seccion titulo="7. Protección de datos personales">
          <p style={{ marginBottom: '0.75rem' }}>
            Lily's Caffe cumple con la <strong>Ley N° 29733 — Ley de Protección de Datos Personales</strong>
            del Perú. Los datos que recopilamos (nombre, correo, teléfono, dirección) se usan
            exclusivamente para procesar pedidos y mejorar tu experiencia de compra.
          </p>
          <p>
            No compartimos tu información con terceros salvo los necesarios para procesar
            pagos (Culqi) y realizar envíos. Puedes solicitar la eliminación de tus datos
            escribiéndonos a <a href="mailto:contacto@lilyscaffe.pe" style={{ color: 'var(--color-marron)', fontWeight: '600' }}>contacto@lilyscaffe.pe</a>.
          </p>
        </Seccion>

        <Seccion titulo="8. Propiedad intelectual">
          <p>
            Todo el contenido de <strong>www.lilyscaffe.com</strong> — incluyendo imágenes, textos,
            logotipos y diseño — es propiedad de Lily's Caffe y está protegido por las leyes de
            propiedad intelectual vigentes en el Perú. Queda prohibida su reproducción sin
            autorización expresa.
          </p>
        </Seccion>

        <Seccion titulo="9. Contacto">
          <p>Para cualquier consulta sobre estos términos:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>📧 <a href="mailto:contacto@lilyscaffe.pe" style={{ color: 'var(--color-marron)' }}>contacto@lilyscaffe.pe</a></li>
            <li>📞 +51 924 029 050</li>
            <li>🌐 www.lilyscaffe.com</li>
          </ul>
        </Seccion>
      </main>

      <Footer />
    </div>
  );
}

export default Terminos;