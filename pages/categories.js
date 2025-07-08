import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { uploadToPhotoBucket } from '../lib/storage'

export default function CategoriesPage() {
  const [cats, setCats] = useState([])
  const [form, setForm] = useState({ 
    name: '', 
    nameAr: '', 
    description: '', 
    descriptionAr: '', 
    file: null 
  })
  const fileInputRef = useRef(null)

  const fetchCats = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
    if (!error) setCats(data)
  }

  useEffect(() => { fetchCats() }, [])

  const handleAdd = async () => {
    let image_url = null
    try {
      if (form.file) image_url = await uploadToPhotoBucket(form.file)
      const { error } = await supabase.from('categories').insert([{
        name: form.name,
        nameAr: form.nameAr,
        description: form.description,
        descriptionAr: form.descriptionAr,
        image_url: image_url
      }])
      if (error) {
        if (error.message && error.message.includes('duplicate key value')) {
          alert('اسم التصنيف مستخدم بالفعل. الرجاء اختيار اسم آخر.')
        } else {
          alert('حدث خطأ أثناء إضافة التصنيف: ' + (error.message || JSON.stringify(error)))
        }
        return
      }
      setForm({ name: '', nameAr: '', description: '', descriptionAr: '', file: null })
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchCats()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('حدث خطأ غير متوقع: ' + (err.message || JSON.stringify(err)))
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('categories').delete().eq('id', id)
    fetchCats()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>إدارة التصنيفات</h2>
      {/* Add Category Form */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '2rem', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#495057' }}>إضافة تصنيف جديد</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>الاسم (إنجليزي)</label>
            <input 
              placeholder="Category Name" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>الاسم (عربي)</label>
            <input 
              placeholder="اسم التصنيف" 
              value={form.nameAr} 
              onChange={e => setForm({ ...form, nameAr: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>الوصف (إنجليزي)</label>
            <textarea 
              placeholder="Category description" 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={labelStyle}>الوصف (عربي)</label>
            <textarea 
              placeholder="وصف التصنيف" 
              value={form.descriptionAr} 
              onChange={e => setForm({ ...form, descriptionAr: e.target.value })}
              style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={labelStyle}>رفع صورة (مطلوب)</label>
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={e => setForm({ ...form, file: e.target.files[0] })}
              style={{ ...inputStyle, padding: '0.5rem' }}
            />
            <small style={{ color: '#6c757d', fontSize: '12px' }}>سيتم رفع الصورة إلى قاعدة البيانات</small>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          style={buttonStyle}
          onMouseOver={e => e.target.style.background = '#0056b3'}
          onMouseOut={e => e.target.style.background = '#007bff'}
        >
          إضافة تصنيف
        </button>
      </div>
      {/* Categories List */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#495057' }}>التصنيفات الحالية</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {cats.map(c => (
            <div key={c.id} style={{ 
              border: '1px solid #dee2e6', 
              borderRadius: '8px', 
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: '#f8f9fa'
            }}>
              {c.image_url && (
                <img 
                  src={c.image_url} 
                  alt={c.name || c.nameAr} 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'cover',
                    borderRadius: '6px'
                  }} 
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#495057' }}>{c.name}</strong>
                  <span style={{ color: '#6c757d', fontSize: '14px' }}>{c.nameAr}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '0.5rem' }}>
                  {c.description}
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                  {c.descriptionAr}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(c.id)}
                style={deleteButtonStyle}
                onMouseOver={e => e.target.style.background = '#c82333'}
                onMouseOut={e => e.target.style.background = '#dc3545'}
              >
                حذف
              </button>
            </div>
          ))}
        </div>
        {cats.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '2rem' }}>
            لا توجد تصنيفات حالياً
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
const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: 'bold',
  color: '#495057'
}
const buttonStyle = {
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
}
const deleteButtonStyle = {
  background: '#dc3545',
  color: 'white',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
}