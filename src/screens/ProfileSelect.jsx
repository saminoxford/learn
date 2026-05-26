import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { listProfiles as listPreviewProfiles } from '../previewStore.js'
import { expectedProfilesForEmail, visibleProfilesForEmail } from '../profiles.js'

// Change this to whatever you want. The build inlines it into the bundle, so
// it's obscure but not a real secret — fine for keeping kids out, not banks.
const DAD_PASSWORD = 'iamdad'

export default function ProfileSelect() {
  const { session, setActiveProfile, logout, preview, enterTestMode, isKidAccount } = useAppCtx()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [dadOpen, setDadOpen] = useState(false)
  const [dadPwd, setDadPwd] = useState('')
  const [dadErr, setDadErr] = useState('')

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
        const toInsert = expectedProfilesForEmail(email).map((d) => ({
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
  }, [session, preview, email])

  // Auto-select when only one visible profile (boys skip the picker entirely)
  const visible = preview ? profiles : visibleProfilesForEmail(email, profiles)
  useEffect(() => {
    if (!loading && visible.length === 1) {
      setActiveProfile(visible[0])
    }
  }, [loading, visible, setActiveProfile])

  const submitDad = (e) => {
    e?.preventDefault?.()
    if (dadPwd === DAD_PASSWORD) {
      setDadOpen(false)
      setDadPwd('')
      setDadErr('')
      enterTestMode()
    } else {
      setDadErr('Wrong password.')
    }
  }

  const cancelDad = () => {
    setDadOpen(false)
    setDadPwd('')
    setDadErr('')
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="brand">🎓 Learn</div>
        <div className="row">
          {preview && <span className="preview-badge">Preview</span>}
          {!isKidAccount && (
            <button className="btn-ghost" onClick={() => setDadOpen(true)}>
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

      {dadOpen && (
        <div className="modal-backdrop" onClick={cancelDad}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submitDad}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Dad test mode</h2>
            <p className="muted" style={{ marginBottom: 16 }}>
              Quizzes won't count toward Marshall or Waylon.
            </p>
            <input
              autoFocus
              type="password"
              placeholder="Password"
              value={dadPwd}
              onChange={(e) => {
                setDadPwd(e.target.value)
                setDadErr('')
              }}
              style={{ width: '100%' }}
            />
            {dadErr && <div className="error" style={{ marginTop: 8 }}>{dadErr}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button type="button" className="btn-ghost" onClick={cancelDad}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Enter
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
