// Per-question lifetime history per profile.
//
// Persisted in the `question_attempts` Supabase table — one row per
// (user_id, question_id) with running ask_count / fail_count / last_correct
// / optional question_snapshot for Review mode.
//
// Writes happen at quiz finish in a single RPC batch. Reads are pre-warmed
// into an in-memory cache per (profile × subject × grade) so the picker
// (recent.js) can bias toward less-asked questions synchronously.

import { supabase } from '../supabase.js'

const CACHE = new Map() // key: `${profileId}::${subject}::${grade}` → Map<question_id, stats>
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_EXP = new Map() // same key → expiresAt timestamp

function cacheKey(profileId, subject, grade) {
  return `${profileId}::${subject}::${grade}`
}

// Builds the attempt payload from the per-question state Quiz collects.
// `correct` is required; `question_snapshot` is the full {type, question,
// options, answer, ...} object — only retained when the kid got it wrong
// (the RPC drops it for correct answers).
export function buildAttempt({ question_id, subject, grade, correct, snapshot }) {
  return {
    question_id,
    subject,
    grade,
    correct: !!correct,
    question_snapshot: correct ? null : snapshot
  }
}

// Send a quiz's worth of attempts in one RPC call. No-op when there's no
// profile (preview mode) or when the payload is empty.
export async function recordAttempts(profileId, attempts) {
  if (!profileId || !attempts?.length) return
  const { error } = await supabase.rpc('record_quiz_attempts', {
    p_user_id: profileId,
    p_attempts: attempts
  })
  if (error) {
    console.warn('record_quiz_attempts failed:', error.message)
  }
  // Invalidate any cached slot for this profile so the next quiz sees
  // fresh counts. Coarse but safe — we don't read often enough to matter.
  for (const k of CACHE.keys()) {
    if (k.startsWith(`${profileId}::`)) {
      CACHE.delete(k)
      CACHE_EXP.delete(k)
    }
  }
}

// Pre-warm the per-(profile, subject, grade) attempts map before the
// generators run. Caller awaits this and then the picker calls
// `getCachedAttempts` synchronously.
export async function fetchAttemptsForSlot(profileId, subject, grade) {
  if (!profileId) return new Map()
  const key = cacheKey(profileId, subject, grade)
  const exp = CACHE_EXP.get(key)
  if (exp && exp > Date.now()) return CACHE.get(key)

  const { data, error } = await supabase
    .from('question_attempts')
    .select('question_id, ask_count, fail_count, last_correct')
    .eq('user_id', profileId)
    .eq('subject', subject)
    .eq('grade', grade)
  if (error) {
    console.warn('fetchAttemptsForSlot error:', error.message)
    return new Map()
  }

  const map = new Map()
  for (const row of data || []) {
    map.set(row.question_id, {
      ask_count: row.ask_count,
      fail_count: row.fail_count,
      last_correct: row.last_correct
    })
  }
  CACHE.set(key, map)
  CACHE_EXP.set(key, Date.now() + CACHE_TTL_MS)
  return map
}

export function getCachedAttempts(profileId, subject, grade) {
  if (!profileId) return new Map()
  const exp = CACHE_EXP.get(cacheKey(profileId, subject, grade))
  if (!exp || exp <= Date.now()) return new Map()
  return CACHE.get(cacheKey(profileId, subject, grade)) || new Map()
}

// Most-recently-failed questions across all subjects. Powers the Review tile
// + Review screen — each row's question_snapshot is the full quiz question
// object the kid missed.
export async function fetchFailedQuestions(profileId, limit = 10) {
  if (!profileId) return []
  const { data, error } = await supabase
    .from('question_attempts')
    .select('question_id, subject, grade, question_snapshot, last_seen_at, fail_count')
    .eq('user_id', profileId)
    .eq('last_correct', false)
    .not('question_snapshot', 'is', null)
    .order('last_seen_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.warn('fetchFailedQuestions error:', error.message)
    return []
  }
  return data || []
}

// Cheap "is there anything to review?" check for the Home tile gating.
// Returns total count of distinct failed questions still outstanding.
export async function countFailedQuestions(profileId) {
  if (!profileId) return 0
  const { count, error } = await supabase
    .from('question_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profileId)
    .eq('last_correct', false)
    .not('question_snapshot', 'is', null)
  if (error) {
    console.warn('countFailedQuestions error:', error.message)
    return 0
  }
  return count || 0
}

// Aggregate distinct-question counts per (subject, grade) for the
// Coverage % cards in Progress.
export async function fetchCoverageCounts(profileId) {
  if (!profileId) return []
  const { data, error } = await supabase
    .from('question_attempts')
    .select('subject, grade, question_id')
    .eq('user_id', profileId)
  if (error) {
    console.warn('fetchCoverageCounts error:', error.message)
    return []
  }
  // Roll up client-side — Postgres COUNT(DISTINCT) over a (subject, grade)
  // group is fine here, but doing it in JS keeps the query simple and lets
  // us share the same fetch for follow-on stats later.
  const buckets = new Map()
  for (const row of data || []) {
    const k = `${row.subject}::${row.grade}`
    if (!buckets.has(k)) buckets.set(k, new Set())
    buckets.get(k).add(row.question_id)
  }
  return Array.from(buckets.entries()).map(([k, set]) => {
    const [subject, grade] = k.split('::')
    return { subject, grade, seen: set.size }
  })
}
