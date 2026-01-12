import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email:<br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <br /><br />
        <label>Password:<br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <br /><br />
        <button type="submit">Login</button>
      </form>
      <p>New user? <a href="/register">Register here</a></p>
    </div>
  )
}

