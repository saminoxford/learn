import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { listProfiles as listPreviewProfiles } from '../previewStore.js'
import { applyAvatarOverride, expectedProfileForSession } from '../profiles.js'

export default function ProfileSelect() {
  const { session, setActiveProfile, logout, preview, isAdmin } = useAppCtx()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const userId = session?.user?.id

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

      if (!userId) return

      // Fetch: admins see every profile in the DB (RLS allows). Everyone
      // else sees only their own row.
      const query = isAdmin
        ? supabase.from('profiles').select('*').order('name')
        : supabase
            .from('profiles')
            .select('*')
            .eq('owner_id', userId)
            .limit(1)

      const { data: existing, error } = await query
      if (error) {
        if (!cancelled) {
          setErr(error.message)
          setLoading(false)
        }
        return
      }

      let rows = existing ?? []

      // Make sure THIS user has their own profile. Auto-create if missing.
      const ownsAProfile = rows.some((r) => r.owner_id === userId)
      if (!ownsAProfile) {
        const expected = expectedProfileForSession(session)
        if (expected) {
          const { data: inserted, error: insErr } = await supabase
            .from('profiles')
            .insert({
              owner_id: userId,
              name: expected.name,
              avatar: expected.avatar,
              xp: 0,
              reading_level: expected.reading_level ?? 3,
              grade_level: expected.grade_level ?? 3
            })
            .select()
            .single()
          if (insErr) {
            if (!cancelled) {
              setErr(insErr.message)
              setLoading(false)
            }
            return
          }
          if (inserted) rows = [...rows, inserted]
        }
      }

      if (!cancelled) {
        setProfiles(rows.map(applyAvatarOverride))
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session, preview, userId, isAdmin])

  // Auto-select when there's only one profile to choose from (kid accounts).
  useEffect(() => {
    if (loading) return
    if (profiles.length === 1) {
      setActiveProfile(profiles[0])
    }
  }, [loading, profiles, setActiveProfile])

  // Put the logged-in user's own profile first in the picker.
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.owner_id === userId && b.owner_id !== userId) return -1
    if (b.owner_id === userId && a.owner_id !== userId) return 1
    return a.name.localeCompare(b.name)
  })

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
        {!loading && !err && profiles.length === 0 && (
          <p className="muted">No profile found. Tell Dad.</p>
        )}
        {!loading && !err && profiles.length > 1 && (
          <div className="grid profile-grid" style={{ width: '100%' }}>
            {sortedProfiles.map((p) => (
              <button
                key={p.id}
                className="tile"
                onClick={() => setActiveProfile(p)}
              >
                <div className="emoji">{p.avatar}</div>
                <h2>{p.name}</h2>
                <div className="sub">
                  {p.owner_id === userId
                    ? `${p.xp ?? 0} XP`
                    : `Monitor · ${p.xp ?? 0} XP`}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
