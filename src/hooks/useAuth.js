import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useAuth() {
  const [user,        setUser]        = useState(null);
  const [perfil,      setPerfil]      = useState(null);
  const [loading,     setLoading]     = useState(true);

  async function cargarPerfil(userId) {
    if (!userId) { setPerfil(null); return; }
    const { data } = await supabase
      .from('clientes')
      .select('nombre_completo')
      .eq('id', userId)
      .single();
    setPerfil(data ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      await cargarPerfil(u?.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        await cargarPerfil(u?.id);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  // Extrae solo el primer nombre de "Andrés Sánchez" → "Andrés"
  const primerNombre = perfil?.nombre_completo
    ? perfil.nombre_completo.trim().split(' ')[0]
    : null;

  return { user, perfil, primerNombre, loading, cerrarSesion };
}