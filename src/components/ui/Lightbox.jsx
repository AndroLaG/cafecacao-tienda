import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function Lightbox({ src, alt, onClose }) {
  useEffect(function() {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return function() {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  var contenido = (
    <div
      onClick={onClose}
      style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: 'rgba(0,0,0,0.92)',
        zIndex:          99999,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '1rem',
        cursor:          'zoom-out',
        animation:       'fadeInLightbox 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeInLightbox  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleInLightbox { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Botón cerrar — esquina superior derecha */}
      <button
        onClick={onClose}
        style={{
          position:        'fixed',
          top:             '1rem',
          right:           '1rem',
          backgroundColor: 'rgba(255,255,255,0.2)',
          color:           '#fff',
          border:          '2px solid rgba(255,255,255,0.4)',
          borderRadius:    '50%',
          width:           '48px',
          height:          '48px',
          fontSize:        '1.5rem',
          lineHeight:      1,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          cursor:          'pointer',
          zIndex:          100000,
          transition:      'background-color 0.2s, transform 0.15s',
          fontFamily:      'sans-serif',
        }}
        onMouseEnter={function(e) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.35)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={function(e) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        ✕
      </button>

      {/* Imagen */}
      <img
        src={src}
        alt={alt}
        onClick={function(e) { e.stopPropagation(); }}
        style={{
          maxWidth:     '95vw',
          maxHeight:    '92vh',
          objectFit:    'contain',
          borderRadius: '8px',
          boxShadow:    '0 24px 80px rgba(0,0,0,0.6)',
          cursor:       'default',
          animation:    'scaleInLightbox 0.25s ease',
          display:      'block',
        }}
      />

      {/* Caption */}
      {alt && (
        <div style={{
          position:        'fixed',
          bottom:          '1.25rem',
          left:            '50%',
          transform:       'translateX(-50%)',
          color:           'rgba(255,255,255,0.75)',
          fontSize:        '0.85rem',
          fontFamily:      'var(--font-body)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding:         '0.3rem 1rem',
          borderRadius:    '999px',
          whiteSpace:      'nowrap',
          maxWidth:        '90vw',
          overflow:        'hidden',
          textOverflow:    'ellipsis',
        }}>
          {alt}
        </div>
      )}
    </div>
  );

  return createPortal(contenido, document.body);
}

export default Lightbox;