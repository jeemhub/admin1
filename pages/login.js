import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (e) => {
    e.preventDefault()
    // بيانات الدخول الثابتة (يمكنك تعديلها)
    if (username === 'admin' && password === '123456') {
      document.cookie = 'auth=true; path=/'
      router.push('/')
    } else {
      alert('اسم المستخدم أو كلمة المرور غير صحيحة')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: '#fff',
          padding: 40,
          borderRadius: 16,
          boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)',
          minWidth: 340,
          maxWidth: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo or Avatar */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 40%, #60a5fa 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <span style={{ color: '#fff', fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace' }}>🔒</span>
        </div>
        <h2 style={{ marginBottom: 24, textAlign: 'center', color: '#374151', fontWeight: 700, fontSize: 26 }}>تسجيل الدخول</h2>
        <label style={{ alignSelf: 'flex-end', marginBottom: 6, color: '#374151', fontWeight: 500 }}>اسم المستخدم</label>
        <input
          placeholder="اسم المستخدم"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{
            display: 'block',
            marginBottom: 18,
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1.5px solid #c7d2fe',
            fontSize: 16,
            outline: 'none',
            transition: 'border-color 0.2s',
            background: '#f1f5f9',
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#c7d2fe'}
        />
        <label style={{ alignSelf: 'flex-end', marginBottom: 6, color: '#374151', fontWeight: 500 }}>كلمة المرور</label>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            display: 'block',
            marginBottom: 24,
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1.5px solid #c7d2fe',
            fontSize: 16,
            outline: 'none',
            transition: 'border-color 0.2s',
            background: '#f1f5f9',
          }}
          onFocus={e => e.target.style.borderColor = '#6366f1'}
          onBlur={e => e.target.style.borderColor = '#c7d2fe'}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: 14,
            background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 18,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #6366f122',
            transition: 'background 0.2s',
            marginTop: 8,
            letterSpacing: 1,
          }}
          onMouseOver={e => e.target.style.background = 'linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)'}
          onMouseOut={e => e.target.style.background = 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)'}
        >
          دخول
        </button>
      </form>
    </div>
  )
}
