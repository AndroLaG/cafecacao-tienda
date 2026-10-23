import { useEffect } from 'react';

function Lightbox({ src, alt, onClose }) {
  // Cerrar con Escape
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

  return (
    <div
      onClick={onClose}
      style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: 'rgba(0,0,0,0.92)',
        zIndex:          9999,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '1rem',
        cursor:          'zoom-out',
        animation:       'fadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Botón cerrar */}
      <button
        onClick={onClose}
        style={{
          position:        'absolute',
          top:             '1rem',
          right:           '1rem',
          backgroundColor: 'rgba(255,255,255,0.15)',
          color:           '#fff',
          border:          'none',
          borderRadius:    '50%',
          width:           '44px',
          height:          '44px',
          fontSize:        '1.4rem',
          lineHeight:      1,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          cursor:          'pointer',
          zIndex:          10000,
          transition:      'background-color 0.2s',
        }}
        onMouseEnter={function(e) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'; }}
        onMouseLeave={function(e) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; }}
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
          animation:    'scaleIn 0.25s ease',
        }}
      />

      {/* Alt como caption */}
      {alt && (
        <div style={{
          position:   'absolute',
          bottom:     '1.25rem',
          left:       '50%',
          transform:  'translateX(-50%)',
          color:      'rgba(255,255,255,0.7)',
          fontSize:   '0.82rem',
          fontFamily: 'var(--font-body)',
          whiteSpace: 'nowrap',
        }}>
          {alt}
        </div>
      )}
    </div>
  );
}

export default Lightbox;