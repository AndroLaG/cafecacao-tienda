import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CULQI_SECRET_KEY = Deno.env.get('CULQI_SECRET_KEY');
const SUPABASE_URL     = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY');
const RESEND_API_KEY   = Deno.env.get('RESEND_API_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Envía el email de confirmación al cliente
async function enviarEmailConfirmacion(pedido, items) {
  try {
    const numeroCorto   = pedido.id.slice(0, 8).toUpperCase();
    const nombreCliente = pedido.envio_nombre || 'Cliente';
    const emailCliente  = pedido.email_invitado; // ← columna real

    if (!emailCliente) {
      console.log('Sin email_invitado, no se envía confirmación.');
      return;
    }

    // Filas de productos
    const filasProductos = items.map(item => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8dc;color:#1a0f0a;font-size:14px;">
          ${item.nombre_producto}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8dc;text-align:center;color:#6b4c38;font-size:14px;">
          ${item.cantidad}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8dc;text-align:right;color:#1a0f0a;font-size:14px;">
          S/ ${Number(item.precio_unitario).toFixed(2)}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0e8dc;text-align:right;font-weight:600;color:#6c2917;font-size:14px;">
          S/ ${(item.cantidad * item.precio_unitario).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const subtotal = items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0);
    const envio    = pedido.costo_envio ?? 0;
    const total    = subtotal + envio;

    // Dirección completa
    const direccionLineas = [
      pedido.envio_direccion,
      [pedido.envio_distrito, pedido.envio_provincia, pedido.envio_departamento]
        .filter(Boolean).join(', '),
    ].filter(Boolean).join('<br/>');

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Confirmación de pedido — Lily's Caffe</title>
</head>
<body style="margin:0;padding:0;background-color:#faf6ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(108,41,23,0.10);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6c2917 0%,#97522d 100%);padding:36px 32px;text-align:center;">
      <h1 style="margin:0;color:#faf6ef;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
        Lily's Caffe
      </h1>
      <p style="margin:8px 0 0;color:rgba(250,246,239,0.8);font-size:14px;">
        Café y cacao de origen peruano
      </p>
    </div>

    <!-- Mensaje principal -->
    <div style="padding:32px 32px 0;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h2 style="margin:0 0 8px;color:#6c2917;font-size:22px;font-weight:700;">
        ¡Pedido confirmado!
      </h2>
      <p style="margin:0;color:#6b4c38;font-size:15px;">
        Hola <strong>${nombreCliente}</strong>, recibimos tu pedido correctamente.
      </p>
    </div>

    <!-- Número de pedido -->
    <div style="padding:20px 32px 0;">
      <div style="background:#faf6ef;border-radius:10px;padding:16px;text-align:center;">
        <p style="margin:0 0 4px;color:#6b4c38;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
          Número de pedido
        </p>
        <p style="margin:0;color:#6c2917;font-size:22px;font-weight:700;font-family:monospace;letter-spacing:2px;">
          #${numeroCorto}
        </p>
      </div>
    </div>

    <!-- Detalle de productos -->
    <div style="padding:24px 32px 0;">
      <h3 style="margin:0 0 12px;color:#6c2917;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
        Detalle de tu pedido
      </h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#faf6ef;">
            <th style="padding:10px 12px;text-align:left;color:#6b4c38;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Producto</th>
            <th style="padding:10px 12px;text-align:center;color:#6b4c38;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Cant.</th>
            <th style="padding:10px 12px;text-align:right;color:#6b4c38;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Precio</th>
            <th style="padding:10px 12px;text-align:right;color:#6b4c38;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${filasProductos}
        </tbody>
      </table>

      <!-- Totales -->
      <div style="border-top:2px solid #f0e8dc;margin-top:4px;padding-top:12px;">
        <div style="display:flex;justify-content:space-between;padding:4px 12px;color:#6b4c38;font-size:14px;">
          <span>Subtotal</span><span>S/ ${subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:4px 12px;color:#6b4c38;font-size:14px;">
          <span>Envío</span>
          <span>${envio === 0 ? '🎉 Gratis' : `S/ ${Number(envio).toFixed(2)}`}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px 12px;background:#faf6ef;border-radius:8px;margin-top:8px;">
          <span style="font-weight:700;color:#6c2917;font-size:16px;">Total pagado</span>
          <span style="font-weight:700;color:#6c2917;font-size:16px;">S/ ${total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Dirección de envío -->
    <div style="padding:24px 32px 0;">
      <h3 style="margin:0 0 10px;color:#6c2917;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
        Dirección de envío
      </h3>
      <div style="background:#faf6ef;border-radius:10px;padding:14px 16px;color:#1a0f0a;font-size:14px;line-height:1.8;">
        <strong>${nombreCliente}</strong><br/>
        ${direccionLineas}
        ${pedido.envio_telefono ? `<br/>📞 ${pedido.envio_telefono}` : ''}
      </div>
    </div>

    <!-- Mensaje de cierre -->
    <div style="padding:28px 32px;text-align:center;color:#6b4c38;font-size:14px;line-height:1.7;">
      <p style="margin:0 0 8px;">
        Nos pondremos en contacto contigo pronto para coordinar la entrega. 🚀
      </p>
      <p style="margin:0;">
        ¿Dudas? Escríbenos a
        <a href="mailto:lilyscaffe26@gmail.com" style="color:#6c2917;font-weight:600;">lilyscaffe26@gmail.com</a>
        o llámanos al <strong>+51 924 029 050</strong>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#6c2917;padding:20px 32px;text-align:center;">
      <p style="margin:0;color:rgba(250,246,239,0.7);font-size:12px;">
        © ${new Date().getFullYear()} Lily's Caffe — Hecho con mucho café y amor en Perú ❤️
      </p>
    </div>

  </div>
</body>
</html>`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    "Lily's Caffe <onboarding@resend.dev>",
        to:      [emailCliente],
        subject: `✅ Pedido #${numeroCorto} confirmado — Lily's Caffe`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', err);
    } else {
      console.log('Email enviado a:', emailCliente);
    }

  } catch (err) {
    console.error('Error enviando email:', err);
  }
}

// ── Handler principal
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status:  405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        email:         pedido.email_invitado || 'cliente@lilyscaffe.pe',
        source_id:     culqi_token,
        description:   `Pedido #${pedido_id.slice(0, 8).toUpperCase()}`,
        capture:       true,
        metadata:      { pedido_id },
      }),
    });

    const culqiData = await culqiResponse.json();

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

    // Obtener items del pedido para el email
    const { data: items } = await supabase
      .from('pedido_items')
      .select('*')
      .eq('pedido_id', pedido_id);

    // Enviar email de confirmación
    await enviarEmailConfirmacion(pedido, items ?? []);

    return new Response(JSON.stringify({
      success:   true,
      pedido_id,
      charge_id: culqiData.id,
      estado:    'pagado',
    }), {
      status:  200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Error en procesar-pago:', err);
    return errorResponse('Error interno del servidor', 500);
  }
});

function errorResponse(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}