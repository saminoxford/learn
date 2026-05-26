export default function XPBar({ xp = 0 }) {
  const level = Math.floor(xp / 100) + 1
  const inLevel = xp % 100
  return (
    <div className="xp-wrap">
      <div className="spaced" style={{ fontSize: '0.95rem' }}>
        <strong>Level {level} 🌟</strong>
        <span className="muted">{inLevel} / 100 XP</span>
      </div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${inLevel}%` }} />
      </div>
    </div>
  )
}
