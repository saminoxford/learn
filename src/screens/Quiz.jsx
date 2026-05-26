import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { getQuestions } from '../content/index.js'
import { recordSession, updateProfile } from '../previewStore.js'
import FillAnswer from '../components/FillAnswer.jsx'
import { normalizeFill } from '../components/fillCompare.js'

const TOTAL = 10

// gentle Web Audio chimes — no external assets
function chime(correct) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    if (correct) {
      o.frequency.setValueAtTime(660, ctx.currentTime)
      o.frequency.linearRampToValueAtTime(990, ctx.currentTime + 0.12)
    } else {
      o.frequency.setValueAtTime(330, ctx.currentTime)
      o.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.18)
    }
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.36)
    o.onended = () => ctx.close()
  } catch {
    /* ignore audio failures — never block UX */
  }
}

export default function Quiz({ subject, grade }) {
  const { activeProfile, setRoute, updateActiveProfile, localOnly } = useAppCtx()
  const questions = useMemo(
    () => getQuestions(activeProfile.id, subject, grade, TOTAL),
    [activeProfile.id, subject, grade]
  )

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null) // for 'choice'
  const [typed, setTyped] = useState('') // for 'fill'
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [quitConfirm, setQuitConfirm] = useState(false)

  const q = questions[idx]
  const isLast = idx === questions.length - 1
  const isFill = q?.type === 'fill'

  // For fill, "selected" is the typed value. Match comparison is normalized.
  const isCorrect = isFill
    ? normalizeFill(typed) === normalizeFill(q?.answer)
    : selected === q?.answer

  const hasAnswer = isFill ? typed.trim().length > 0 : selected != null

  // keyboard shortcuts: digits select choices, Enter advances
  useEffect(() => {
    const onKey = (e) => {
      if (questions.length === 0) return
      const cur = questions[idx]
      if (!cur) return
      if (e.key === 'Enter') {
        // Don't let Enter inside the input bubble up before the user typed something
        if (isFill && !hasAnswer && !checked) return
        const btn = document.getElementById('quiz-primary-btn')
        if (btn && !btn.disabled) btn.click()
        return
      }
      if (cur.type === 'choice') {
        const n = Number(e.key)
        if (Number.isInteger(n) && n >= 1 && n <= cur.options.length) {
          if (!checked) setSelected(cur.options[n - 1])
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [idx, checked, questions, isFill, hasAnswer])

  if (questions.length === 0) {
    return (
      <div className="app-shell center-col">
        <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
          <h2>No questions yet for {grade} {subject}.</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            Coming soon — try another grade.
          </p>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => setRoute({ name: 'home' })}>← Home</button>
          </div>
        </div>
      </div>
    )
  }

  const checkAnswer = () => {
    if (!hasAnswer) return
    setChecked(true)
    const right = isFill
      ? normalizeFill(typed) === normalizeFill(q.answer)
      : selected === q.answer
    if (right) setScore((s) => s + 1)
    chime(right)
  }

  const next = async () => {
    if (!isLast) {
      setIdx((i) => i + 1)
      setSelected(null)
      setTyped('')
      setChecked(false)
      return
    }
    setSaving(true)
    const xpEarned = score * 10
    try {
      if (localOnly) {
        recordSession({
          user_id: activeProfile.id,
          subject,
          grade,
          score,
          total: questions.length
        })
        const newXp = (activeProfile.xp ?? 0) + xpEarned
        updateProfile(activeProfile.id, { xp: newXp })
        updateActiveProfile({ xp: newXp })
      } else {
        await supabase.from('sessions').insert({
          user_id: activeProfile.id,
          subject,
          grade,
          score,
          total: questions.length
        })
        const newXp = (activeProfile.xp ?? 0) + xpEarned
        await supabase
          .from('profiles')
          .update({ xp: newXp })
          .eq('id', activeProfile.id)
        updateActiveProfile({ xp: newXp })
      }
    } catch (e) {
      console.error('Failed saving session', e)
    } finally {
      setSaving(false)
      setRoute({
        name: 'results',
        subject,
        grade,
        score,
        xpEarned
      })
    }
  }

  const progress = ((idx + (checked ? 1 : 0)) / questions.length) * 100

  const requestQuit = () => {
    if (idx === 0 && !checked) {
      setRoute({ name: 'home' })
      return
    }
    setQuitConfirm(true)
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <button className="btn-ghost" onClick={requestQuit}>← Quit</button>
        <div className="brand">{subject} · {grade}</div>
        <div className="muted">{idx + 1} / {questions.length}</div>
      </div>

      <div className="progress-bar" style={{ marginBottom: 24 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div key={`q-${idx}`} className="card fade-in" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '3.4rem', textAlign: 'center', lineHeight: 1 }}>
          {q.emoji}
        </div>
        <h2 style={{ textAlign: 'center', marginTop: 14, fontSize: '1.5rem' }}>
          {q.question}
        </h2>
      </div>

      {isFill ? (
        <FillAnswer
          value={typed}
          onChange={setTyped}
          checked={checked}
          correct={isCorrect}
          hint={q.hint}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map((opt, i) => {
            let cls = 'option-btn'
            if (checked) {
              if (opt === q.answer) cls += ' correct'
              else if (opt === selected) cls += ' wrong'
            } else if (opt === selected) {
              cls += ' selected'
            }
            return (
              <button
                key={opt}
                className={cls}
                disabled={checked}
                onClick={() => setSelected(opt)}
              >
                <span className="option-num">{i + 1}</span>
                <span className="option-text">{opt}</span>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
        {!checked ? (
          <button
            id="quiz-primary-btn"
            className="btn-primary"
            disabled={!hasAnswer}
            onClick={checkAnswer}
          >
            Check answer
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: '1.15rem' }}>
              {isCorrect ? '✅ Correct!' : `❌ Answer: ${q.answer}`}
            </div>
            <button
              id="quiz-primary-btn"
              className="btn-primary"
              onClick={next}
              disabled={saving}
            >
              {isLast ? (saving ? 'Saving…' : 'Finish') : 'Next →'}
            </button>
          </div>
        )}
      </div>

      {quitConfirm && (
        <div className="modal-backdrop" onClick={() => setQuitConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Quit this quiz?</h2>
            <p className="muted" style={{ marginBottom: 18 }}>
              You'll lose your progress on this round.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setQuitConfirm(false)}>
                Keep playing
              </button>
              <button className="btn-primary" onClick={() => setRoute({ name: 'home' })}>
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
