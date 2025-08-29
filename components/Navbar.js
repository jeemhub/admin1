import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav style={navbarStyle}>
      <div style={navbarContentStyle}>
        <Link href="/" style={logoStyle}>
          لوحة التحكم
        </Link>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMobileMenu}
          style={mobileMenuButtonStyle}
          aria-label="Toggle mobile menu"
        >
          <span style={hamburgerLineStyle}></span>
          <span style={hamburgerLineStyle}></span>
          <span style={hamburgerLineStyle}></span>
        </button>

        {/* Desktop Navigation */}
        <div style={desktopNavStyle}>
          <Link href="/products" style={navLinkStyle}>المنتجات</Link>
          <Link href="/categories" style={navLinkStyle}>التصنيفات</Link>
  
          {user && (
            <button onClick={handleLogout} style={logoutButtonStyle}>
              تسجيل الخروج
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div style={mobileNavStyle}>
          <Link href="/products" style={mobileNavLinkStyle} onClick={closeMobileMenu}>
            المنتجات
          </Link>
          <Link href="/categories" style={mobileNavLinkStyle} onClick={closeMobileMenu}>
            التصنيفات
          </Link>

          {user && (
            <button onClick={handleLogout} style={mobileLogoutButtonStyle}>
              تسجيل الخروج
            </button>
          )}
        </div>
      )}
    </nav>
  )
}

// Styles
const navbarStyle = {
  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
  padding: '1rem 0',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0 2px 20px rgba(0,0,0,0.1)'
}

const navbarContentStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 2rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative'
}

const logoStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
}

const desktopNavStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '2rem'
}

const navLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: '500',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  border: '1px solid transparent'
}

const logoutButtonStyle = {
  background: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '0.75rem 1.5rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
}

const mobileMenuButtonStyle = {
  display: 'none',
  flexDirection: 'column',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: '4px',
  transition: 'background-color 0.3s ease'
}

const hamburgerLineStyle = {
  width: '25px',
  height: '3px',
  background: 'white',
  margin: '3px 0',
  borderRadius: '2px',
  transition: 'all 0.3s ease'
}

const mobileNavStyle = {
  display: 'none',
  flexDirection: 'column',
  background: 'rgba(30, 60, 114, 0.95)',
  backdropFilter: 'blur(10px)',
  padding: '1rem',
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  borderTop: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
}

const mobileNavLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '1.1rem',
  fontWeight: '500',
  padding: '1rem',
  borderRadius: '8px',
  transition: 'background-color 0.3s ease',
  borderBottom: '1px solid rgba(255,255,255,0.1)'
}

const mobileLogoutButtonStyle = {
  background: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: '1rem',
  transition: 'all 0.3s ease'
}

// Media Queries
const mediaQueries = `
  @media (max-width: 768px) {
    .desktop-nav {
      display: none !important;
    }
    
    .mobile-menu-button {
      display: flex !important;
    }
    
    .mobile-nav {
      display: flex !important;
    }
    
    .navbar-content {
      padding: 0 1rem;
    }
    
    .logo {
      font-size: 1.3rem;
    }
  }
  
  @media (min-width: 769px) {
    .mobile-menu-button {
      display: none !important;
    }
    
    .mobile-nav {
      display: none !important;
    }
  }
`

// Add CSS to document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = mediaQueries
  document.head.appendChild(style)
} 