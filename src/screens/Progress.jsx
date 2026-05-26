import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import XPBar from '../components/XPBar.jsx'
import { listSessions as listPreviewSessions } from '../previewStore.js'
import { gradeToNum } from '../content/minedVocab.js'
import { poolSize, COVERAGE_SUBJECTS, GRADES } from '../content/index.js'
import { fetchCoverageCounts } from '../content/questionHistory.js'

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
  const [coverage, setCoverage] = useState([])

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

  // Coverage counts come from question_attempts. Preview mode has no DB
  // history, so the cards just stay at 0/— in that case.
  useEffect(() => {
    if (localOnly || !activeProfile) return
    let cancelled = false
    fetchCoverageCounts(activeProfile.id)
      .then((rows) => {
        if (!cancelled) setCoverage(rows)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [activeProfile, localOnly])

  // Roll the raw (subject, grade, seen) rows up into per-subject totals
  // by summing seen across grades AND pool sizes across grades.
  const coverageBySubject = useMemo(() => {
    const seenMap = new Map()
    for (const row of coverage) {
      const k = row.subject
      seenMap.set(k, (seenMap.get(k) || 0) + (row.seen || 0))
    }
    return COVERAGE_SUBJECTS.map((subject) => {
      const seen = seenMap.get(subject) || 0
      let pool = 0
      for (const g of GRADES) {
        const p = poolSize(subject, g)
        if (typeof p === 'number') pool += p
      }
      return {
        subject,
        seen: Math.min(seen, pool), // cap at 100% if estimate is low
        pool,
        pct: pool > 0 ? Math.min(100, Math.round((seen / pool) * 100)) : 0
      }
    })
  }, [coverage])

  const overall = useMemo(() => {
    const seen = coverageBySubject.reduce((n, r) => n + r.seen, 0)
    const pool = coverageBySubject.reduce((n, r) => n + r.pool, 0)
    const pct = pool > 0 ? Math.min(100, Math.round((seen / pool) * 100)) : 0
    return { seen, pool, pct }
  }, [coverageBySubject])

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

      {!localOnly && overall.pool > 0 && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Coverage</h2>
            <p className="muted" style={{ marginBottom: 12 }}>
              You've explored {overall.pct}% of available questions
              ({overall.seen} / {overall.pool}).
            </p>
            <div className="coverage-bar">
              <div className="coverage-fill" style={{ width: `${overall.pct}%` }} />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 12 }}>By subject (coverage)</h2>
            {coverageBySubject
              .slice()
              .sort((a, b) => b.pct - a.pct)
              .map((row) => (
                <div key={row.subject} className="coverage-row">
                  <strong style={{ minWidth: 110 }}>{row.subject}</strong>
                  <div className="coverage-bar" style={{ flex: 1 }}>
                    <div
                      className="coverage-fill"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="muted" style={{ minWidth: 90, textAlign: 'right' }}>
                    {row.pool > 0 ? `${row.seen}/${row.pool} · ${row.pct}%` : '—'}
                  </span>
                </div>
              ))}
          </div>
        </>
      )}

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
