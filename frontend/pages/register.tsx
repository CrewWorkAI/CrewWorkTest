import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Register failed')
      const data = await res.json()
      await login(email, password) // login automatically
      router.push('/')
    } catch (err) {
      setError('Registration error')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Register</h2>
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
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <a href="/login">Login here</a></p>
    </div>
  )
}

