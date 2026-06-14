import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function Perfil() {
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    nombre_completo: '',
    telefono:        '',
    dni:             '',
    direccion:       '',
    distrito:        '',
    provincia:       '',
    departamento:    '',
    codigo_postal:   '',
  });

  const [loading,  setLoading]  = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje,  setMensaje]  = useState(null);

  useEffect(() => {
    if (!user) return;
    async function cargarPerfil() {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm({
          nombre_completo: data.nombre_completo ?? '',
          telefono:        data.telefono        ?? '',
          dni:             data.dni             ?? '',
          direccion:       data.direccion       ?? '',
          distrito:        data.distrito        ?? '',
          provincia:       data.provincia       ?? '',
          departamento:    data.departamento    ?? '',
          codigo_postal:   data.codigo_postal   ?? '',
        });
      }
      setLoading(false);
    }
    cargarPerfil();
  }, [user]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    const { error } = await supabase
      .from('clientes')
      .upsert({
        id: user.id,
        ...form,
      });

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message });
    } else {
      setMensaje({ tipo: 'ok', texto: '¡Perfil actualizado correctamente!' });
    }

    setGuardando(false);
    setTimeout(() => setMensaje(null), 4000);
  }

  const inputStyle = {
    width:           '100%',
    padding:         '0.75rem 1rem',
    borderRadius:    '8px',
    border:          '1px solid #e0d5c8',
    fontFamily:      'var(--font-body)',
    fontSize:        '0.95rem',
    color:           'var(--color-texto)',
    backgroundColor: '#fff',
    outline:         'none',
  };

  const labelStyle = {
    fontSize:     '0.85rem',
    fontWeight:   '600',
    color:        'var(--color-texto-muted)',
    display:      'block',
    marginBottom: '0.4rem',
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-texto-muted)' }}>Cargando perfil...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
            Mi perfil
          </h1>
          <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.9rem' }}>
            {user.email}
          </p>
        </div>

        {mensaje && (
          <div style={{
            backgroundColor: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
            color:           mensaje.tipo === 'ok' ? '#166534' : '#991b1b',
            border:          mensaje.tipo === 'ok' ? '1px solid #bbf7d0' : '1px solid #fecaca',
            padding:         '0.875rem 1rem',
            borderRadius:    '8px',
            marginBottom:    '1.5rem',
            fontSize:        '0.9rem',
            fontWeight:      '600',
          }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Datos personales */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              Datos personales
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  name="nombre_completo"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  placeholder="Andrés Sánchez"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="999 999 999"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>DNI</label>
                <input
                  name="dni"
                  value={form.dni}
                  onChange={handleChange}
                  placeholder="12345678"
                  maxLength={8}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              Dirección de envío
            </h2>
            <p style={{ color: 'var(--color-texto-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Esta dirección se autocompletará en tu próxima compra.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Dirección</label>
                <input
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Av. Ejemplo 123, Dpto 4B"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Distrito</label>
                  <input
                    name="distrito"
                    value={form.distrito}
                    onChange={handleChange}
                    placeholder="Miraflores"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Provincia</label>
                  <input
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    placeholder="Lima"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Departamento</label>
                  <input
                    name="departamento"
                    value={form.departamento}
                    onChange={handleChange}
                    placeholder="Lima"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Código postal</label>
                  <input
                    name="codigo_postal"
                    value={form.codigo_postal}
                    onChange={handleChange}
                    placeholder="15001"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            style={{
              backgroundColor: guardando ? 'var(--color-texto-muted)' : 'var(--color-marron)',
              color:           '#fff',
              border:          'none',
              borderRadius:    '8px',
              padding:         '0.875rem',
              fontSize:        '1rem',
              fontWeight:      '600',
              fontFamily:      'var(--font-body)',
              cursor:          guardando ? 'not-allowed' : 'pointer',
              transition:      'background-color 0.2s',
            }}
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default Perfil;