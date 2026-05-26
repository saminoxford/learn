// Compare the user's arrangement of step indexes against the canonical order.
// `userOrder` and `correctOrder` are both arrays of step indexes (or strings).
// Returns whether everything is right and which positions were correct.

export function compareOrder(userOrder, correctOrder) {
  const perSlot = correctOrder.map((expected, i) => userOrder[i] === expected)
  const allCorrect = perSlot.every(Boolean)
  return { allCorrect, perSlot }
}
