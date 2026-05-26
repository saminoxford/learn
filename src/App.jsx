import { useEffect, useState } from 'react'
import { supabase, envMissing } from './supabase.js'
import { isPreviewMode, disablePreviewMode } from './previewStore.js'
import { AppContext } from './AppContext.js'
import Login from './screens/Login.jsx'
import ProfileSelect from './screens/ProfileSelect.jsx'
import Home from './screens/Home.jsx'
import GradeSelect from './screens/GradeSelect.jsx'
import Quiz from './screens/Quiz.jsx'
import Results from './screens/Results.jsx'
import Progress from './screens/Progress.jsx'
import Article from './screens/Article.jsx'

const PREVIEW_SESSION = { user: { id: 'preview-user', email: 'preview@local' } }

export default function App() {
  const [preview, setPreview] = useState(() => isPreviewMode())
  const [session, setSession] = useState(() => (preview ? PREVIEW_SESSION : null))
  const [sessionLoaded, setSessionLoaded] = useState(() => preview)
  const [activeProfile, setActiveProfile] = useState(null)
  const [route, setRoute] = useState({ name: 'home' })

  useEffect(() => {
    if (preview) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoaded(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (!s) {
        setActiveProfile(null)
        setRoute({ name: 'home' })
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [preview])

  const logout = async () => {
    if (preview) {
      disablePreviewMode()
      setPreview(false)
      setSession(null)
      setActiveProfile(null)
      setRoute({ name: 'home' })
      return
    }
    await supabase.auth.signOut()
  }

  const switchProfile = () => {
    setActiveProfile(null)
    setRoute({ name: 'home' })
  }

  const enterPreview = () => {
    setPreview(true)
    setSession(PREVIEW_SESSION)
    setSessionLoaded(true)
  }

  // Admin flag comes from auth.users.raw_app_meta_data.is_admin — set in
  // Supabase via the admin API, so kids can't promote themselves. Admins
  // can read every profile and every session; they cannot write to others'
  // rows (RLS enforces owner_id = auth.uid() on writes).
  const isAdmin = preview || session?.user?.app_metadata?.is_admin === true

  // "Kid account" is purely a UI hint — the picker, Switch button, and
  // monitoring-mode banner are admin-only.
  const isKidAccount = !preview && !isAdmin

  // Can the current session write to the active profile? True in preview
  // mode (writes go to localStorage) and true when the active profile is
  // owned by the logged-in user. False when an admin is monitoring a kid.
  const canWrite =
    preview ||
    (!!activeProfile?.owner_id &&
      activeProfile.owner_id === session?.user?.id)

  const ctxValue = {
    session,
    activeProfile,
    setActiveProfile,
    updateActiveProfile: (patch) =>
      setActiveProfile((p) => (p ? { ...p, ...patch } : p)),
    route,
    setRoute,
    logout,
    switchProfile,
    preview,
    localOnly: preview,
    isAdmin,
    isKidAccount,
    canWrite
  }

  if (envMissing && !preview) {
    return (
      <div className="app-shell center-col">
        <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 12 }}>
            ⚠️ App not configured
          </h2>
          <p className="muted" style={{ marginBottom: 12 }}>
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
            are missing from this deployment's environment variables.
          </p>
          <p className="muted">
            Add them in Vercel → Settings → Environment Variables, then
            redeploy.
          </p>
        </div>
      </div>
    )
  }

  if (!sessionLoaded) {
    return (
      <div className="app-shell center-col">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  let screen
  if (!session) {
    screen = <Login onEnterPreview={enterPreview} />
  } else if (!activeProfile) {
    screen = <ProfileSelect />
  } else {
    switch (route.name) {
      case 'grade':
        screen = <GradeSelect subject={route.subject} />
        break
      case 'quiz':
        screen = <Quiz subject={route.subject} grade={route.grade} />
        break
      case 'results':
        screen = (
          <Results
            subject={route.subject}
            grade={route.grade}
            score={route.score}
            total={route.total ?? 10}
            xpEarned={route.xpEarned}
          />
        )
        break
      case 'progress':
        screen = <Progress />
        break
      case 'article':
        screen = <Article articleId={route.articleId} />
        break
      default:
        screen = <Home />
    }
  }

  return <AppContext.Provider value={ctxValue}>{screen}</AppContext.Provider>
}
