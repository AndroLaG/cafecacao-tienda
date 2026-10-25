import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function useProducts(categoria = null) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchProductos = useCallback(async function(intento) {
    setLoading(true);
    setError(null);

    var query = supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('created_at', { ascending: false });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    var result = await query;

    if (result.error) {
      // Reintentar hasta 3 veces con delay creciente
      if (intento < 3) {
        setTimeout(function() {
          fetchProductos(intento + 1);
        }, intento * 1000); // 1s, 2s, 3s
      } else {
        setError(result.error.message);
        setLoading(false);
      }
    } else {
      setProductos(result.data);
      setLoading(false);
    }
  }, [categoria]);

  useEffect(function() {
    fetchProductos(1);
  }, [fetchProductos]);

  return { productos, loading, error };
}