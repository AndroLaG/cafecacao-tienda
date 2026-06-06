import { createContext, useContext, useReducer, useEffect } from 'react';

// ── Paleta de colores de marca (importar desde aquí en toda la app)
export const BRAND = {
  marron:       '#83401d',
  marronClaro:  '#97522d',
  oliva:        '#83741b',
  olivaClaro:   '#97862e',
  granate:      '#8d2535',
  // Derivados de apoyo
  crema:        '#faf6ef',
  texto:        '#1a0f0a',
  textoMuted:   '#6b4c38',
};

// ── Tipos de acción del reducer
const CART_ACTIONS = {
  ADD_ITEM:     'ADD_ITEM',
  REMOVE_ITEM:  'REMOVE_ITEM',
  UPDATE_QTY:   'UPDATE_QTY',
  CLEAR_CART:   'CLEAR_CART',
};

const STORAGE_KEY = 'cafecacao_cart';

// ── Estado inicial: intenta recuperar del localStorage
function getInitialState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { items: [] };
  } catch {
    return { items: [] };
  }
}

// ── Reducer puro — sin efectos secundarios
function cartReducer(state, action) {
  switch (action.type) {

    case CART_ACTIONS.ADD_ITEM: {
      const { producto } = action.payload;
      const existing = state.items.find(i => i.id === producto.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === producto.id
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...producto, cantidad: 1 }],
      };
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload.id),
      };

    case CART_ACTIONS.UPDATE_QTY: {
      const { id, cantidad } = action.payload;
      if (cantidad <= 0) {
        return { ...state, items: state.items.filter(i => i.id !== id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.id === id ? { ...i, cantidad } : i
        ),
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return { items: [] };

    default:
      return state;
  }
}

// ── Contexto y Provider
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialState);

  // Persistir en localStorage cada vez que cambie el estado
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // ── Acciones expuestas
  const addItem     = (producto) => dispatch({ type: CART_ACTIONS.ADD_ITEM,    payload: { producto } });
  const removeItem  = (id)       => dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { id } });
  const updateQty   = (id, cantidad) => dispatch({ type: CART_ACTIONS.UPDATE_QTY, payload: { id, cantidad } });
  const clearCart   = ()         => dispatch({ type: CART_ACTIONS.CLEAR_CART });

  // ── Selectores derivados
  const totalItems    = state.items.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal      = state.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const costoEnvio    = subtotal >= 150 ? 0 : 15; // Envío gratis desde S/150
  const total         = subtotal + costoEnvio;

  const value = {
    items: state.items,
    totalItems,
    subtotal,
    costoEnvio,
    total,
    addItem,
    removeItem,
    updateQty,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook de acceso — lanza error si se usa fuera del Provider
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}