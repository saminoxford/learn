// Normalize a fill-in answer for comparison. Lowercase + trim is forgiving
// of stray spaces and case, but otherwise letter-for-letter strict.
export function normalizeFill(s) {
  return String(s ?? '').trim().toLowerCase()
}
