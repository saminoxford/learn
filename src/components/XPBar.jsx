import { xpToLevel, progressInLevel } from '../lib/leveling.js'

export default function XPBar({ xp = 0 }) {
  const level = xpToLevel(xp)
  const { inLevel, perLevel } = progressInLevel(xp)
  const pct = Math.min(100, (inLevel / perLevel) * 100)

  return (
    <div className="xp-wrap">
      <div className="spaced" style={{ fontSize: '0.95rem' }}>
        <strong>Level {level} 🌟</strong>
        <span className="muted">
          {inLevel} / {perLevel} XP
        </span>
      </div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
