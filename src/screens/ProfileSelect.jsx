import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { listProfiles as listPreviewProfiles } from '../previewStore.js'
import { expectedProfilesForSession, visibleProfilesForSession } from '../profiles.js'

export default function ProfileSelect() {
  const { session, setActiveProfile, logout, preview, enterTestMode, isAdmin, isKidAccount } = useAppCtx()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const email = session?.user?.email

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

      // Admins fetch every profile in the system (RLS allows it). They
      // don't own profile rows of their own and we never auto-create.
      // Non-admins fetch only their own row, auto-creating it on first login.
      const query = isAdmin
        ? supabase.from('profiles').select('*').order('name')
        : supabase
            .from('profiles')
            .select('*')
            .eq('owner_id', userId)
            .order('created_at', { ascending: true })

      const { data: existing, error } = await query

      if (error) {
        if (!cancelled) {
          setErr(error.message)
          setLoading(false)
        }
        return
      }

      let rows = existing ?? []

      if (!isAdmin && rows.length === 0) {
        const toInsert = expectedProfilesForSession(session).map((d) => ({
          owner_id: userId,
          name: d.name,
          avatar: d.avatar,
          xp: 0
        }))
        if (toInsert.length > 0) {
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
  }, [session, preview, email, isAdmin])

  // Auto-select when only one visible profile (boys skip the picker entirely)
  const visible = preview ? profiles : visibleProfilesForSession(session, profiles)
  useEffect(() => {
    if (loading) return
    if (visible.length === 1) {
      setActiveProfile(visible[0])
    }
  }, [loading, visible, setActiveProfile])

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="brand">🎓 Learn</div>
        <div className="row">
          {preview && <span className="preview-badge">Preview</span>}
          {!isKidAccount && (
            <button className="btn-ghost" onClick={enterTestMode}>
              👨 Dad
            </button>
          )}
          <button className="btn-ghost" onClick={logout}>
            {preview ? 'Exit preview' : 'Log out'}
          </button>
        </div>
      </div>
      <div className="center-col">
        <h1 style={{ fontSize: '2.4rem', textAlign: 'center' }}>Who's learning today?</h1>
        {loading && <p className="muted">Loading profiles…</p>}
        {err && <p className="error">{err}</p>}
        {!loading && !err && visible.length === 0 && (
          <p className="muted">No profile found for {email}. Tell Dad.</p>
        )}
        {!loading && !err && visible.length > 1 && (
          <div className="grid profile-grid" style={{ width: '100%' }}>
            {visible.map((p) => (
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
