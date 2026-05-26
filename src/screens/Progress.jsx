import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import XPBar from '../components/XPBar.jsx'
import { listSessions as listPreviewSessions } from '../previewStore.js'
import { gradeToNum } from '../content/minedVocab.js'

// Compare a quiz's grade label ("3rd Grade") against the kid's current
// profile grade_level. Powers the Stretch/Review badge on recent rows.
function levelBadge(sessionGrade, profileGradeLevel) {
  if (!sessionGrade || !profileGradeLevel) return null
  const sg = gradeToNum(sessionGrade)
  const pg = Number(profileGradeLevel)
  if (!sg || !pg) return null
  if (sg > pg) return { label: 'Stretch ↑', cls: 'level-badge level-badge--stretch' }
  if (sg < pg) return { label: 'Review ↓', cls: 'level-badge level-badge--review' }
  return null // at-grade: no badge, reduces visual noise
}

export default function Progress() {
  const { activeProfile, setRoute, localOnly } = useAppCtx()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      if (localOnly) {
        const rows = listPreviewSessions(activeProfile.id)
        if (!cancelled) {
          setSessions(rows)
          setLoading(false)
        }
        return
      }
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', activeProfile.id)
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (error) setErr(error.message)
      else setSessions(data ?? [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [activeProfile, localOnly])

  const totals = sessions.reduce(
    (acc, s) => {
      acc.count += 1
      acc.bySubject[s.subject] = acc.bySubject[s.subject] ?? { count: 0, score: 0, total: 0 }
      acc.bySubject[s.subject].count += 1
      acc.bySubject[s.subject].score += s.score ?? 0
      acc.bySubject[s.subject].total += s.total ?? 0
      return acc
    },
    { count: 0, bySubject: {} }
  )

  const recent = sessions.slice(0, 10)

  return (
    <div className="app-shell">
      <div className="top-bar">
        <button className="btn-ghost" onClick={() => setRoute({ name: 'home' })}>
          ← Home
        </button>
        <div className="brand">📊 {activeProfile.name}'s Progress</div>
        <div style={{ width: 80 }} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="spaced" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{totals.count} quizzes completed</h2>
            <p className="muted">Total XP: {activeProfile.xp ?? 0}</p>
          </div>
          <XPBar xp={activeProfile.xp ?? 0} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: 12 }}>By subject</h2>
        {Object.keys(totals.bySubject).length === 0 && (
          <p className="muted">No sessions yet — go play a quiz!</p>
        )}
        {Object.entries(totals.bySubject).map(([subject, t]) => (
          <div key={subject} className="session-row">
            <strong>{subject}</strong>
            <span className="muted">{t.count} sessions</span>
            <span className="muted">{t.score}/{t.total}</span>
            <span>{t.total ? Math.round((t.score / t.total) * 100) : 0}%</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: 12 }}>Recent sessions</h2>
        {loading && <p className="muted">Loading…</p>}
        {err && <p className="error">{err}</p>}
        {!loading && recent.length === 0 && (
          <p className="muted">No recent activity yet.</p>
        )}
        {recent.map((s) => {
          const badge = levelBadge(s.grade, activeProfile.grade_level)
          return (
            <div key={s.id} className="session-row">
              <strong>{s.subject}</strong>
              <span className="muted">
                {badge && <span className={badge.cls}>{badge.label}</span>}
                {s.grade}
              </span>
              <span>{s.score}/{s.total}</span>
              <span className="muted">
                {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
