import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { uploadToPhotoBucket } from '../lib/storage'

export default function ProductsPage() {
  
  const [form, setForm] = useState({ 
    name: '', 
    nameAr: '', 
    description: '', 
    descriptionAr: '', 
    price: '', 
    category: '', 
    image: '', 
    inStock: true, 
    featured: false,
    file: null 
  })
  
  const [products, setProducts] = useState([])
  const fileInputRef = useRef(null)
  const [categories, setCategories] = useState([])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching products:', error)
      alert('حدث خطأ أثناء جلب المنتجات')
      return
    }
    setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
    // Fetch categories for the select menu
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name, nameAr')
      if (!error) setCategories(data)
    }
    fetchCategories()
  }, [])

  const handleAdd = async () => {
    let image_url = null
    try {
      if (form.file) {
        image_url = await uploadToPhotoBucket(form.file)
      }
      const { error } = await supabase.from('products').insert([
        {
          name: form.name,
          nameAr: form.nameAr,
          description: form.description,
          descriptionAr: form.descriptionAr,
          price: Number(form.price),
          category: form.category,
          image_url: image_url,
          inStock: form.inStock,
          featured: form.featured
        }
      ])
      if (error) {
        console.error('Error adding product:', error)
        alert('حدث خطأ أثناء إضافة المنتج: ' + (error.message || JSON.stringify(error)))
        return
      }
      setForm({ name: '', nameAr: '', description: '', descriptionAr: '', price: '', category: '', image: '', inStock: true, featured: false, file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchProducts()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('حدث خطأ غير متوقع: ' + (err.message || JSON.stringify(err)))
    }
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      console.error('Error deleting product:', error)
      alert('حدث خطأ أثناء حذف المنتج')
      return
    }
    fetchProducts()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>إدارة المنتجات</h2>
      
      {/* Add Product Form */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '2rem', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#495057' }}>إضافة منتج جديد</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>الاسم (إنجليزي)</label>
            <input 
              placeholder="Product Name" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>الاسم (عربي)</label>
            <input 
              placeholder="اسم المنتج" 
              value={form.nameAr} 
              onChange={e => setForm({ ...form, nameAr: e.target.value })}
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>الوصف (إنجليزي)</label>
            <textarea 
              placeholder="Product description" 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>الوصف (عربي)</label>
            <textarea 
              placeholder="وصف المنتج" 
              value={form.descriptionAr} 
              onChange={e => setForm({ ...form, descriptionAr: e.target.value })}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>السعر</label>
            <input 
              type="number"
              placeholder="0.00" 
              value={form.price} 
              onChange={e => setForm({ ...form, price: e.target.value })}
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>الفئة</label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundColor: '#fff',
                  paddingRight: '2.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  border: '1.5px solid #007bff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#0056b3'}
                onBlur={e => e.target.style.borderColor = '#007bff'}
              >
                <option value="" disabled>اختر الفئة</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameAr || cat.name}
                  </option>
                ))}
              </select>
              {/* Custom arrow icon */}
              <span style={{
                position: 'absolute',
                top: '50%',
                right: '1rem',
                pointerEvents: 'none',
                transform: 'translateY(-50%)',
                fontSize: '1.2rem',
                color: '#007bff',
              }}>
                ▼
              </span>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#495057' }}>رفع صورة (مفضّل)</label>
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={e => setForm({ ...form, file: e.target.files[0] })}
              style={{ ...inputStyle, padding: '0.5rem' }}
            />
            <small style={{ color: '#6c757d', fontSize: '12px' }}>سيتم رفع الصورة إلى قاعدة البيانات</small>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
              <input 
                type="checkbox" 
                checked={form.inStock} 
                onChange={e => setForm({ ...form, inStock: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              متوفر في المخزون
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#495057' }}>
              <input 
                type="checkbox" 
                checked={form.featured} 
                onChange={e => setForm({ ...form, featured: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
              منتج مميز
            </label>
          </div>
        </div>
        
        <button 
          onClick={handleAdd}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '1.5rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#0056b3'}
          onMouseOut={(e) => e.target.style.background = '#007bff'}
        >
          إضافة منتج
        </button>
      </div>

      {/* Products List */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#495057' }}>المنتجات الحالية</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          {products.map(p => (
            <div key={p.id} style={{ 
              border: '1px solid #dee2e6', 
              borderRadius: '8px', 
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: '#f8f9fa'
            }}>
              {(p.image || p.image_url) && (
                <img 
                  src={p.image || p.image_url} 
                  alt={p.name || p.nameAr} 
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover',
                    borderRadius: '6px'
                  }} 
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#495057' }}>{p.name}</strong>
                  <span style={{ color: '#6c757d', fontSize: '14px' }}>{p.nameAr}</span>
                  <span style={{ 
                    background: '#28a745', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px' 
                  }}>
                    {p.price} د.ع
                  </span>
                </div>
                
                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '0.5rem' }}>
                  {p.description}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {p.category && (
                    <span style={{ 
                      background: '#17a2b8', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      {p.category}
                    </span>
                  )}
                  {p.inStock && (
                    <span style={{ 
                      background: '#28a745', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      متوفر
                    </span>
                  )}
                  {p.featured && (
                    <span style={{ 
                      background: '#ffc107', 
                      color: '#212529', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      مميز
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(p.id)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseOver={(e) => e.target.style.background = '#c82333'}
                onMouseOut={(e) => e.target.style.background = '#dc3545'}
              >
                حذف
              </button>
            </div>
          ))}
        </div>
        
        {products.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
            لا توجد منتجات حالياً
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ced4da',
  borderRadius: '6px',
  fontSize: '14px',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
}