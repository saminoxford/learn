import { useEffect } from 'react'
import { useAppCtx } from '../AppContext.js'
import Confetti from '../components/Confetti.jsx'

function starsFor(score) {
  if (score >= 9) return 3
  if (score >= 7) return 2
  if (score >= 4) return 1
  return 0
}

function messageFor(score) {
  if (score === 10) return 'Perfect! 🔥 You aced it!'
  if (score >= 8) return 'Awesome work! 🌟'
  if (score >= 5) return 'Nice effort — keep going! 💪'
  return 'Good try! Practice makes perfect. 🌱'
}

// chord: pleasant arpeggio celebration
function celebrationSound() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'triangle'
      o.frequency.value = freq
      const start = ctx.currentTime + i * 0.08
      g.gain.setValueAtTime(0.0001, start)
      g.gain.linearRampToValueAtTime(0.12, start + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
      o.connect(g).connect(ctx.destination)
      o.start(start)
      o.stop(start + 0.55)
    })
    setTimeout(() => ctx.close(), 1200)
  } catch {
    /* ignore */
  }
}

export default function Results({ subject, grade, score, xpEarned }) {
  const { setRoute } = useAppCtx()
  const stars = starsFor(score)
  const perfect = score === 10

  useEffect(() => {
    if (perfect) celebrationSound()
  }, [perfect])

  return (
    <div className="app-shell center-col">
      {perfect && <Confetti />}
      <div className="card pop-in" style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: 4 }}>{score} / 10</h1>
        <div style={{ fontSize: '2.6rem', letterSpacing: 8 }}>
          {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
        </div>
        <p style={{ marginTop: 14, fontSize: '1.15rem' }}>{messageFor(score)}</p>
        <p className="muted" style={{ marginTop: 8 }}>
          +{xpEarned} XP earned
        </p>
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            marginTop: 26,
            flexWrap: 'wrap'
          }}
        >
          <button
            className="btn-primary"
            onClick={() => setRoute({ name: 'quiz', subject, grade })}
          >
            Play again
          </button>
          <button className="btn-ghost" onClick={() => setRoute({ name: 'home' })}>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}
