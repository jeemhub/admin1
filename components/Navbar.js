import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link href="/">لوحة التحكم</Link>
        <div className="navbar-links">
          <Link href="/products">المنتجات</Link>
          <Link href="/categories">التصنيفات</Link>
          <Link href="/ads">الإعلانات</Link>
        </div>
      </div>
    </nav>
  )
} 