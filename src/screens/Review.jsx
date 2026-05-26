import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { fetchFailedQuestions, recordAttempts, buildAttempt } from '../content/questionHistory.js'
import { questionId } from '../content/recent.js'
import FillAnswer from '../components/FillAnswer.jsx'
import OrderAnswer from '../components/OrderAnswer.jsx'
import ChoiceAnswer from '../components/ChoiceAnswer.jsx'
import { normalizeFill } from '../components/fillCompare.js'
import { compareOrder } from '../components/orderCompare.js'

const MAX = 10

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
    /* ignore */
  }
}

// Review screen: replay the kid's recently-failed questions so a correct
// answer here marks them as passed (clearing them from the Review pool).
// Pulls question_snapshot rows directly — no generators involved.
export default function Review() {
  const { activeProfile, setRoute, updateActiveProfile, localOnly } = useAppCtx()

  const [loaded, setLoaded] = useState(false)
  const [failedRows, setFailedRows] = useState([])

  useEffect(() => {
    if (localOnly) {
      setLoaded(true)
      return
    }
    let cancelled = false
    fetchFailedQuestions(activeProfile.id, MAX)
      .then((rows) => {
        if (!cancelled) setFailedRows(rows)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [activeProfile.id, localOnly])

  // Reconstitute each stored snapshot into the question shape the answer
  // widgets expect. `subject` and `grade` ride along so we can write back
  // to question_attempts under the same key.
  const questions = useMemo(
    () =>
      failedRows.map((row) => ({
        ...row.question_snapshot,
        _qid: row.question_id,
        _subject: row.subject,
        _grade: row.grade
      })),
    [failedRows]
  )

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [typed, setTyped] = useState('')
  const [arrangement, setArrangement] = useState(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const attemptsRef = useRef([])

  const q = questions[idx]
  const isLast = idx === questions.length - 1
  const isFill = q?.type === 'fill'
  const isOrder = q?.type === 'order'

  const slots = isOrder
    ? arrangement && arrangement.length === q.steps.length
      ? arrangement
      : new Array(q.steps.length).fill(undefined)
    : null
  const correctOrder = isOrder ? q.steps.map((_, i) => i) : null
  const orderResult =
    isOrder && slots ? compareOrder(slots, correctOrder) : null

  const isCorrect = isFill
    ? normalizeFill(typed) === normalizeFill(q?.answer)
    : isOrder
      ? !!orderResult?.allCorrect
      : selected === q?.answer

  const hasAnswer = isFill
    ? typed.trim().length > 0
    : isOrder
      ? slots && slots.every((v) => v !== undefined)
      : selected != null

  useEffect(() => {
    const onKey = (e) => {
      if (questions.length === 0) return
      const cur = questions[idx]
      if (!cur) return
      if (e.key === 'Enter') {
        if (isFill && !hasAnswer && !checked) return
        const btn = document.getElementById('review-primary-btn')
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

  if (!loaded) {
    return (
      <div className="app-shell center-col">
        <p className="muted">Loading review…</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="app-shell center-col">
        <div className="card" style={{ textAlign: 'center', maxWidth: 420 }}>
          <h2>🎉 Nothing to review!</h2>
          <p className="muted" style={{ marginTop: 8 }}>
            You haven't missed any questions recently. Try a tougher grade?
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
    const right = isCorrect
    if (right) setScore((s) => s + 1)
    chime(right)
    attemptsRef.current.push(
      buildAttempt({
        question_id: q._qid,
        subject: q._subject,
        grade: q._grade,
        correct: right,
        snapshot: {
          type: q.type,
          question: q.question,
          options: q.options,
          answer: q.answer,
          steps: q.steps,
          emoji: q.emoji
        }
      })
    )
  }

  const next = async () => {
    if (!isLast) {
      setIdx((i) => i + 1)
      setSelected(null)
      setTyped('')
      setArrangement(null)
      setChecked(false)
      return
    }
    setSaving(true)
    const xpEarned = score * 10
    try {
      if (!localOnly) {
        await supabase.from('sessions').insert({
          user_id: activeProfile.id,
          subject: 'Review',
          grade: 'mixed',
          score,
          total: questions.length
        })
        const newXp = (activeProfile.xp ?? 0) + xpEarned
        await supabase
          .from('profiles')
          .update({ xp: newXp })
          .eq('id', activeProfile.id)
        updateActiveProfile({ xp: newXp })
        await recordAttempts(activeProfile.id, attemptsRef.current)
      }
    } catch (e) {
      console.error('Failed saving review session', e)
    } finally {
      setSaving(false)
      setRoute({
        name: 'results',
        subject: 'Review',
        grade: 'mixed',
        score,
        total: questions.length,
        xpEarned
      })
    }
  }

  const progress = ((idx + (checked ? 1 : 0)) / questions.length) * 100

  const quit = () => {
    if (!localOnly && attemptsRef.current.length > 0) {
      recordAttempts(activeProfile.id, attemptsRef.current).catch(() => {})
    }
    setRoute({ name: 'home' })
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <button className="btn-ghost" onClick={quit}>← Quit</button>
        <div className="brand">🎯 Review</div>
        <div className="muted">{idx + 1} / {questions.length}</div>
      </div>

      <div className="progress-bar" style={{ marginBottom: 24 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div key={`q-${idx}`} className="card fade-in" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '3.4rem', textAlign: 'center', lineHeight: 1 }}>
          {q.emoji || '🎯'}
        </div>
        <h2 style={{ textAlign: 'center', marginTop: 14, fontSize: '1.5rem' }}>
          {q.question}
        </h2>
        <p className="quiz-hint">
          {q._subject} · {q._grade} — get it right to clear it from review.
        </p>
      </div>

      {isOrder ? (
        <OrderAnswer
          steps={q.steps}
          shuffleSeed={idx + 1}
          value={slots}
          onChange={setArrangement}
          checked={checked}
          perSlot={orderResult?.perSlot}
        />
      ) : isFill ? (
        <FillAnswer
          value={typed}
          onChange={setTyped}
          checked={checked}
          correct={isCorrect}
          hint={q.hint}
        />
      ) : (
        <ChoiceAnswer
          options={q.options}
          selected={selected}
          onSelect={setSelected}
          checked={checked}
          correctAnswer={q.answer}
        />
      )}

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
        {!checked ? (
          <button
            id="review-primary-btn"
            className="btn-primary"
            disabled={!hasAnswer}
            onClick={checkAnswer}
          >
            Check answer
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
            <div style={{ fontSize: '1.15rem', textAlign: 'center' }}>
              {isCorrect
                ? '✅ Got it!'
                : isOrder
                  ? '❌ Not quite — the right order was:'
                  : `❌ Answer: ${q.answer}`}
            </div>
            {!isCorrect && isOrder && (
              <ol className="order-correct">
                {q.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            )}
            <button
              id="review-primary-btn"
              className="btn-primary"
              onClick={next}
              disabled={saving}
            >
              {isLast ? (saving ? 'Saving…' : 'Finish') : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
