import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY      = Deno.env.get('SERVICE_ROLE_KEY');
const CULQI_WEBHOOK_USER    = Deno.env.get('CULQI_WEBHOOK_USER');
const CULQI_WEBHOOK_PASS    = Deno.env.get('CULQI_WEBHOOK_PASS');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Validar Basic Auth enviado por Culqi
function validarAutenticacion(req: Request): boolean {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.warn('Webhook sin header Authorization');
    return false;
  }

  const base64 = authHeader.replace('Basic ', '');
  const decoded = atob(base64);
  const [user, pass] = decoded.split(':');

  const userValido = user === CULQI_WEBHOOK_USER;
  const passValida = pass === CULQI_WEBHOOK_PASS;

  if (!userValido || !passValida) {
    console.warn('Credenciales de webhook inválidas');
    return false;
  }

  return true;
}

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  // ── PASO 1: Validar autenticación Basic Auth de Culqi
  if (!validarAutenticacion(req)) {
    return new Response('No autorizado', { status: 401 });
  }

  try {
    const rawBody = await req.text();
    let evento;

    try {
      evento = JSON.parse(rawBody);
    } catch {
      return new Response('JSON inválido', { status: 400 });
    }

    console.log('Evento Culqi recibido:', evento.type, '| ID:', evento.data?.object?.id);

    const charge = evento.data?.object;

    switch (evento.type) {

      // ── Cargo actualizado (incluye Yape y Plin asíncronos)
      case 'charge.update.succeeded': {
        if (!charge?.id) break;

        console.log('Procesando charge.update.succeeded para:', charge.id);

        // Buscar el pedido por el charge ID
        const { data: pedido, error: busquedaError } = await supabase
          .from('pedidos')
          .select('id, estado')
          .eq('culqi_charge_id', charge.id)
          .single();

        if (busquedaError || !pedido) {
          console.error('Pedido no encontrado para charge:', charge.id);
          break;
        }

        // Solo procesar si el pedido está pendiente (evitar doble procesamiento)
        if (pedido.estado !== 'pendiente') {
          console.log('Pedido ya procesado, estado actual:', pedido.estado);
          break;
        }

        // Determinar nuevo estado según el outcome del cargo
        const outcome = charge.outcome?.type ?? charge.status;
        const nuevoEstado = (outcome === 'authorized' || outcome === 'venta_exitosa')
          ? 'pagado'
          : 'fallido';

        console.log('Outcome:', outcome, '→ Estado:', nuevoEstado);

        await supabase
          .from('pedidos')
          .update({ estado: nuevoEstado })
          .eq('id', pedido.id);

        // Si el pago fue exitoso, descontar stock
        if (nuevoEstado === 'pagado') {
          const { error: stockError } = await supabase
            .rpc('decrementar_stock', { p_pedido_id: pedido.id });

          if (stockError) {
            console.error('Error al decrementar stock:', stockError.message);
          } else {
            console.log('Stock decrementado para pedido:', pedido.id);
          }
        }
        break;
      }

      // ── Contracargo recibido
      case 'charge.chargeback': {
        if (!charge?.id) break;

        console.log('Contracargo recibido para charge:', charge.id);

        await supabase
          .from('pedidos')
          .update({
            estado: 'cancelado',
            notas:  'Contracargo recibido — revisión pendiente',
          })
          .eq('culqi_charge_id', charge.id);
        break;
      }

      default:
        console.log('Evento no manejado:', evento.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status:  200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en culqi-webhook:', err);
    return new Response('Error interno', { status: 500 });
  }
});