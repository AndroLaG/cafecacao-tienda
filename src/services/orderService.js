import { supabase } from './supabaseClient';

export async function crearPedido({ clienteId, items, subtotal, costoEnvio, total, datosEnvio, emailInvitado, tipoEntrega }) {
  const esRecojo = tipoEntrega === 'recojo';

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      cliente_id:          clienteId ?? null,
      email_invitado:      clienteId ? null : emailInvitado,
      subtotal,
      costo_envio:         esRecojo ? 0 : costoEnvio,
      total:               esRecojo ? subtotal : total,
      estado:              'pendiente',
      tipo_entrega:        tipoEntrega ?? 'envio',
      envio_nombre:        datosEnvio.nombre,
      envio_telefono:      datosEnvio.telefono,
      envio_direccion:     esRecojo ? 'Recojo en tienda' : datosEnvio.direccion,
      envio_referencia:    esRecojo ? null : (datosEnvio.referencia ?? null),
      envio_distrito:      esRecojo ? 'San Juan de Miraflores' : datosEnvio.distrito,
      envio_provincia:     esRecojo ? 'Lima' : datosEnvio.provincia,
      envio_departamento:  esRecojo ? 'Lima' : datosEnvio.departamento,
      envio_codigo_postal: esRecojo ? null : (datosEnvio.codigo_postal ?? null),
    })
    .select()
    .single();

  if (pedidoError) throw pedidoError;

  const pedidoItems = items.map(function(item) {
    return {
      pedido_id:       pedido.id,
      producto_id:     item.id,
      nombre_producto: item.nombre,
      precio_unitario: item.precio,
      cantidad:        item.cantidad,
    };
  });

  const { error: itemsError } = await supabase
    .from('pedido_items')
    .insert(pedidoItems);

  if (itemsError) throw itemsError;

  return pedido;
}