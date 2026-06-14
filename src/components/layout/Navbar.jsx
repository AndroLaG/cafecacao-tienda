import { useState, useRef, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import CartDrawer from "../cart/CartDrawer";

const ADMIN_EMAIL = "lilyscaffe26@gmail.com";

const ENLACES = [
  { label: "Inicio",    href: "/"          },
  { label: "Productos", href: "/#productos" },
  { label: "Nosotros",  href: "/#nosotros"  },
  { label: "Contacto",  href: "/#contacto"  },
];

function Navbar() {
  const { totalItems } = useCart();
  const { user, primerNombre, cerrarSesion } = useAuth();
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const submenuRef = useRef(null);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const displayName = primerNombre ?? (user ? user.email.split("@")[0] : "");

  useEffect(() => {
    function handleClickOutside(e) {
      if (submenuRef.current && !submenuRef.current.contains(e.target)) {
        setSubmenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleNavClick(e, href) {
    e.preventDefault();
    setMenuOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      const el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); }
      else { window.location.href = href; }
    } else {
      window.location.href = href;
    }
  }

  return (
    React.createElement(React.Fragment, null,
      React.createElement("nav", {
        style: {
          backgroundColor: "var(--color-marron)",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }
      },
        React.createElement("a", {
          href: "/",
          style: {
            fontFamily: "var(--font-heading)",
            color: "var(--color-crema)",
            fontSize: "1.4rem",
            fontWeight: "700",
            textDecoration: "none",
            flexShrink: 0,
          }
        }, "Lily\'s Caffe"),

        React.createElement("div", {
          className: "desktop-menu",
          style: { display: "flex", gap: "1.5rem", alignItems: "center" }
        },
          ENLACES.map(function(item) {
            return React.createElement("a", {
              key: item.label,
              href: item.href,
              onClick: function(e) { handleNavClick(e, item.href); },
              style: { color: "var(--color-crema)", fontSize: "0.95rem", textDecoration: "none", opacity: 0.9 }
            }, item.label);
          }),

          user ? React.createElement("div", { ref: submenuRef, style: { position: "relative" } },
            React.createElement("button", {
              onClick: function() { setSubmenuOpen(!submenuOpen); },
              style: {
                backgroundColor: "transparent",
                color: "var(--color-crema)",
                border: "1px solid rgba(250,246,239,0.4)",
                borderRadius: "999px",
                padding: "0.4rem 1rem",
                fontSize: "0.875rem",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "pointer",
              }
            }, "Hola, " + displayName + " \uD83D\uDC4B", React.createElement("span", null, "\u25BC")),

            submenuOpen ? React.createElement("div", {
              style: {
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                backgroundColor: "#fff",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(131,64,29,0.18)",
                minWidth: "210px",
                padding: "0.5rem",
                zIndex: 200,
                border: "1px solid #f0e8de",
              }
            },
              React.createElement("div", { style: { padding: "0.5rem 1rem 0.75rem", borderBottom: "1px solid #f0e8de", marginBottom: "0.5rem" } },
                React.createElement("p", { style: { fontSize: "0.8rem", color: "var(--color-texto-muted)", margin: 0 } }, user.email),
                isAdmin ? React.createElement("span", {
                  style: { fontSize: "0.72rem", backgroundColor: "var(--color-marron)", color: "#fff", padding: "0.1rem 0.5rem", borderRadius: "999px", fontWeight: "600", marginTop: "0.25rem", display: "inline-block" }
                }, "Administrador") : null
              ),
              React.createElement("a", { href: "/perfil", onClick: function() { setSubmenuOpen(false); }, style: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", fontSize: "0.875rem", color: "var(--color-texto)", textDecoration: "none", borderRadius: "8px", cursor: "pointer" } }, "\uD83D\uDC64 Perfil"),
              React.createElement("a", { href: "/mis-pedidos", onClick: function() { setSubmenuOpen(false); }, style: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", fontSize: "0.875rem", color: "var(--color-texto)", textDecoration: "none", borderRadius: "8px", cursor: "pointer" } }, "\uD83D\uDCE6 Mis pedidos"),
              isAdmin ? React.createElement("a", { href: "/admin", onClick: function() { setSubmenuOpen(false); }, style: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", fontSize: "0.875rem", color: "var(--color-marron)", fontWeight: "600", textDecoration: "none", borderRadius: "8px", cursor: "pointer" } }, "\u2699\uFE0F Panel administrador") : null,
              React.createElement("div", { style: { borderTop: "1px solid #f0e8de", marginTop: "0.5rem", paddingTop: "0.5rem" } },
                React.createElement("button", {
                  onClick: function() { cerrarSesion(); setSubmenuOpen(false); },
                  style: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1rem", fontSize: "0.875rem", color: "var(--color-granate)", borderRadius: "8px", cursor: "pointer", width: "100%", textAlign: "left", fontFamily: "var(--font-body)", backgroundColor: "transparent", border: "none" }
                }, "\uD83D\uDEAA Salir")
              )
            ) : null
          ) : React.createElement("a", {
            href: "/auth",
            style: { color: "var(--color-crema)", fontSize: "0.95rem", textDecoration: "none", opacity: 0.9 }
          }, "Ingresar"),

          React.createElement("button", {
            onClick: function() { setDrawerOpen(true); },
            style: { backgroundColor: "var(--color-granate)", color: "var(--color-crema)", border: "none", borderRadius: "999px", padding: "0.5rem 1.2rem", fontFamily: "var(--font-body)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }
          },
            "\uD83D\uDED2",
            totalItems > 0 ? React.createElement("span", { style: { backgroundColor: "var(--color-oliva)", borderRadius: "999px", padding: "0.1rem 0.5rem", fontSize: "0.75rem", fontWeight: "600" } }, totalItems) : null,
            "Carrito"
          )
        ),

        React.createElement("div", { className: "mobile-menu", style: { display: "flex", alignItems: "center", gap: "0.75rem" } },
          React.createElement("button", {
            onClick: function() { setDrawerOpen(true); },
            style: { backgroundColor: "var(--color-granate)", color: "var(--color-crema)", border: "none", borderRadius: "999px", padding: "0.45rem 1rem", fontFamily: "var(--font-body)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }
          },
            "\uD83D\uDED2",
            totalItems > 0 ? React.createElement("span", { style: { backgroundColor: "var(--color-oliva)", borderRadius: "999px", padding: "0.1rem 0.45rem", fontSize: "0.72rem", fontWeight: "600" } }, totalItems) : null
          ),
          React.createElement("button", {
            onClick: function() { setMenuOpen(!menuOpen); },
            style: { background: "none", border: "none", color: "var(--color-crema)", fontSize: "1.5rem", lineHeight: 1, padding: "0.25rem", cursor: "pointer" }
          }, menuOpen ? "\u2715" : "\u2630")
        )
      ),

      menuOpen ? React.createElement("div", {
        style: { backgroundColor: "var(--color-marron-claro)", padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", position: "sticky", top: "60px", zIndex: 99 }
      },
        ENLACES.map(function(item) {
          return React.createElement("a", {
            key: item.label,
            href: item.href,
            onClick: function(e) { handleNavClick(e, item.href); },
            style: { color: "var(--color-crema)", fontSize: "1rem", textDecoration: "none" }
          }, item.label);
        }),
        user ? React.createElement("div", { style: { borderTop: "1px solid rgba(250,246,239,0.2)", paddingTop: "0.75rem", marginTop: "0.25rem" } },
          React.createElement("p", { style: { color: "var(--color-crema)", fontSize: "0.85rem", opacity: 0.75, marginBottom: "0.75rem" } }, "Hola, " + displayName + " \uD83D\uDC4B"),
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" } },
            React.createElement("a", { href: "/perfil", onClick: function() { setMenuOpen(false); }, style: { color: "var(--color-crema)", fontSize: "0.95rem", textDecoration: "none" } }, "\uD83D\uDC64 Perfil"),
            React.createElement("a", { href: "/mis-pedidos", onClick: function() { setMenuOpen(false); }, style: { color: "var(--color-crema)", fontSize: "0.95rem", textDecoration: "none" } }, "\uD83D\uDCE6 Mis pedidos"),
            isAdmin ? React.createElement("a", { href: "/admin", onClick: function() { setMenuOpen(false); }, style: { color: "var(--color-crema)", fontSize: "0.95rem", textDecoration: "none", fontWeight: "600" } }, "\u2699\uFE0F Panel administrador") : null,
            React.createElement("button", {
              onClick: function() { cerrarSesion(); setMenuOpen(false); },
              style: { backgroundColor: "transparent", color: "var(--color-crema)", border: "1px solid rgba(250,246,239,0.4)", borderRadius: "999px", padding: "0.5rem 1rem", fontFamily: "var(--font-body)", fontSize: "0.9rem", textAlign: "left", cursor: "pointer", marginTop: "0.25rem" }
            }, "\uD83D\uDEAA Salir")
          )
        ) : React.createElement("a", { href: "/auth", onClick: function() { setMenuOpen(false); }, style: { color: "var(--color-crema)", fontSize: "1rem", textDecoration: "none" } }, "Ingresar")
      ) : null,

      React.createElement(CartDrawer, { isOpen: drawerOpen, onClose: function() { setDrawerOpen(false); } }),

      React.createElement("style", null, `
        .desktop-menu { display: flex !important; }
        .mobile-menu  { display: none  !important; }
        @media (max-width: 640px) {
          .desktop-menu { display: none  !important; }
          .mobile-menu  { display: flex  !important; }
        }
      `)
    )
  );
}

export default Navbar;
