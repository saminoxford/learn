import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { listProfiles as listPreviewProfiles } from '../previewStore.js'

const DEFAULTS = [
  { name: 'Marshall', avatar: '🦅' },
  { name: 'Waylon', avatar: '🐊' }
]

export default function ProfileSelect() {
  const { session, setActiveProfile, logout, preview } = useAppCtx()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErr('')

      if (preview) {
        const rows = listPreviewProfiles()
        if (!cancelled) {
          setProfiles(rows)
          setLoading(false)
        }
        return
      }

      const userId = session?.user?.id
      if (!userId) return
      const { data: existing, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        if (!cancelled) {
          setErr(error.message)
          setLoading(false)
        }
        return
      }

      let rows = existing ?? []
      if (rows.length === 0) {
        const toInsert = DEFAULTS.map((d) => ({
          owner_id: userId,
          name: d.name,
          avatar: d.avatar,
          xp: 0
        }))
        const { data: inserted, error: insErr } = await supabase
          .from('profiles')
          .insert(toInsert)
          .select()
        if (insErr) {
          if (!cancelled) {
            setErr(insErr.message)
            setLoading(false)
          }
          return
        }
        rows = inserted ?? []
      }
      if (!cancelled) {
        setProfiles(rows)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session, preview])

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="brand">🎓 Learn</div>
        <div className="row">
          {preview && <span className="preview-badge">Preview</span>}
          <button className="btn-ghost" onClick={logout}>
            {preview ? 'Exit preview' : 'Log out'}
          </button>
        </div>
      </div>
      <div className="center-col">
        <h1 style={{ fontSize: '2.4rem', textAlign: 'center' }}>Who's learning today?</h1>
        {loading && <p className="muted">Loading profiles…</p>}
        {err && <p className="error">{err}</p>}
        {!loading && !err && (
          <div className="grid profile-grid" style={{ width: '100%' }}>
            {profiles.map((p) => (
              <button
                key={p.id}
                className="tile"
                onClick={() => setActiveProfile(p)}
              >
                <div className="emoji">{p.avatar || '🙂'}</div>
                <h2>{p.name}</h2>
                <div className="sub">{p.xp ?? 0} XP</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
