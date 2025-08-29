import React, { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules'
import ImageModal from './ImageModal'

const ImageSlider = ({ images, type = 'product', onClick }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!images || images.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#6c757d',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '2px dashed #dee2e6'
      }}>
        لا توجد صور
      </div>
    )
  }

  const handleImageClick = (imageUrl) => {
    if (onClick) {
      onClick(imageUrl)
    } else {
      // فتح الصورة في Modal
      setSelectedImage(imageUrl)
      setIsModalOpen(true)
    }
  }

  // إعدادات مختلفة حسب نوع العرض
  const swiperConfig = type === 'product' ? {
    modules: [Navigation, Pagination, Scrollbar, A11y],
    spaceBetween: 0,
    slidesPerView: 1,
    navigation: !isMobile,
    pagination: { 
      clickable: true,
      dynamicBullets: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '"></span>';
      }
    },
    scrollbar: { draggable: true },
    loop: images.length > 1,
    grabCursor: true,
    effect: 'slide',
    speed: 400,
    touchRatio: 1,
    touchAngle: 45,
    resistance: true,
    resistanceRatio: 0.85,
    // Mobile touch optimizations
    allowTouchMove: true,
    touchStartPreventDefault: false,
    touchMoveStopPropagation: false,
    iOSEdgeSwipeDetection: true,
    iOSEdgeSwipeThreshold: 20
  } : {
    modules: [Navigation, Pagination, Scrollbar, A11y],
    spaceBetween: isMobile ? 8 : 10,
    slidesPerView: isMobile ? 2 : 4,
    navigation: !isMobile,
    pagination: { 
      clickable: true,
      dynamicBullets: true,
      renderBullet: function (index, className) {
        return '<span class="' + className + '"></span>';
      }
    },
    scrollbar: { draggable: true },
    loop: false,
    grabCursor: true,
    effect: 'slide',
    speed: 300,
    touchRatio: 1,
    touchAngle: 45,
    resistance: true,
    resistanceRatio: 0.85,
    // Mobile touch optimizations
    allowTouchMove: true,
    touchStartPreventDefault: false,
    touchMoveStopPropagation: false,
    iOSEdgeSwipeDetection: true,
    iOSEdgeSwipeThreshold: 20,
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 5
      },
      480: {
        slidesPerView: 2,
        spaceBetween: 8
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 12
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 15
      }
    }
  }

  return (
    <>
      <div className={type === 'product' ? 'product-image-slider' : 'additional-images-slider'}>
        <Swiper {...swiperConfig}>
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div style={{ position: 'relative' }}>
                <img
                  src={image}
                  alt={`صورة ${index + 1}`}
                  onClick={() => handleImageClick(image)}
                  style={{
                    cursor: 'pointer',
                    userSelect: 'none',
                    width: '100%',
                    height: type === 'product' ? '200px' : '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) e.target.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) e.target.style.transform = 'scale(1)'
                  }}
                />
                {type === 'product' && images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '15px',
                    fontSize: isMobile ? '11px' : '12px',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    {index + 1} / {images.length}
                  </div>
                )}
                
                {/* Mobile swipe indicator */}
                {isMobile && type === 'product' && images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    backdropFilter: 'blur(5px)'
                  }}>
                    اسحب للتنقل
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <ImageModal
        imageUrl={selectedImage}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedImage(null)
        }}
      />
    </>
  )
}

export default ImageSlider
