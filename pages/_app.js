import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const hideNavbar = router.pathname === '/login'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user && router.pathname !== '/login') {
        router.replace('/login')
      }
      setLoading(false)
    }
    checkAuth()
    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && router.pathname !== '/login') {
        router.replace('/login')
      }
      if (session && router.pathname === '/login') {
        router.replace('/')
      }
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [router])

  if (loading && router.pathname !== '/login') {
    return <div style={{textAlign:'center',marginTop:'3rem'}}>جاري التحقق من الدخول...</div>
  }

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Component {...pageProps} />
    </>
  )
}