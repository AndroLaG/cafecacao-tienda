import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [perfil,  setPerfil]  = useState(null);
  const [loading, setLoading] = useState(true);

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
    let activo = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      cargarPerfil(u?.id).finally(() => {
        if (activo) setLoading(false);
      });
    });

    // IMPORTANTE: el callback NO debe hacer await de consultas a Supabase.
    // Se difiere con setTimeout para liberar el bloqueo interno de Auth.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        setTimeout(() => {
          cargarPerfil(u?.id);
        }, 0);
      }
    );

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
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