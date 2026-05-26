import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import XPBar from '../components/XPBar.jsx'
import { listSessions as listPreviewSessions } from '../previewStore.js'

const SUBJECTS = [
  { key: 'Math', emoji: '🔢', tone: 'math' },
  { key: 'Science', emoji: '🔬', tone: 'science' },
  { key: 'Geography', emoji: '🌎', tone: 'geography' }
]

export default function Home() {
  const { activeProfile, setRoute, switchProfile, logout, preview, testMode, localOnly, isKidAccount } = useAppCtx()
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

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
          {testMode && <span className="test-badge">Test</span>}
          <div className="profile-chip">
            <span style={{ fontSize: '1.3rem' }}>{activeProfile.avatar}</span>
            <span>{activeProfile.name}</span>
          </div>
          {!isKidAccount && (
            <button className="btn-ghost" onClick={switchProfile}>Switch</button>
          )}
          <button className="btn-ghost" onClick={logout}>
            {preview ? 'Exit' : testMode ? 'Exit test' : 'Log out'}
          </button>
        </div>
      </div>

      <div className="card hero" style={{ marginBottom: 20 }}>
        <div className="spaced" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.8rem' }}>Hey {activeProfile.name}! 👋</h2>
            <p className="muted">Pick a subject and let's go.</p>
          </div>
          <XPBar xp={activeProfile.xp ?? 0} />
        </div>
      </div>

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

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
        <button onClick={() => setRoute({ name: 'progress' })}>
          📊 My Progress
        </button>
      </div>
    </div>
  )
}
