import { useMemo } from 'react'

// Renders the tap-to-arrange UI for `type: 'order'` questions.
//
// Props:
//   steps         — the CORRECT-ORDER array of step strings (canonical)
//   shuffleSeed   — number; we shuffle the pool display order using this
//   value         — array of step indexes the user has placed, in slot order.
//                   undefined entries mean the slot is empty.
//   onChange(nextValue)
//   checked       — bool; once true, slots show correct/wrong colors
//   perSlot       — bool[]; which slots are correct (only used after `checked`)

function seededShuffle(arr, seed) {
  const copy = arr.map((v, i) => ({ v, i }))
  let s = seed | 0
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const j = s % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function OrderAnswer({
  steps,
  shuffleSeed = 1,
  value,
  onChange,
  checked,
  perSlot
}) {
  const slots = value || new Array(steps.length).fill(undefined)
  const usedIdxs = new Set(slots.filter((v) => v !== undefined))

  // Stable shuffled display order for the pool
  const shuffled = useMemo(() => seededShuffle(steps, shuffleSeed), [steps, shuffleSeed])

  const placeIntoNextSlot = (stepIdx) => {
    if (checked) return
    if (usedIdxs.has(stepIdx)) return
    const nextEmpty = slots.findIndex((v) => v === undefined)
    if (nextEmpty < 0) return
    const next = [...slots]
    next[nextEmpty] = stepIdx
    onChange(next)
  }

  const removeFromSlot = (slotIdx) => {
    if (checked) return
    if (slots[slotIdx] === undefined) return
    const next = [...slots]
    next[slotIdx] = undefined
    onChange(next)
  }

  return (
    <div className="order-wrap">
      <div className="order-pool-label muted">Tap to add ↓</div>
      <div className="order-pool">
        {shuffled.map(({ v, i }) => {
          const used = usedIdxs.has(i)
          return (
            <button
              key={i}
              type="button"
              className={`order-chip ${used ? 'used' : ''}`}
              disabled={checked || used}
              onClick={() => placeIntoNextSlot(i)}
            >
              {v}
            </button>
          )
        })}
      </div>

      <div className="order-slots-label muted" style={{ marginTop: 14 }}>
        Your order
      </div>
      <div className="order-slots">
        {slots.map((stepIdx, slotIdx) => {
          let cls = 'order-slot'
          if (checked) cls += perSlot?.[slotIdx] ? ' correct' : ' wrong'
          else if (stepIdx !== undefined) cls += ' filled'
          return (
            <button
              key={slotIdx}
              type="button"
              className={cls}
              disabled={checked || stepIdx === undefined}
              onClick={() => removeFromSlot(slotIdx)}
            >
              <span className="order-slot-num">{slotIdx + 1}.</span>
              <span className="order-slot-text">
                {stepIdx !== undefined ? steps[stepIdx] : ' '}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
