import { useState } from 'react'
import { supabase } from '../supabase.js'
import { enablePreviewMode } from '../previewStore.js'

export default function Login({ onEnterPreview }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setErr(error.message)
  }

  const startPreview = () => {
    enablePreviewMode()
    onEnterPreview?.()
  }

  return (
    <div className="app-shell center-col">
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Welcome back 👋</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          Sign in to keep learning.
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {err && <div className="error">{err}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {import.meta.env.DEV && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '22px 0 14px',
                color: 'rgba(255,255,255,0.35)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
              <span>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={startPreview}
              style={{ width: '100%' }}
            >
              👀 Preview without account
            </button>
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: 10, textAlign: 'center' }}>
              Demo data, saved locally only.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
