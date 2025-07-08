import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>لوحة التحكم</h1>
      <ul>
        <li><Link href="/products">المنتجات</Link></li>
        <li><Link href="/categories">التصنيفات</Link></li>
        <li><Link href="/ads">الإعلانات</Link></li>
      </ul>
    </div>
  )
}