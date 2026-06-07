import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// ── Colores por estado
const ESTADO_CONFIG = {
  pendiente:   { label: 'Pendiente',   color: '#97862e', bg: 'rgba(151,134,46,0.12)'  },
  pagado:      { label: 'Pagado',      color: '#2e7d32', bg: 'rgba(46,125,50,0.12)'   },
  preparando:  { label: 'Preparando',  color: '#1565c0', bg: 'rgba(21,101,192,0.12)'  },
  enviado:     { label: 'Enviado',     color: '#6a1b9a', bg: 'rgba(106,27,154,0.12)'  },
  entregado:   { label: 'Entregado',   color: '#2e7d32', bg: 'rgba(46,125,50,0.15)'   },
  cancelado:   { label: 'Cancelado',   color: '#c62828', bg: 'rgba(198,40,40,0.10)'   },
  fallido:     { label: 'Fallido',     color: '#c62828', bg: 'rgba(198,40,40,0.10)'   },
};

function BadgeEstado({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, color: '#6b4c38', bg: 'rgba(107,76,56,0.1)' };
  return (
    <span style={{
      backgroundColor: cfg.bg,
      color:           cfg.color,
      border:          `1px solid ${cfg.color}40`,
      borderRadius:    'var(--radius-pill)',
      padding:         '0.25rem 0.75rem',
      fontSize:        '0.78rem',
      fontWeight:      '600',
    }}>
      {cfg.label}
    </span>
  );
}

