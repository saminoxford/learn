import { useAppCtx } from '../AppContext.js'
import { hasContent } from '../content/index.js'

const GRADES = ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade']

export default function GradeSelect({ subject }) {
  const { setRoute, activeProfile } = useAppCtx()
  const defaultGrade = Number(activeProfile?.grade_level) || 3 // 1-5

  return (
    <div className="app-shell">
      <div className="top-bar">
        <button className="btn-ghost" onClick={() => setRoute({ name: 'home' })}>
          ← Home
        </button>
        <div className="brand">{subject}</div>
        <div style={{ width: 80 }} />
      </div>

      <div className="center-col">
        <h1 style={{ fontSize: '2rem' }}>Choose your grade</h1>
        <div className="grid grade-grid" style={{ width: '100%' }}>
          {GRADES.map((g, i) => {
            const available = hasContent(subject, g)
            const isDefault = i + 1 === defaultGrade
            let cls = 'grade-tile'
            if (isDefault && available) cls += ' default-grade'
            return (
              <button
                key={g}
                className={cls}
                disabled={!available}
                title={available ? 'Take a quiz' : 'Coming soon'}
                onClick={() => setRoute({ name: 'quiz', subject, grade: g })}
              >
                {g}
                {isDefault && available && (
                  <div className="grade-tile-yours">★ Yours</div>
                )}
                {!available && (
                  <div className="sub" style={{ fontSize: '0.8rem', marginTop: 6 }}>
                    Coming soon
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
