// Culqi Checkout Custom (multipago) — reemplaza a Checkout v4
const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY;
const CULQI_SCRIPT_URL = 'https://js.culqi.com/checkout-js';

// Cambiar a true cuando Culqi confirme que Yape está habilitado en el comercio
const YAPE_HABILITADO = false;

var instanciaActual = null;

export function cargarSDKCulqi() {
  return new Promise(function(resolve) {
    if (window.CulqiCheckout) { resolve(true); return; }

    var existente = document.querySelector('script[src="' + CULQI_SCRIPT_URL + '"]');
    if (existente) {
      existente.addEventListener('load',  function() { resolve(true); });
      existente.addEventListener('error', function() { resolve(false); });
      return;
    }

    var script = document.createElement('script');
    script.src    = CULQI_SCRIPT_URL;
    script.async  = true;
    script.onload  = function() { resolve(true); };
    script.onerror = function() { resolve(false); };
    document.head.appendChild(script);
  });
}

export function abrirModalCulqi({ total, email, onToken, onError }) {
  if (!window.CulqiCheckout) {
    onError('No se pudo cargar el sistema de pagos. Recarga la página e inténtalo de nuevo.');
    return;
  }

  // Cerrar una instancia anterior si el cliente reintenta
  if (instanciaActual) {
    try { instanciaActual.close(); } catch (e) {}
    instanciaActual = null;
  }

  var paymentMethods = {
    tarjeta:    true,
    yape:       YAPE_HABILITADO,
    billetera:  false,
    bancaMovil: false,
    agente:     false,
    cuotealo:   false,
  };

  var config = {
    settings: {
      title:    "Lily's Caffe",
      currency: 'PEN',
      amount:   Math.round(total * 100), // en céntimos; requerido para Yape
    },
    client: {
      email: email,
    },
    options: {
      lang:               'auto',
      installments:       false,
      modal:              true,
      paymentMethods:     paymentMethods,
      paymentMethodsSort: Object.keys(paymentMethods),
    },
    appearance: {
      theme:             'default',
      hiddenCulqiLogo:   false,
      buttonCardPayText: 'Pagar S/ ' + total.toFixed(2),
      logo:              'https://ehubruirzxvaeuktlfmz.supabase.co/storage/v1/object/public/Galeria/logo-lilyscaffe-2026.png',
      defaultStyle: {
        bannerColor:      '#83401d',
        buttonBackground: '#83401d',
        menuColor:        '#faf6ef',
        linksColor:       '#97522d',
        buttonTextColor:  '#faf6ef',
        priceColor:       '#83401d',
      },
    },
  };

  var culqi = new window.CulqiCheckout(CULQI_PUBLIC_KEY, config);
  instanciaActual = culqi;

  culqi.culqi = function() {
    if (culqi.token) {
      var tokenId = culqi.token.id;
      culqi.close();
      onToken(tokenId);
    } else if (culqi.error) {
      var mensaje = culqi.error.user_message || culqi.error.merchant_message || 'Error en el pago';
      culqi.close();
      onError(mensaje);
    }
  };

  culqi.open();
}