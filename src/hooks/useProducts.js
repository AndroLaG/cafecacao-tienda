import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function useProducts(categoria = null) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchProductos = useCallback(async function(intento) {
    setLoading(true);
    setError(null);

    var controller = new AbortController();
    var timer = setTimeout(function() { controller.abort(); }, 8000);
    var mensaje = null;
    var datos = null;

    try {
      var query = supabase
        .from('productos')
        .select('*')
        .eq('activo', true);

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      query = query
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);

      var result = await query;

      if (result.error) {
        mensaje = result.error.message || 'Error al cargar productos';
      } else {
        datos = result.data;
      }
    } catch (e) {
      mensaje = (e && e.message) ? e.message : 'Error de conexión';
    }

    clearTimeout(timer);

    if (mensaje === null) {
      setProductos(datos);
      setLoading(false);
      return;
    }

    // Reintentar hasta 3 veces con delay creciente (1s, 2s, 3s)
    if (intento < 3) {
      setTimeout(function() {
        fetchProductos(intento + 1);
      }, intento * 1000);
    } else {
      setError(mensaje);
      setLoading(false);
    }
  }, [categoria]);

  useEffect(function() {
    fetchProductos(1);
  }, [fetchProductos]);

  return { productos, loading, error };
}