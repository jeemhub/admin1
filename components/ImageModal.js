import React from 'react'

const ImageModal = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div 
      className="image-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: window.innerWidth <= 768 ? '1rem' : '2rem',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="image-modal-content" style={{ 
        position: 'relative', 
        maxWidth: window.innerWidth <= 768 ? '95vw' : '90vw', 
        maxHeight: window.innerWidth <= 768 ? '95vh' : '90vh' 
      }}>
        <img
          src={imageUrl}
          alt="صورة مكبرة"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
            userSelect: 'none',
            touchAction: 'pan-y pinch-zoom',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          draggable={false}
        />
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: window.innerWidth <= 768 ? '-50px' : '-40px',
            right: '0',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: window.innerWidth <= 768 ? '40px' : '35px',
            height: window.innerWidth <= 768 ? '40px' : '35px',
            fontSize: window.innerWidth <= 768 ? '20px' : '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation'
          }}
        >
          ×
        </button>
        
        <div style={{
          position: 'absolute',
          bottom: window.innerWidth <= 768 ? '-50px' : '-40px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: window.innerWidth <= 768 ? '12px' : '14px',
          textAlign: 'center',
          maxWidth: '90%'
        }}>
          {window.innerWidth <= 768 ? 'اسحب للإغلاق' : 'انقر خارج الصورة للإغلاق'}
        </div>
      </div>
    </div>
  )
}

export default ImageModal
