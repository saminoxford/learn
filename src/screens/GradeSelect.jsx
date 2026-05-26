import { useAppCtx } from '../AppContext.js'
import { mathQuestions } from '../content/math.js'
import { scienceQuestions } from '../content/science.js'
import { geographyQuestions } from '../content/geography.js'

const GRADES = ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade']

const BANKS = {
  Math: mathQuestions,
  Science: scienceQuestions,
  Geography: geographyQuestions
}

export default function GradeSelect({ subject }) {
  const { setRoute } = useAppCtx()
  const bank = BANKS[subject] ?? {}

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
          {GRADES.map((g) => {
            const count = (bank[g] ?? []).length
            const disabled = count === 0
            return (
              <button
                key={g}
                className="grade-tile"
                disabled={disabled}
                title={disabled ? 'Coming soon' : `${count} questions available`}
                onClick={() =>
                  setRoute({ name: 'quiz', subject, grade: g })
                }
              >
                {g}
                {disabled && (
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
