// Sliding-window anti-repeat tracker. Per (profile × subject × grade), keep
// a list of recently-shown question identifiers in localStorage so the
// picker can prefer fresh questions over recently-seen ones.
//
// Lifetime ask-counts live in Supabase (question_attempts) — see
// pickWithFrequencyBias below. localStorage is just the "don't show twice
// in the next few quizzes" guard; Supabase is "over a kid's whole history,
// nudge them toward questions they've seen less."

import { getCachedAttempts } from './questionHistory.js'

const WINDOW = 30 // remember the last 30 questions per slot

function keyFor(profileId, subject, grade) {
  return `learn:recent:${profileId || 'anon'}:${subject}:${grade}`
}

function readWindow(profileId, subject, grade) {
  try {
    const raw = window.localStorage.getItem(keyFor(profileId, subject, grade))
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeWindow(profileId, subject, grade, ids) {
  try {
    window.localStorage.setItem(
      keyFor(profileId, subject, grade),
      JSON.stringify(ids.slice(-WINDOW))
    )
  } catch {
    /* localStorage full or disabled — silently ignore */
  }
}

// Stable, fast text hash (FNV-1a, 32-bit). Produces an unsigned base-36 string.
// Identical text always yields the same id; different text almost never collides.
export function questionId(q) {
  if (q?.id) return String(q.id)
  const text = String(q?.question ?? '') + '|' + String(q?.answer ?? '')
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(36)
}

// Given a candidate pool (array of question objects), return up to n picks
// that prefer items not in the recent window. Records the picks in the
// recent window for next time.
//
// Dedupes by stable id before picking so the same logical question can't
// appear twice in one quiz, even if the generator yielded duplicates in
// the oversample (common for fixed-fact templates like "largest ocean?").
export function pickWithRecentMemory(profileId, subject, grade, candidates, n) {
  if (!candidates?.length) return []

  // 1. Dedupe candidates by id (keep first occurrence)
  const uniqueById = new Map()
  for (const q of candidates) {
    const id = questionId(q)
    if (!uniqueById.has(id)) uniqueById.set(id, q)
  }

  // 2. Partition into fresh (not in recent window) and seen
  const recent = new Set(readWindow(profileId, subject, grade))
  const fresh = []
  const seen = []
  for (const [id, q] of uniqueById) {
    if (recent.has(id)) seen.push({ q, id })
    else fresh.push({ q, id })
  }

  shuffle(fresh)
  shuffle(seen)

  // 3. Pick from fresh first, fall back to seen if we run out
  const chosen = [...fresh, ...seen].slice(0, n)

  // 4. Record what we showed (append, capped to WINDOW)
  const nextWindow = [
    ...readWindow(profileId, subject, grade),
    ...chosen.map((c) => c.id)
  ]
  writeWindow(profileId, subject, grade, nextWindow)

  return chosen.map((c) => c.q)
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

// Lifetime frequency bias: bucket candidates by how many times the kid
// has been asked them across all sessions, prefer least-seen buckets, then
// hand off to pickWithRecentMemory so the in-session sliding window still
// guards against same-quiz dupes.
//
// Buckets: fresh (0 asks) → light (1-2) → heavy (3+). The cache reads
// synchronously off whatever fetchAttemptsForSlot pre-warmed — if nothing's
// warmed (preview mode, fetch failed) every candidate falls into "fresh".
export function pickWithFrequencyBias(profileId, subject, grade, candidates, n) {
  if (!candidates?.length) return []
  const attempts = getCachedAttempts(profileId, subject, grade)
  if (attempts.size === 0) {
    return pickWithRecentMemory(profileId, subject, grade, candidates, n)
  }

  const fresh = []
  const light = []
  const heavy = []
  for (const q of candidates) {
    const id = questionId(q)
    const c = attempts.get(id)?.ask_count ?? 0
    if (c === 0) fresh.push(q)
    else if (c <= 2) light.push(q)
    else heavy.push(q)
  }

  // Concatenate in bias order, then run through the recent-window picker
  // which keeps the in-session dedupe and updates localStorage.
  const ordered = [...fresh, ...light, ...heavy]
  return pickWithRecentMemory(profileId, subject, grade, ordered, n)
}
