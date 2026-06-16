import { supabase } from './supabaseClient';

export async function crearPedido({ clienteId, items, subtotal, costoEnvio, total, datosEnvio, emailInvitado }) {
  // Paso 1: Insertar el pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      cliente_id:          clienteId ?? null,
      email_invitado:      clienteId ? null : emailInvitado,
      subtotal,
      costo_envio:         costoEnvio,
      total,
      estado:              'pendiente',
      envio_nombre:        datosEnvio.nombre,
      envio_telefono:      datosEnvio.telefono,
      envio_direccion:     datosEnvio.direccion,
      envio_distrito:      datosEnvio.distrito,
      envio_provincia:     datosEnvio.provincia,
      envio_departamento:  datosEnvio.departamento,
      envio_codigo_postal: datosEnvio.codigo_postal ?? null, // ✅ NUEVO
    })
    .select()
    .single();

  if (pedidoError) throw pedidoError;

  // Paso 2: Insertar los items
  const pedidoItems = items.map(item => ({
    pedido_id:       pedido.id,
    producto_id:     item.id,
    nombre_producto: item.nombre,
    precio_unitario: item.precio,
    cantidad:        item.cantidad,
  }));

  const { error: itemsError } = await supabase
    .from('pedido_items')
    .insert(pedidoItems);

  if (itemsError) throw itemsError;

  return pedido;
}