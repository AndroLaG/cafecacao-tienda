import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AdminPedidos   from '../components/admin/AdminPedidos';
import AdminProductos from '../components/admin/AdminProductos';
import AdminReportes  from '../components/admin/AdminReportes';

const ADMIN_EMAIL = 'lilyscaffe26@gmail.com';
const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pedidos',   label: 'Pedidos'   },
  { id: 'productos', label: 'Productos' },
  { id: 'reportes',  label: 'Reportes'  },
];

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function cargar() {
      const [{ data: pedidos }, { data: productos }] = await Promise.all([
        supabase.from('pedidos').select('estado, total, created_at'),
        supabase.from('productos').select('stock, activo'),
      ]);

      const hoy = new Date().toDateString();
      const pedidosHoy = pedidos?.filter(p => new Date(p.created_at).toDateString() === hoy).length ?? 0;
      const ventasHoy  = pedidos
        ?.filter(p => new Date(p.created_at).toDateString() === hoy && ['pagado', 'preparando', 'enviado', 'entregado'].includes(p.estado))
        .reduce((acc, p) => acc + Number(p.total), 0) ?? 0;
      const pendientes = pedidos?.filter(p => p.estado === 'pendiente').length ?? 0;
      const stockBajo  = productos?.filter(p => p.stock < 10 && p.activo).length ?? 0;

      setStats({ pedidosHoy, ventasHoy, pendientes, stockBajo, totalPedidos: pedidos?.length ?? 0 });
    }
    cargar();
  }, []);

  if (!stats) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-texto-muted)' }}>
      Cargando dashboard...
    </div>
  );

  const tarjetas = [
    { label: 'Pedidos hoy',      valor: stats.pedidosHoy,              color: 'var(--color-marron)' },
    { label: 'Ventas hoy',       valor: `S/ ${stats.ventasHoy.toFixed(2)}`, color: '#166534'         },
    { label: 'Pendientes',       valor: stats.pendientes,              color: '#854d0e'              },
    { label: 'Stock bajo',       valor: stats.stockBajo,               color: '#991b1b'              },
    { label: 'Pedidos totales',  valor: stats.totalPedidos,            color: 'var(--color-oliva)'   },
  ];

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
        Resumen general
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {tarjetas.map(t => (
          <div key={t.label} style={{
            backgroundColor: '#fff',
            borderRadius:    'var(--radius-lg)',
            padding:         '1.5rem',
            boxShadow:       'var(--shadow-card)',
            textAlign:       'center',
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: t.color, fontFamily: 'var(--font-heading)' }}>
              {t.valor}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-texto-muted)', marginTop: '0.25rem' }}>
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Admin() {
  const { user, loading } = useAuth();
  const [tab, setTab]     = useState('dashboard');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--color-texto-muted)' }}>Cargando...</p>
    </div>
  );

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🔐</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.5rem' }}>
            Acceso restringido
          </h2>
          <p style={{ color: 'var(--color-texto-muted)', textAlign: 'center' }}>
            Esta página es solo para administradores de Lily's Caffe.
          </p>
          <a href="/" style={{
            backgroundColor: 'var(--color-marron)',
            color:           '#fff',
            padding:         '0.75rem 1.5rem',
            borderRadius:    'var(--radius-md)',
            fontWeight:      '600',
            textDecoration:  'none',
          }}>
            Volver al inicio
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.75rem' }}>
            Panel de administración
          </h1>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-texto-muted)' }}>
            {user.email}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #f0e8de', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:         '0.75rem 1.5rem',
                border:          'none',
                borderBottom:    tab === t.id ? '2px solid var(--color-marron)' : '2px solid transparent',
                backgroundColor: 'transparent',
                fontFamily:      'var(--font-body)',
                fontSize:        '0.95rem',
                fontWeight:      tab === t.id ? '700' : '400',
                color:           tab === t.id ? 'var(--color-marron)' : 'var(--color-texto-muted)',
                cursor:          'pointer',
                marginBottom:    '-2px',
                transition:      'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido del tab activo */}
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'pedidos'   && <AdminPedidos />}
        {tab === 'productos' && <AdminProductos />}
        {tab === 'reportes'  && <AdminReportes />}
      </main>

      <Footer />
    </div>
  );
}

export default Admin;