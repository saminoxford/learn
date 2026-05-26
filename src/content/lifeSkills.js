// Life Skills generator. Draws a balanced mix from the 4 internal
// categories (household / mechanical / financial / personal) at the
// requested grade. Shuffles options at quiz time so the answer position
// varies between sittings.

import { LIFESKILLS, CATEGORIES } from './lifeSkillsContent.js'

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function instantiate(q) {
  if (q.type === 'choice') {
    return {
      type: 'choice',
      id: q.id,
      category: q.category,
      question: q.question,
      options: shuffle(q.options),
      answer: q.answer,
      emoji: q.emoji
    }
  }
  if (q.type === 'order') {
    return {
      type: 'order',
      id: q.id,
      category: q.category,
      question: q.question,
      steps: [...q.steps], // keep original order (the correct one)
      emoji: q.emoji
    }
  }
  return q
}

export function generateLifeSkillsQuestions(grade, n = 10) {
  const buckets = LIFESKILLS[grade]
  if (!buckets) return []

  // Round-robin across categories so a 10-question quiz hits all 4 by default
  // (2-3 from each, with category order shuffled per quiz).
  const catOrder = shuffle(CATEGORIES)
  const pools = catOrder.map((cat) => shuffle(buckets[cat] || []))

  const out = []
  const cursors = new Array(pools.length).fill(0)
  let attempts = 0
  while (out.length < n && attempts < n * 8) {
    for (let i = 0; i < pools.length && out.length < n; i++) {
      const pool = pools[i]
      if (cursors[i] >= pool.length) continue
      const q = pool[cursors[i]++]
      if (out.some((prev) => prev.id === q.id)) continue
      out.push(instantiate(q))
    }
    attempts++
  }
  return out
}

export function hasLifeSkills(grade) {
  const buckets = LIFESKILLS[grade]
  if (!buckets) return false
  return CATEGORIES.some((cat) => (buckets[cat] || []).length > 0)
}
