import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CULQI_SECRET_KEY = Deno.env.get('CULQI_SECRET_KEY');
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { pedido_id, culqi_token } = await req.json();

    if (!pedido_id || !culqi_token) {
      return errorResponse('pedido_id y culqi_token son requeridos', 400);
    }

    // Obtener el pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', pedido_id)
      .eq('estado', 'pendiente')
      .single();

    if (pedidoError || !pedido) {
      return errorResponse('Pedido no encontrado o ya fue procesado', 404);
    }

    // Crear cargo en Culqi
    const totalCentimos = Math.round(pedido.total * 100);

    const culqiResponse = await fetch('https://api.culqi.com/v2/charges', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${CULQI_SECRET_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        amount:        totalCentimos,
        currency_code: 'PEN',
        email:         pedido.envio_nombre ?? 'cliente@lilyscaffe.pe',
        source_id:     culqi_token,
        description:   `Pedido #${pedido_id.slice(0, 8).toUpperCase()}`,
        capture:       true,
        metadata:      { pedido_id },
      }),
    });

    const culqiData = await culqiResponse.json();

    // Si Culqi rechazó el cargo
    if (!culqiResponse.ok || culqiData.object !== 'charge') {
      await supabase
        .from('pedidos')
        .update({ estado: 'fallido' })
        .eq('id', pedido_id);

      return errorResponse(culqiData.user_message ?? 'Pago rechazado', 402);
    }

    // Actualizar pedido como pagado
    await supabase
      .from('pedidos')
      .update({
        estado:          'pagado',
        culqi_charge_id: culqiData.id,
        metodo_pago:     'tarjeta',
      })
      .eq('id', pedido_id);

    // Descontar stock
    await supabase.rpc('decrementar_stock', { p_pedido_id: pedido_id });

    return new Response(JSON.stringify({
      success:   true,
      pedido_id,
      charge_id: culqiData.id,
      estado:    'pagado',
    }), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en procesar-pago:', err);
    return errorResponse('Error interno del servidor', 500);
  }
});

function errorResponse(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}