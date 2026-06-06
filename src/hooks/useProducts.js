import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useProducts(categoria = null) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    async function fetchProductos() {
      setLoading(true);
      let query = supabase
        .from('productos')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setProductos(data);
      }
      setLoading(false);
    }

    fetchProductos();
  }, [categoria]);

  return { productos, loading, error };
}