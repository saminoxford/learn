// Shared multiple-choice option grid used by Quiz.jsx (per question) and
// Article.jsx (per comprehension question). Stateless — parent owns the
// selected value and the checked/correct state.

export default function ChoiceAnswer({
  options,
  selected,
  onSelect,
  checked,
  correctAnswer
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {options.map((opt, i) => {
        let cls = 'option-btn'
        if (checked) {
          if (opt === correctAnswer) cls += ' correct'
          else if (opt === selected) cls += ' wrong'
        } else if (opt === selected) {
          cls += ' selected'
        }
        return (
          <button
            key={opt}
            type="button"
            className={cls}
            disabled={checked}
            onClick={() => onSelect(opt)}
          >
            <span className="option-num">{i + 1}</span>
            <span className="option-text">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