function TarjetaPedido({ pedido }) {
  const [expandido, setExpandido] = useState(false);
  const fecha = new Date(pedido.created_at).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const numeroCorto = pedido.id.slice(0, 8).toUpperCase();

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius:    'var(--radius-lg)',
      boxShadow:       'var(--shadow-card)',
      overflow:        'hidden',
      transition:      'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-hover)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
    >
      {/* Cabecera del pedido */}
      <div style={{
        padding:        '1.25rem 1.5rem',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        flexWrap:       'wrap',
        gap:            '0.75rem',
        borderBottom:   expandido ? '1px solid #f0e8dc' : 'none',
        cursor:         'pointer',
      }}
        onClick={() => setExpandido(prev => !prev)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Número de pedido */}
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-texto-muted)', margin: '0 0 2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pedido
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-marron)', margin: 0, fontWeight: '700', letterSpacing: '1px' }}>
              #{numeroCorto}
            </p>
          </div>

          {/* Fecha */}
          <div style={{ borderLeft: '1px solid #f0e8dc', paddingLeft: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-texto-muted)', margin: '0 0 2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Fecha
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-texto)', margin: 0 }}>
              {fecha}
            </p>
          </div>

          {/* Total */}
          <div style={{ borderLeft: '1px solid #f0e8dc', paddingLeft: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-texto-muted)', margin: '0 0 2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total
            </p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--color-marron)', margin: 0, fontWeight: '700' }}>
              S/ {Number(pedido.total).toFixed(2)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BadgeEstado estado={pedido.estado} />
          <span style={{
            color:      'var(--color-texto-muted)',
            fontSize:   '1rem',
            transition: 'transform 0.2s',
            transform:  expandido ? 'rotate(180deg)' : 'rotate(0deg)',
            display:    'inline-block',
          }}>
            ▾
          </span>
        </div>
      </div>

      {/* Detalle expandido */}
      {expandido && (
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Productos */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem' }}>
              Productos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pedido.pedido_items?.map(item => (
                <div key={item.id} style={{
                  display:         'flex',
                  justifyContent:  'space-between',
                  alignItems:      'center',
                  padding:         '0.6rem 0.75rem',
                  backgroundColor: 'var(--color-crema)',
                  borderRadius:    'var(--radius-md)',
                  flexWrap:        'wrap',
                  gap:             '0.5rem',
                }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-texto)' }}>
                    {item.nombre_producto}
                    <span style={{ color: 'var(--color-texto-muted)', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                      × {item.cantidad}
                    </span>
                  </span>
                  <span style={{ fontWeight: '600', color: 'var(--color-marron)', fontSize: '0.9rem' }}>
                    S/ {(item.precio_unitario * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totales y dirección */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>

            {/* Resumen de pago */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem' }}>
                Resumen
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-texto-muted)' }}>
                  <span>Subtotal</span>
                  <span>S/ {Number(pedido.subtotal).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-texto-muted)' }}>
                  <span>Envío</span>
                  <span>{pedido.costo_envio === 0 ? '🎉 Gratis' : `S/ ${Number(pedido.costo_envio).toFixed(2)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: 'var(--color-marron)', borderTop: '1px solid #f0e8dc', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                  <span>Total</span>
                  <span>S/ {Number(pedido.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.75rem' }}>
                Dirección de envío
              </h4>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-texto-muted)', lineHeight: '1.7' }}>
                <strong style={{ color: 'var(--color-texto)' }}>{pedido.envio_nombre}</strong><br />
                {pedido.envio_direccion}<br />
                {[pedido.envio_distrito, pedido.envio_provincia, pedido.envio_departamento].filter(Boolean).join(', ')}
                {pedido.envio_telefono && <><br />📞 {pedido.envio_telefono}</>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Página principal
function MisPedidos() {
  const { user, loading: authLoading } = useAuth();
  const [pedidos,  setPedidos]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    async function cargarPedidos() {
      setLoading(true);
      setError(null);
      try {
        // Buscar cliente por auth user id
        const { data: cliente } = await supabase
          .from('clientes')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!cliente) {
          setPedidos([]);
          setLoading(false);
          return;
        }

        const { data, error: pedidosError } = await supabase
          .from('pedidos')
          .select(`
            *,
            pedido_items (
              id,
              nombre_producto,
              precio_unitario,
              cantidad
            )
          `)
          .eq('cliente_id', cliente.id)
          .order('created_at', { ascending: false });

        if (pedidosError) throw pedidosError;
        setPedidos(data ?? []);
      } catch (err) {
        console.error(err);
        setError('No pudimos cargar tus pedidos. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    }

    cargarPedidos();
  }, [user, authLoading]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{
        flex:            1,
        backgroundColor: 'var(--color-crema)',
        padding:         '3rem 1.5rem',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Título */}
          <h1 style={{
            fontFamily:   'var(--font-heading)',
            color:        'var(--color-marron)',
            fontSize:     'clamp(1.75rem, 4vw, 2.25rem)',
            marginBottom: '0.5rem',
          }}>
            Mis Pedidos
          </h1>
          <div style={{
            width:           '50px',
            height:          '3px',
            backgroundColor: 'var(--color-oliva)',
            borderRadius:    'var(--radius-pill)',
            marginBottom:    '2rem',
          }} />

          {/* Estado: no logueado */}
          {!authLoading && !user && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius:    'var(--radius-lg)',
              boxShadow:       'var(--shadow-card)',
              padding:         '3rem',
              textAlign:       'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.3rem', marginBottom: '0.75rem' }}>
                Inicia sesión para ver tus pedidos
              </h2>
              <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Necesitas una cuenta para acceder a tu historial de pedidos.
              </p>
              <a href="/auth" style={{
                display:         'inline-block',
                backgroundColor: 'var(--color-marron)',
                color:           'var(--color-crema)',
                padding:         '0.75rem 2rem',
                borderRadius:    'var(--radius-pill)',
                fontWeight:      '600',
                fontSize:        '0.95rem',
                textDecoration:  'none',
                transition:      'background-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-marron-claro)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-marron)'}
              >
                Iniciar sesión
              </a>
            </div>
          )}

          {/* Estado: cargando */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>⏳</div>
              <p style={{ color: 'var(--color-texto-muted)' }}>Cargando tus pedidos...</p>
            </div>
          )}

          {/* Estado: error */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(198,40,40,0.08)',
              border:          '1px solid rgba(198,40,40,0.3)',
              borderRadius:    'var(--radius-lg)',
              padding:         '1.25rem 1.5rem',
              color:           '#c62828',
              fontSize:        '0.95rem',
            }}>
              {error}
            </div>
          )}

          {/* Estado: sin pedidos */}
          {!loading && !error && user && pedidos.length === 0 && (
            <div style={{
              backgroundColor: '#fff',
              borderRadius:    'var(--radius-lg)',
              boxShadow:       'var(--shadow-card)',
              padding:         '3rem',
              textAlign:       'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.3rem', marginBottom: '0.75rem' }}>
                Aún no tienes pedidos
              </h2>
              <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Cuando realices una compra aparecerá aquí.
              </p>
              <a href="/#productos" style={{
                display:         'inline-block',
                backgroundColor: 'var(--color-marron)',
                color:           'var(--color-crema)',
                padding:         '0.75rem 2rem',
                borderRadius:    'var(--radius-pill)',
                fontWeight:      '600',
                fontSize:        '0.95rem',
                textDecoration:  'none',
                transition:      'background-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-marron-claro)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-marron)'}
              >
                Ver productos
              </a>
            </div>
          )}

          {/* Lista de pedidos */}
          {!loading && !error && pedidos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>
                {pedidos.length} {pedidos.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
              </p>
              {pedidos.map(pedido => (
                <TarjetaPedido key={pedido.id} pedido={pedido} />
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default MisPedidos;