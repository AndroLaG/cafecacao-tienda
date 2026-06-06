const CULQI_PUBLIC_KEY = import.meta.env.VITE_CULQI_PUBLIC_KEY;

export function cargarSDKCulqi() {
  return new Promise((resolve) => {
    if (window.Culqi) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src   = 'https://checkout.culqi.com/js/v4';
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function abrirModalCulqi({ total, email, onToken, onError }) {
  window.culqi = () => {
    if (window.Culqi.token) {
      onToken(window.Culqi.token.id);
      window.Culqi.close();
    } else {
      onError(window.Culqi.error?.user_message ?? 'Error en el pago');
      window.Culqi.close();
    }
  };

  window.Culqi.publicKey = CULQI_PUBLIC_KEY;
  window.Culqi.settings({
    title:       "Lily's Caffe",
    currency:    'PEN',
    description: 'Pedido en tienda',
    amount:      Math.round(total * 100),
  });
  window.Culqi.options({
    lang:  'es',
    modal: true,
  });

  window.Culqi.open();
}