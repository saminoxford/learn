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

const PREVIEW_SESSION = { user: { id: 'preview-user', email: 'preview@local' } }
const DAD_PROFILE = { id: 'dad', name: 'Dad', avatar: '👨', xp: 0 }

export default function App() {
  const [preview, setPreview] = useState(() => isPreviewMode())
  const [session, setSession] = useState(() => (preview ? PREVIEW_SESSION : null))
  const [sessionLoaded, setSessionLoaded] = useState(() => preview)
  const [activeProfile, setActiveProfile] = useState(null)
  const [route, setRoute] = useState({ name: 'home' })
  const [testMode, setTestMode] = useState(false)

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
        setTestMode(false)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [preview])

  const logout = async () => {
    if (testMode) {
      setTestMode(false)
      setActiveProfile(null)
      setRoute({ name: 'home' })
      return
    }
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
    if (testMode) {
      setTestMode(false)
    }
    setActiveProfile(null)
    setRoute({ name: 'home' })
  }

  const enterPreview = () => {
    setPreview(true)
    setSession(PREVIEW_SESSION)
    setSessionLoaded(true)
  }

  const enterTestMode = () => {
    setTestMode(true)
    setActiveProfile({ ...DAD_PROFILE })
    setRoute({ name: 'home' })
  }

  // Bypass real Supabase writes when in either preview or test mode
  const localOnly = preview || testMode

  // Admin flag comes from auth.users.raw_app_meta_data.is_admin — set in
  // Supabase via the admin API, so kids can't promote themselves. Preview
  // and test modes count as admin so the full UI is exercisable.
  const isAdmin = localOnly || session?.user?.app_metadata?.is_admin === true

  // Kid account = a real, non-admin auth session. These see no picker,
  // no Switch button, no Dad mode — just their own Home.
  const isKidAccount = !localOnly && !isAdmin

  // Can the current session write to the active profile? True in preview/test
  // (writes go to localStorage) and true when the active profile is owned by
  // the logged-in user. False when an admin is monitoring someone else.
  const canWrite =
    localOnly ||
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
    enterTestMode,
    preview,
    testMode,
    localOnly,
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
            xpEarned={route.xpEarned}
          />
        )
        break
      case 'progress':
        screen = <Progress />
        break
      default:
        screen = <Home />
    }
  }

  return <AppContext.Provider value={ctxValue}>{screen}</AppContext.Provider>
}
