import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const hideNavbar = router.pathname === '/login'
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Component {...pageProps} />
    </>
  )
}