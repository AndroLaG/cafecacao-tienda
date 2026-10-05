import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { crearPedido } from '../services/orderService';
import { cargarSDKCulqi, abrirModalCulqi } from '../services/culqiService';
import { supabase } from '../services/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MAPA_TIENDA = 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d456.7622107005761!2d-76.97417614723366!3d-12.141286537917638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTLCsDA4JzI4LjciUyA3NsKwNTgnMjUuOSJX!5e1!3m2!1ses!2spe!4v1791093634679!5m2!1ses!2spe';

function Checkout() {
  const { items, subtotal, costoEnvio, total, clearCart } = useCart();
  const { user } = useAuth();

  const [tipoEntrega,        setTipoEntrega]        = useState('envio');
  const [direcciones,        setDirecciones]        = useState([]);
  const [direccionSelId,     setDireccionSelId]     = useState(null);
  const [mostrarFormNueva,   setMostrarFormNueva]   = useState(false);
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);

  const [form, setForm] = useState({
    nombre:        '',
    email:         '',
    telefono:      '',
    alias:         'Mi dirección',
    direccion:     '',
    referencia:    '',
    distrito:      '',
    provincia:     '',
    departamento:  '',
    codigo_postal: '',
  });

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const totalFinal = tipoEntrega === 'recojo' ? subtotal : total;
  const envioFinal = tipoEntrega === 'recojo' ? 0 : costoEnvio;

  useEffect(function() {
    cargarSDKCulqi();
    if (user) {
      setForm(function(f) { return { ...f, email: user.email }; });
      cargarDirecciones();
    }
  }, [user]);

  async function cargarDirecciones() {
    var result = await supabase
      .from('direcciones')
      .select('*')
      .eq('cliente_id', user.id)
      .order('es_principal', { ascending: false })
      .order('created_at',   { ascending: false });

    var data = result.data;
    if (data && data.length > 0) {
      setDirecciones(data);
      var principal = data.find(function(d) { return d.es_principal; }) ?? data[0];
      setDireccionSelId(principal.id);
      aplicarDireccion(principal);
    } else {
      setMostrarFormNueva(true);
    }
  }

  function aplicarDireccion(dir) {
    setForm(function(f) {
      return {
        ...f,
        nombre:        dir.nombre        ?? '',
        telefono:      dir.telefono      ?? '',
        alias:         dir.alias         ?? 'Mi dirección',
        direccion:     dir.direccion     ?? '',
        referencia:    dir.referencia    ?? '',
        distrito:      dir.distrito      ?? '',
        provincia:     dir.provincia     ?? '',
        departamento:  dir.departamento  ?? '',
        codigo_postal: dir.codigo_postal ?? '',
      };
    });
  }

  function handleSeleccionarDireccion(dir) {
    setDireccionSelId(dir.id);
    aplicarDireccion(dir);
    setMostrarFormNueva(false);
  }

  async function handleGuardarNuevaDireccion() {
    if (!form.nombre || !form.direccion || !form.distrito) {
      setError('Completa los campos obligatorios de la dirección.');
      return;
    }
    setGuardandoDireccion(true);
    setError(null);

    var esPrimera = direcciones.length === 0;
    var result = await supabase
      .from('direcciones')
      .insert({
        cliente_id:    user.id,
        alias:         form.alias        || 'Mi dirección',
        nombre:        form.nombre,
        telefono:      form.telefono,
        direccion:     form.direccion,
        referencia:    form.referencia   || null,
        distrito:      form.distrito,
        provincia:     form.provincia,
        departamento:  form.departamento,
        codigo_postal: form.codigo_postal || null,
        es_principal:  esPrimera,
      })
      .select()
      .single();

    if (result.error) {
      setError('Error al guardar la dirección: ' + result.error.message);
    } else {
      var nuevaLista = [...direcciones, result.data];
      setDirecciones(nuevaLista);
      setDireccionSelId(result.data.id);
      setMostrarFormNueva(false);
    }
    setGuardandoDireccion(false);
  }

  async function handleEliminarDireccion(id) {
    await supabase.from('direcciones').delete().eq('id', id);
    var nuevaLista = direcciones.filter(function(d) { return d.id !== id; });
    setDirecciones(nuevaLista);
    if (direccionSelId === id) {
      if (nuevaLista.length > 0) {
        setDireccionSelId(nuevaLista[0].id);
        aplicarDireccion(nuevaLista[0]);
      } else {
        setDireccionSelId(null);
        setMostrarFormNueva(true);
      }
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (tipoEntrega === 'envio' && !form.direccion) {
      setError('Agrega una dirección de envío.');
      setLoading(false);
      return;
    }

    try {
      var pedido = await crearPedido({
        clienteId:     user?.id ?? null,
        emailInvitado: user ? null : form.email,
        items,
        subtotal,
        costoEnvio:    envioFinal,
        total:         totalFinal,
        datosEnvio:    form,
        tipoEntrega,
      });
      handlePago(pedido.id);
    } catch (err) {
      setError('Error al crear el pedido: ' + err.message);
      setLoading(false);
    }
  }

  async function handlePago(pedidoId) {
    abrirModalCulqi({
      total: totalFinal,
      email: user?.email ?? form.email,
      onToken: async function(token) {
        setLoading(true);
        setError(null);
        try {
          var result = await supabase.functions.invoke('procesar-pago', {
            body: { pedido_id: pedidoId, culqi_token: token },
          });
          if (result.error) throw result.error;
          if (result.data?.error) throw new Error(result.data.error);

          if (user) {
            await supabase.from('clientes').upsert({
              id:              user.id,
              nombre_completo: form.nombre,
              telefono:        form.telefono,
              direccion:       form.direccion,
              distrito:        form.distrito,
              provincia:       form.provincia,
              departamento:    form.departamento,
              codigo_postal:   form.codigo_postal,
            }, { onConflict: 'id' });
          }

          clearCart();
          window.location.href = 'https://www.lilyscaffe.com/orden-exitosa';
        } catch (err) {
          setError('Error al procesar el pago: ' + err.message);
        } finally {
          setLoading(false);
        }
      },
      onError: function(msg) {
        setError('Error en el pago: ' + msg);
      },
    });
  }

  var inputStyle = {
    width:           '100%',
    padding:         '0.75rem 1rem',
    borderRadius:    'var(--radius-md)',
    border:          '1px solid #e0d5c8',
    fontFamily:      'var(--font-body)',
    fontSize:        '0.95rem',
    color:           'var(--color-texto)',
    backgroundColor: '#fff',
    outline:         'none',
  };

  var labelStyle = {
    fontSize:     '0.85rem',
    fontWeight:   '600',
    color:        'var(--color-texto-muted)',
    display:      'block',
    marginBottom: '0.4rem',
  };

  function opcionEntregaStyle(activa) {
    return {
      flex:            1,
      padding:         '1rem',
      borderRadius:    'var(--radius-md)',
      border:          activa ? '2px solid var(--color-marron)' : '1px solid #e0d5c8',
      backgroundColor: activa ? 'var(--color-crema)' : '#fff',
      cursor:          'pointer',
      transition:      'all 0.2s',
      textAlign:       'left',
    };
  }

  if (items.length === 0 && !loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--color-texto-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>Tu carrito está vacío.</p>
          <a href="/" style={{ display: 'inline-block', marginTop: '1rem', backgroundColor: 'var(--color-marron)', color: 'var(--color-crema)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: '600' }}>
            Ver productos
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          Finalizar compra
        </h2>

        {user && (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-texto-muted)', marginBottom: '1.5rem' }}>
            Comprando como <strong>{user.email}</strong>
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>

          {/* ── Columna izquierda ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email invitado */}
            {!user && (
              <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
                <label style={labelStyle}>Correo electrónico</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" required style={inputStyle} />
                <p style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)', marginTop: '0.5rem' }}>
                  ¿Ya tienes cuenta?{' '}
                  <a href="/auth?from=checkout" style={{ color: 'var(--color-marron)', fontWeight: '600' }}>Inicia sesión</a>
                </p>
              </div>
            )}

            {/* Tipo de entrega */}
            <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '1rem' }}>
                ¿Cómo quieres recibir tu pedido?
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={function() { setTipoEntrega('envio'); }} style={opcionEntregaStyle(tipoEntrega === 'envio')}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🚚</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-marron)' }}>Envío a domicilio</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)', marginTop: '0.2rem' }}>
                    {costoEnvio === 0 ? 'Gratis' : 'S/ ' + costoEnvio.toFixed(2)}
                  </div>
                </button>
                <button type="button" onClick={function() { setTipoEntrega('recojo'); }} style={opcionEntregaStyle(tipoEntrega === 'recojo')}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🏪</div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-marron)' }}>Recojo en tienda</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)', marginTop: '0.2rem' }}>Gratis siempre</div>
                </button>
              </div>
            </div>

            {/* ── ENVÍO A DOMICILIO ── */}
            {tipoEntrega === 'envio' && (
              <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '1rem' }}>
                  Dirección de envío
                </h3>

                <div style={{ backgroundColor: '#fff8e1', border: '1px solid #f59e0b', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.875rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#92400e' }}>
                  🚚 Solo enviamos dentro de <strong>Lima Metropolitana</strong>.
                </div>

                {/* Lista de direcciones guardadas */}
                {user && direcciones.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {direcciones.map(function(dir) {
                      var seleccionada = direccionSelId === dir.id;
                      return (
                        <div
                          key={dir.id}
                          onClick={function() { handleSeleccionarDireccion(dir); }}
                          style={{
                            border:          seleccionada ? '2px solid var(--color-marron)' : '1px solid #e0d5c8',
                            borderRadius:    'var(--radius-md)',
                            padding:         '0.75rem 1rem',
                            backgroundColor: seleccionada ? 'var(--color-crema)' : '#fff',
                            cursor:          'pointer',
                            transition:      'all 0.2s',
                            display:         'flex',
                            justifyContent:  'space-between',
                            alignItems:      'flex-start',
                            gap:             '0.75rem',
                          }}
                        >
                          {/* ✅ Contenido de la dirección */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--color-marron)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              {dir.alias}
                              {dir.es_principal && (
                                <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-oliva)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>
                                  Principal
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)', marginBottom: '0.1rem' }}>
                              {dir.nombre}{dir.telefono ? ' — +51 ' + dir.telefono : ''}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-texto-muted)', marginBottom: '0.1rem' }}>
                              {dir.direccion}, {dir.distrito}
                            </div>
                            {dir.referencia && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--color-texto-muted)' }}>
                                Ref: {dir.referencia}
                              </div>
                            )}
                          </div>

                          {/* ✅ Botones Editar / Eliminar — separados del contenido */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={function(e) {
                                e.stopPropagation();
                                handleSeleccionarDireccion(dir);
                                setMostrarFormNueva(true);
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--color-oliva)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'right' }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={function(e) { e.stopPropagation(); handleEliminarDireccion(dir.id); }}
                              style={{ background: 'none', border: 'none', color: 'var(--color-granate)', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)', textAlign: 'right', opacity: 0.8 }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Botón agregar nueva */}
                {user && !mostrarFormNueva && (
                  <button
                    type="button"
                    onClick={function() { setMostrarFormNueva(true); }}
                    style={{
                      width:           '100%',
                      padding:         '0.6rem',
                      border:          '1px dashed var(--color-marron)',
                      borderRadius:    'var(--radius-md)',
                      backgroundColor: 'transparent',
                      color:           'var(--color-marron)',
                      fontSize:        '0.875rem',
                      fontWeight:      '600',
                      fontFamily:      'var(--font-body)',
                      cursor:          'pointer',
                      marginBottom:    '1rem',
                    }}
                  >
                    + Agregar nueva dirección
                  </button>
                )}

                {/* Formulario nueva dirección */}
                {(mostrarFormNueva || !user) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    {user && (
                      <div>
                        <label style={labelStyle}>Alias de la dirección</label>
                        <input name="alias" value={form.alias} onChange={handleChange} placeholder="Casa, Trabajo, etc." style={inputStyle} />
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
                      <div>
                        <label style={labelStyle}>Nombre completo *</label>
                        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Andrés Sánchez" required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Teléfono *</label>
                        <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="999 999 999" required style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Dirección *</label>
                      <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Av. Ejemplo 123, Dpto 4B" required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Referencia</label>
                      <input name="referencia" value={form.referencia} onChange={handleChange} placeholder="Frente al parque, cerca al mercado..." style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.875rem' }}>
                      <div>
                        <label style={labelStyle}>Distrito *</label>
                        <input name="distrito" value={form.distrito} onChange={handleChange} placeholder="Miraflores" required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Provincia</label>
                        <input name="provincia" value={form.provincia} onChange={handleChange} placeholder="Lima" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Departamento</label>
                        <input name="departamento" value={form.departamento} onChange={handleChange} placeholder="Lima" style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Cód. postal</label>
                        <input name="codigo_postal" value={form.codigo_postal} onChange={handleChange} placeholder="15001" style={inputStyle} />
                      </div>
                    </div>

                    {user && (
                      <button
                        type="button"
                        onClick={handleGuardarNuevaDireccion}
                        disabled={guardandoDireccion}
                        style={{
                          backgroundColor: guardandoDireccion ? 'var(--color-texto-muted)' : 'var(--color-oliva)',
                          color:           '#fff',
                          border:          'none',
                          borderRadius:    'var(--radius-md)',
                          padding:         '0.6rem',
                          fontSize:        '0.875rem',
                          fontWeight:      '600',
                          fontFamily:      'var(--font-body)',
                          cursor:          guardandoDireccion ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {guardandoDireccion ? 'Guardando...' : 'Guardar dirección'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── RECOJO EN TIENDA ── */}
            {tipoEntrega === 'recojo' && (
              <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-card)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1rem', marginBottom: '0.75rem' }}>
                  Recojo en tienda
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-texto-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                  Puedes recoger tu pedido en nuestra tienda. Te avisaremos por correo cuando esté listo.
                </p>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
                  <iframe
                    src={MAPA_TIENDA}
                    width="100%"
                    height="250"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Ubicación de la tienda"
                  />
                </div>
                <div style={{ backgroundColor: 'var(--color-crema)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-texto-muted)', marginBottom: '1rem' }}>
                  📍 <strong>Villa San Luis, Pamplona Alta</strong> — San Juan de Miraflores, Lima
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
                    <div>
                      <label style={labelStyle}>Nombre completo *</label>
                      <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Andrés Sánchez" required style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Teléfono *</label>
                      <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="999 999 999" required style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', color: 'var(--color-granate)', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? 'var(--color-texto-muted)' : 'var(--color-marron)',
                color:           'var(--color-crema)',
                border:          'none',
                borderRadius:    'var(--radius-md)',
                padding:         '0.875rem',
                fontSize:        '1rem',
                fontWeight:      '600',
                fontFamily:      'var(--font-body)',
                width:           '100%',
                cursor:          loading ? 'not-allowed' : 'pointer',
                transition:      'background-color 0.2s',
              }}
            >
              {loading ? 'Procesando...' : 'Confirmar y pagar — S/ ' + totalFinal.toFixed(2)}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--color-texto-muted)', textAlign: 'center' }}>
              🔒 Pago seguro procesado por Culqi
            </p>
          </form>

          {/* ── Resumen del pedido ── */}
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '1.5rem', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-marron)', fontSize: '1.1rem', marginBottom: '1rem' }}>
              Resumen del pedido
            </h3>

            {items.map(function(item) {
              return (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f0e8de', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-texto)' }}>{item.nombre} × {item.cantidad}</span>
                  <span style={{ fontWeight: '600', color: 'var(--color-marron)' }}>S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              );
            })}

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-texto-muted)' }}>Subtotal</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-texto-muted)' }}>Envío</span>
                <span style={{ color: envioFinal === 0 ? 'green' : 'inherit', fontWeight: '600' }}>
                  {envioFinal === 0 ? 'Gratis' : 'S/ ' + envioFinal.toFixed(2)}
                </span>
              </div>
              {tipoEntrega === 'recojo' && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#166534', marginBottom: '1rem' }}>
                  🏪 Recojo en tienda — envío gratis
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid var(--color-marron)' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-marron)' }}>
                  S/ {totalFinal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;