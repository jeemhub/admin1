import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => listener?.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link href="/">لوحة التحكم</Link>
        <div className="navbar-links">
          <Link href="/products">المنتجات</Link>
          <Link href="/categories">التصنيفات</Link>
          <Link href="/ads">الإعلانات</Link>
          {user && (
            <button onClick={handleLogout} style={{ marginRight: 16, background: '#dc3545', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer' }}>تسجيل الخروج</button>
          )}
        </div>
      </div>
    </nav>
  )
} 