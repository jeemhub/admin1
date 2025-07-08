import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { uploadToPhotoBucket } from '../lib/storage'

export default function AdsPage() {
  const [ads, setAds] = useState([])
  const [form, setForm] = useState({ title: '', description: '', link: '', start_date: '', end_date: '', file: null })

  const fetchAds = async () => {
    const { data, error } = await supabase.from('ads').select('*').order('created_at', { ascending: false })
    if (!error) setAds(data)
  }

  useEffect(() => { fetchAds() }, [])

  const handleAdd = async () => {
    let image_url = null
    try {
      if (form.file) image_url = await uploadToPhotoBucket(form.file)
      const { error } = await supabase.from('ads').insert([{
        title: form.title,
        description: form.description,
        link: form.link,
        start_date: form.start_date,
        end_date: form.end_date,
        image_url
      }])
      if (error) {
        console.error('Error adding ad:', error)
        alert('حدث خطأ أثناء إضافة الإعلان: ' + (error.message || JSON.stringify(error)))
        return
      }
      setForm({ title: '', description: '', link: '', start_date: '', end_date: '', file: null })
      fetchAds()
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('حدث خطأ غير متوقع: ' + (err.message || JSON.stringify(err)))
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('ads').delete().eq('id', id)
    fetchAds()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>الإعلانات</h2>
      <div>
        <input placeholder="العنوان" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input placeholder="الرابط" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} />
        <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
        <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
        <input type="file" onChange={e => setForm({ ...form, file: e.target.files[0] })} />
        <button onClick={handleAdd}>أضف إعلان</button>
      </div>
      <ul>
        {ads.map(a => (
          <li key={a.id} style={{ margin: '1rem 0' }}>
            <strong>{a.title}</strong> - {a.link}
            {a.image_url && <img src={a.image_url} alt={a.title} width="100" />}
            <button onClick={() => handleDelete(a.id)}>حذف</button>
          </li>
        ))}
      </ul>
    </div>
  )
}