import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
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
    preview
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
