import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { authFetch, useAuth } from '@/lib/auth'

interface Haiku {
  id: string
  text: string
  userId: string
  createdAt: string
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <MainContent />
    </ProtectedRoute>
  )
}

const MainContent: React.FC = () => {
  const { token } = useAuth()
  const [pair, setPair] = useState<Haiku[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [victory, setVictory] = useState<string | null>(null)
  const [points, setPoints] = useState<number | null>(null)

  useEffect(() => { loadUser(); loadPair(); }, [])

  const loadUser = async () => {
    try {
      const res = await authFetch('/api/auth/me')
      const data = await res.json()
      setPoints(data.points)
    } catch (_){}
  }

  const loadPair = async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(`/api/battle/pair?excludeUser=${token}`)
      const data: Haiku[] = await res.json()
      setPair(data)
    } catch (err: any) {
      setError(err.message ?? 'Failed to load battle')
    } finally { setLoading(false) }
  }

  const vote = async (winId: string) => {
    if (!pair) return
    setLoading(true)
    try {
      const res = await authFetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerId: winId,
          haikuIds: pair.map(h => h.id),
        }),
      })
      if (!res.ok) throw new Error('Voting failed')
      const data = await res.json()
      setVictory('Your vote was counted!')
      // refresh points
      loadUser()
    } catch (e: any) {
      setError(e.message ?? 'Voting error')
    } finally { setLoading(false) }
  }

  return (
    <div className="container">
      <h2>Haiku Battle League</h2>
      {points !== null && <p>Your Points: {points}</p>}
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {victory && <p style={{color:'green'}}>{victory}</p>}
      {pair && !victory && (
        <div className="grid grid-sm">
          {pair.map(haiku => (
            <div key={haiku.id} className="card">
              <p>{haiku.text}</p>
              <button className="btn" onClick={() => vote(haiku.id)}>
                Vote {haiku.id === pair[0].id ? 'A' : 'B'}
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '1rem' }}>
        <a href="/leaderboard" className="btn">Leaderboard</a>
        {victory && (
          <button className="btn" onClick={loadPair} style={{ marginLeft: '0.5rem' }}>
            Next Battle
          </button>
        )}
      </div>
    </div>
  )
}
