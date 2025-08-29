import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'
import { uploadToPhotoBucket } from '../../lib/storage'
import Link from 'next/link'
import ImageSlider from '../../components/ImageSlider'

export default function AddProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({ 
    name: '', 
    name_ar: '', 
    description: '', 
    description_ar: '', 
    price: '', 
    category_id: '', 
    in_stock: true, 
    featured: false
  })
  const [categories, setCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mainImage, setMainImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  
  const mainImageRef = useRef(null)
  const additionalImagesRef = useRef(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, name_ar')
      .order('name')
    
    if (!error) setCategories(data)
  }

  const handleMainImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMainImage(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setForm(prev => ({ ...prev, image_url: previewUrl }))
    }
  }

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files)
    
    // Check if adding these files would exceed the limit
    const currentCount = additionalImages.length
    const newCount = currentCount + files.length
    
    if (newCount > 5) {
      alert(`لا يمكن إضافة أكثر من 5 صور ثانوية. لديك حالياً ${currentCount} صورة، ويمكنك إضافة ${5 - currentCount} صورة فقط.`)
      e.target.value = '' // Reset file input
      return
    }
    
    setAdditionalImages(prev => [...prev, ...files])
    
    // Create preview URLs for new files
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setUploadedImages(prev => [...prev, ...newPreviewUrls])
  }

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.category_id) {
      alert('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    // Check additional images limit
    if (additionalImages.length > 5) {
      alert('لا يمكن إضافة أكثر من 5 صور ثانوية. يرجى إزالة بعض الصور.')
      return
    }

    setIsSubmitting(true)
    try {
      let mainImageUrl = null
      let additionalImagesUrls = []

      // Upload main image
      if (mainImage) {
        mainImageUrl = await uploadToPhotoBucket(mainImage)
      }

      // Upload additional images
      if (additionalImages.length > 0) {
        for (const image of additionalImages) {
          const url = await uploadToPhotoBucket(image)
          additionalImagesUrls.push(url)
        }
      }

      const { error } = await supabase.from('products').insert([{
        name: form.name,
        name_ar: form.name_ar,
        description: form.description,
        description_ar: form.description_ar,
        price: Number(form.price),
        category_id: form.category_id,
        image_url: mainImageUrl,
        additional_images: additionalImagesUrls.join(','),
        in_stock: form.in_stock,
        featured: form.featured
      }])

      if (error) {
        if (error.message && error.message.includes('duplicate key value')) {
          alert('اسم المنتج مستخدم بالفعل. الرجاء اختيار اسم آخر.')
        } else {
          alert('حدث خطأ أثناء إضافة المنتج: ' + (error.message || JSON.stringify(error)))
        }
        return
      }

      alert('تم إضافة المنتج بنجاح!')
      router.push('/products')
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('حدث خطأ غير متوقع: ' + (err.message || JSON.stringify(err)))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <Link href="/products" style={backButtonStyle}>
          ← العودة للمنتجات
        </Link>
        <h1 style={titleStyle}>إضافة منتج جديد</h1>
      </div>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={formGridStyle}>
          {/* Basic Information */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>المعلومات الأساسية</h3>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>الاسم (إنجليزي) *</label>
              <input 
                type="text"
                required
                placeholder="Product Name" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>الاسم (عربي)</label>
              <input 
                type="text"
                placeholder="اسم المنتج" 
                value={form.name_ar} 
                onChange={e => setForm({ ...form, name_ar: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>الوصف (إنجليزي)</label>
              <textarea 
                placeholder="Product description" 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>الوصف (عربي)</label>
              <textarea 
                placeholder="وصف المنتج" 
                value={form.description_ar} 
                onChange={e => setForm({ ...form, description_ar: e.target.value })}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Pricing & Category */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>السعر والفئة</h3>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>السعر *</label>
              <div style={priceInputStyle}>
                <input 
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00" 
                  value={form.price} 
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  style={inputStyle}
                />
                <span style={currencyStyle}>د.ع</span>
              </div>
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>الفئة *</label>
              <select
                required
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
                style={selectStyle}
              >
                <option value="">اختر الفئة</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ar || cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={form.in_stock} 
                  onChange={e => setForm({ ...form, in_stock: e.target.checked })}
                  style={checkboxStyle}
                />
                متوفر في المخزون
              </label>
            </div>

            <div style={checkboxGroupStyle}>
              <label style={checkboxLabelStyle}>
                <input 
                  type="checkbox" 
                  checked={form.featured} 
                  onChange={e => setForm({ ...form, featured: e.target.checked })}
                  style={checkboxStyle}
                />
                منتج مميز
              </label>
            </div>
          </div>

          {/* Images */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>الصور</h3>
            
            <div style={inputGroupStyle}>
              <label style={labelStyle}>الصورة الرئيسية</label>
              <input 
                type="file" 
                accept="image/*"
                ref={mainImageRef}
                onChange={handleMainImageChange}
                style={fileInputStyle}
              />
              {form.image_url && (
                <div style={imagePreviewStyle}>
                  <ImageSlider 
                    images={[form.image_url]}
                    type="product"
                  />
                </div>
              )}
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>
                صور إضافية 
                <span style={imageCountStyle}>
                  ({additionalImages.length}/5)
                </span>
              </label>
              <input 
                type="file" 
                accept="image/*"
                multiple
                ref={additionalImagesRef}
                onChange={handleAdditionalImagesChange}
                style={fileInputStyle}
                disabled={additionalImages.length >= 5}
              />
              {additionalImages.length >= 5 && (
                <div style={warningStyle}>
                  ⚠️ تم الوصول للحد الأقصى (5 صور ثانوية)
                </div>
              )}
              {uploadedImages.length > 0 && (
                <div style={additionalImagesPreviewStyle}>
                  <ImageSlider 
                    images={uploadedImages}
                    type="additional"
                  />
                  <div style={removeButtonsContainerStyle}>
                    {uploadedImages.map((url, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        style={removeImageButtonStyle}
                      >
                        حذف الصورة {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={submitSectionStyle}>
          <button 
            type="submit"
            disabled={isSubmitting}
            style={submitButtonStyle}
          >
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة المنتج'}
          </button>
          
          <Link href="/products" style={cancelButtonStyle}>
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}

// Styles
const containerStyle = {
  minHeight: '100vh',
  background: '#f8f9fa',
  padding: '2rem',
  fontFamily: 'system-ui, -apple-system, sans-serif'
}

const headerStyle = {
  maxWidth: '1200px',
  margin: '0 auto 2rem',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
}

const backButtonStyle = {
  color: '#667eea',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '1rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  transition: 'background-color 0.2s'
}

const titleStyle = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#333',
  margin: 0
}

const formStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  background: 'white',
  borderRadius: '16px',
  padding: '2rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
}

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '2rem',
  marginBottom: '2rem'
}

const sectionStyle = {
  background: '#f8f9fa',
  padding: '1.5rem',
  borderRadius: '12px',
  border: '1px solid #e9ecef'
}

const sectionTitleStyle = {
  fontSize: '1.3rem',
  fontWeight: 'bold',
  color: '#495057',
  marginBottom: '1.5rem',
  paddingBottom: '0.5rem',
  borderBottom: '2px solid #667eea'
}

const inputGroupStyle = {
  marginBottom: '1.5rem'
}

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#495057',
  fontSize: '0.95rem'
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: '2px solid #e9ecef',
  borderRadius: '8px',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  boxSizing: 'border-box'
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  backgroundColor: 'white'
}

const priceInputStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
}

const currencyStyle = {
  position: 'absolute',
  right: '16px',
  color: '#6c757d',
  fontWeight: 'bold',
  pointerEvents: 'none'
}

const checkboxGroupStyle = {
  marginBottom: '1rem'
}

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: '1rem',
  color: '#495057'
}

const checkboxStyle = {
  width: '18px',
  height: '18px',
  accentColor: '#667eea'
}

const fileInputStyle = {
  ...inputStyle,
  padding: '8px 12px',
  cursor: 'pointer'
}

const imagePreviewStyle = {
  marginTop: '1rem',
  textAlign: 'center'
}

const previewImageStyle = {
  maxWidth: '200px',
  maxHeight: '200px',
  borderRadius: '8px',
  border: '2px solid #e9ecef'
}

const additionalImagesPreviewStyle = {
  marginTop: '1rem',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
  gap: '1rem'
}

const additionalImagePreviewStyle = {
  position: 'relative',
  textAlign: 'center'
}

const removeImageButtonStyle = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  background: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const imageCountStyle = {
  fontSize: '0.85rem',
  color: '#6c757d',
  fontWeight: 'normal',
  marginLeft: '0.5rem'
}

const warningStyle = {
  marginTop: '0.5rem',
  padding: '0.5rem',
  background: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  color: '#856404',
  fontSize: '0.85rem',
  textAlign: 'center'
}

const removeButtonsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '1rem',
  justifyContent: 'center'
}

const submitSectionStyle = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
  paddingTop: '2rem',
  borderTop: '2px solid #e9ecef'
}

const submitButtonStyle = {
  background: '#667eea',
  color: 'white',
  border: 'none',
  padding: '1rem 2rem',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  minWidth: '200px'
}

const cancelButtonStyle = {
  background: '#6c757d',
  color: 'white',
  textDecoration: 'none',
  padding: '1rem 2rem',
  borderRadius: '8px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  minWidth: '200px',
  textAlign: 'center',
  display: 'inline-block'
}
