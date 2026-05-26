import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import XPBar from '../components/XPBar.jsx'
import EditProfile from '../components/EditProfile.jsx'
import { listSessions as listPreviewSessions } from '../previewStore.js'

const SUBJECTS = [
  { key: 'Math', emoji: '🔢', tone: 'math' },
  { key: 'Science', emoji: '🔬', tone: 'science' },
  { key: 'Geography', emoji: '🌎', tone: 'geography' },
  { key: 'Spelling', emoji: '🔤', tone: 'spelling' },
  { key: 'Reading', emoji: '📚', tone: 'reading' }
]

export default function Home() {
  const { activeProfile, setRoute, switchProfile, logout, preview, localOnly, isKidAccount, canWrite } = useAppCtx()
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!activeProfile) return
      setLoading(true)

      let rows = []
      if (localOnly) {
        rows = listPreviewSessions(activeProfile.id)
      } else {
        const { data, error } = await supabase
          .from('sessions')
          .select('subject')
          .eq('user_id', activeProfile.id)
        if (!error && data) rows = data
      }

      if (cancelled) return
      const c = {}
      for (const row of rows) {
        c[row.subject] = (c[row.subject] ?? 0) + 1
      }
      setCounts(c)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [activeProfile, localOnly])

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="brand">🎓 Learn</div>
        <div className="row">
          {preview && <span className="preview-badge">Preview</span>}
          {canWrite ? (
            <button
              className="profile-chip profile-chip-button"
              onClick={() => setEditOpen(true)}
              title="Edit name and avatar"
            >
              <span style={{ fontSize: '1.3rem' }}>{activeProfile.avatar}</span>
              <span>{activeProfile.name}</span>
              <span className="muted" style={{ fontSize: '0.8rem' }}>✏️</span>
            </button>
          ) : (
            <div className="profile-chip">
              <span style={{ fontSize: '1.3rem' }}>{activeProfile.avatar}</span>
              <span>{activeProfile.name}</span>
            </div>
          )}
          {!isKidAccount && (
            <button className="btn-ghost" onClick={switchProfile}>Switch</button>
          )}
          <button className="btn-ghost" onClick={logout}>
            {preview ? 'Exit' : 'Log out'}
          </button>
        </div>
      </div>

      {!canWrite && (
        <div className="card monitoring" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.2rem' }}>👀 Monitoring {activeProfile.name}</h2>
          <p className="muted" style={{ marginTop: 4 }}>
            Read-only view. Tap Switch to play on your own profile.
          </p>
        </div>
      )}

      <div className="card hero" style={{ marginBottom: 20 }}>
        <div className="spaced" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>
              {canWrite ? `Hey ${activeProfile.name}! 👋` : `${activeProfile.name}'s overview`}
            </h2>
            <p className="muted">
              {canWrite
                ? "Pick a subject and let's go."
                : `${counts.Math || 0} Math · ${counts.Science || 0} Science · ${counts.Geography || 0} Geography sessions`}
            </p>
          </div>
          <XPBar xp={activeProfile.xp ?? 0} />
        </div>
      </div>

      {canWrite && (
        <div className="grid subject-grid">
          {SUBJECTS.map((s) => (
            <button
              key={s.key}
              className={`tile ${s.tone}`}
              onClick={() => setRoute({ name: 'grade', subject: s.key })}
            >
              <div className="emoji">{s.emoji}</div>
              <h2>{s.key}</h2>
              <div className="sub">
                {loading ? '…' : `${counts[s.key] ?? 0} sessions`}
              </div>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
        <button onClick={() => setRoute({ name: 'progress' })}>
          📊 My Progress
        </button>
      </div>

      {editOpen && <EditProfile onClose={() => setEditOpen(false)} />}
    </div>
  )
}
