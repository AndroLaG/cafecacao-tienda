import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  try {
    const rawBody = await req.text();
    let evento;

    try {
      evento = JSON.parse(rawBody);
    } catch {
      return new Response('JSON inválido', { status: 400 });
    }

    console.log('Evento Culqi recibido:', evento.type);

    const charge = evento.data?.object;

    switch (evento.type) {

      case 'charge.update': {
        if (!charge?.id) break;

        const nuevoEstado = charge.outcome?.type === 'authorized'
          ? 'pagado'
          : 'fallido';

        await supabase
          .from('pedidos')
          .update({ estado: nuevoEstado })
          .eq('culqi_charge_id', charge.id);

        if (nuevoEstado === 'pagado') {
          const { data: pedido } = await supabase
            .from('pedidos')
            .select('id')
            .eq('culqi_charge_id', charge.id)
            .single();

          if (pedido) {
            await supabase.rpc('decrementar_stock', { p_pedido_id: pedido.id });
          }
        }
        break;
      }

      case 'charge.chargeback': {
        if (!charge?.id) break;
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
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en culqi-webhook:', err);
    return new Response('Error interno', { status: 500 });
  }
});