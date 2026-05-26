import { useEffect, useRef } from 'react'

// Renders the typed answer input for `type: 'fill'` questions. Stateless —
// the parent (Quiz) owns the value, the checked-state, and the verdict.

export default function FillAnswer({
  value,
  onChange,
  checked,
  correct,
  hint,
  disabled
}) {
  const ref = useRef(null)

  useEffect(() => {
    // autofocus when the question first renders
    if (!checked) ref.current?.focus()
  }, [checked])

  let cls = 'fill-input'
  if (checked) cls += correct ? ' correct' : ' wrong'

  return (
    <div className="fill-wrap">
      <input
        ref={ref}
        type="text"
        className={cls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || checked}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        placeholder="Type your answer"
      />
      {hint && !checked && <div className="muted fill-hint">{hint}</div>}
    </div>
  )
}
