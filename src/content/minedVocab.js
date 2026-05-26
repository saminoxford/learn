// Article-mined vocabulary helper.
//
// Pulls vocab entries from the `articles.vocab` JSONB column for a given
// grade (matched against articles.reading_level) and merges them with
// the static Dolch/Fry wordlists in spellingGenerators / readingGenerators.
//
// Cached for ~5 minutes per grade in-memory so back-to-back quizzes don't
// re-hit Supabase. Cache is wiped on full page reload.

import { supabase } from '../supabase.js'

const CACHE = new Map() // grade → { rows, expiresAt }
const CACHE_TTL_MS = 5 * 60 * 1000

const ALLOWED_POS = new Set(['noun', 'verb', 'adjective'])

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'of', 'to', 'in', 'and', 'or', 'but', 'with', 'on', 'for', 'at', 'by',
  'from', 'as', 'that', 'this', 'these', 'those', 'it', 'its', 'he', 'she',
  'they', 'we', 'you', 'i', 'me', 'us', 'them', 'have', 'has', 'had',
  'do', 'does', 'did', 'so', 'if', 'not', 'no', 'yes', 'too', 'very'
])

function isValidEntry(v) {
  return (
    v &&
    typeof v === 'object' &&
    typeof v.word === 'string' &&
    v.word.length >= 3 &&
    !STOPWORDS.has(v.word.toLowerCase()) &&
    ALLOWED_POS.has(v.pos) &&
    typeof v.definition === 'string' &&
    v.definition.trim().length > 0
  )
}

// Normalize a mined entry into the shape Spelling/Reading expect on a
// wordlist row: { word, def, sentence?, emoji }
function normalize(entry) {
  return {
    word: entry.word.toLowerCase().trim(),
    def: entry.definition,
    emoji: entry.emoji || '📖',
    // mined antonyms passed through for spelling distractor lookup
    antonyms: Array.isArray(entry.antonyms) ? entry.antonyms : []
  }
}

// Fetch vocab from articles at the given numeric reading level (1-5).
// Returns an array of normalized wordlist-shape entries.
export async function fetchMinedVocab(readingLevel) {
  const cached = CACHE.get(readingLevel)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rows
  }

  const { data, error } = await supabase
    .from('articles')
    .select('vocab')
    .eq('reading_level', readingLevel)
  if (error) {
    console.warn('fetchMinedVocab error:', error.message)
    return []
  }

  const seen = new Set()
  const out = []
  for (const row of data || []) {
    for (const v of row.vocab || []) {
      if (!isValidEntry(v)) continue
      const norm = normalize(v)
      if (seen.has(norm.word)) continue
      seen.add(norm.word)
      out.push(norm)
    }
  }

  CACHE.set(readingLevel, { rows: out, expiresAt: Date.now() + CACHE_TTL_MS })
  return out
}

// Merge a static wordlist (with emoji defaulting via a fallback) and a
// mined vocab list. Dedupe by lowercase word — static entries win on collision.
export function mergeWordlists(staticEntries, minedEntries) {
  const seen = new Set(staticEntries.map((e) => e.word.toLowerCase()))
  const merged = [...staticEntries]
  for (const m of minedEntries) {
    if (seen.has(m.word)) continue
    merged.push(m)
    seen.add(m.word)
  }
  return merged
}

// Map a grade label ("3rd Grade") to a numeric reading-level (3).
const GRADE_NUM = {
  '1st Grade': 1,
  '2nd Grade': 2,
  '3rd Grade': 3,
  '4th Grade': 4,
  '5th Grade': 5
}
export function gradeToNum(grade) {
  return GRADE_NUM[grade] || 3
}

// Sync cache read. Returns whatever the last `fetchMinedVocab(readingLevel)`
// stored, or an empty array. Used by Spelling/Reading generators which
// can't easily go async — Quiz pre-warms the cache before generation.
export function getCachedMinedVocab(readingLevel) {
  const cached = CACHE.get(readingLevel)
  if (cached && cached.expiresAt > Date.now()) return cached.rows
  return []
}

// Sync version of fetch that takes a grade label string.
export function getMinedForGrade(gradeLabel) {
  return getCachedMinedVocab(gradeToNum(gradeLabel))
}
