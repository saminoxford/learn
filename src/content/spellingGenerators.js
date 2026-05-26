// Spelling question generators.
//
// 1st–2nd grade: "Which is spelled correctly?" multiple choice. Correct
// word plus 3 plausible misspellings (adjacent-swap, drop-letter,
// double-letter, vowel-swap).
//
// 3rd–5th grade: meaning-based multiple choice. The kid sees a definition
// (with an emoji visual hint), and 4 word options:
//   - target word, spelled correctly  ← answer
//   - target word, misspelled         (tests spelling)
//   - antonym or other word, correctly spelled (tests meaning)
//   - another antonym or other word, correctly spelled
// So the kid has to know BOTH the meaning AND the spelling.

import { WORDS, ANTONYMS } from './wordlists.js'
import { getMinedForGrade, mergeWordlists } from './minedVocab.js'

// Returns the combined static + mined word pool for the given grade label.
function poolForGrade(grade) {
  const staticEntries = WORDS[grade] || []
  const mined = getMinedForGrade(grade)
  return mergeWordlists(staticEntries, mined)
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const VOWELS = ['a', 'e', 'i', 'o', 'u']

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ---- Misspelling generators ----

function swapAdjacent(word) {
  if (word.length < 2) return word + 'e'
  const i = Math.floor(Math.random() * (word.length - 1))
  const chars = word.split('')
  ;[chars[i], chars[i + 1]] = [chars[i + 1], chars[i]]
  return chars.join('')
}

function dropLetter(word) {
  if (word.length <= 2) return word + 'e'
  const i = 1 + Math.floor(Math.random() * (word.length - 2))
  return word.slice(0, i) + word.slice(i + 1)
}

function doubleLetter(word) {
  if (word.length < 2) return word + word
  const i = Math.floor(Math.random() * word.length)
  return word.slice(0, i) + word[i] + word.slice(i)
}

function vowelSwap(word) {
  for (let i = 0; i < word.length; i++) {
    if (VOWELS.includes(word[i])) {
      const others = VOWELS.filter((v) => v !== word[i])
      return word.slice(0, i) + pick(others) + word.slice(i + 1)
    }
  }
  return word + 'e'
}

const MUTATORS = [swapAdjacent, dropLetter, doubleLetter, vowelSwap]

function plausibleMisspelling(word) {
  const seen = new Set([word])
  for (let attempts = 0; attempts < 12; attempts++) {
    const fn = MUTATORS[attempts % MUTATORS.length]
    const candidate = fn(word)
    if (candidate !== word && candidate.length > 0 && !seen.has(candidate)) {
      return candidate
    }
  }
  return word + 'x'
}

function plausibleMisspellings(word, n = 3) {
  const seen = new Set([word])
  const out = []
  for (let attempts = 0; attempts < 30 && out.length < n; attempts++) {
    const fn = MUTATORS[(out.length + attempts) % MUTATORS.length]
    const candidate = fn(word)
    if (candidate !== word && candidate.length > 0 && !seen.has(candidate)) {
      out.push(candidate)
      seen.add(candidate)
    }
  }
  while (out.length < n) {
    out.push(word + String.fromCharCode(97 + out.length))
  }
  return out
}

// ---- Antonym lookup ----

function antonymOf(word) {
  for (const [a, b] of ANTONYMS) {
    if (a === word) return b
    if (b === word) return a
  }
  return null
}

// ---- 1st-2nd grade: which spelling is correct? ----

function spellChoiceQ(grade) {
  const pool = poolForGrade(grade)
  const entry = pick(pool)
  const wrongs = plausibleMisspellings(entry.word, 3)
  return {
    type: 'choice',
    question: `Which is spelled correctly?${entry.emoji ? ` ${entry.emoji}` : ''}`,
    options: shuffle([entry.word, ...wrongs]),
    answer: entry.word,
    emoji: entry.emoji || '🔤'
  }
}

// ---- 3rd-5th grade: meaning + spelling combined MC ----

function spellMeaningQ(grade) {
  const pool = poolForGrade(grade)
  const entry = pick(pool)
  const def = entry.def || 'this word'

  // Build the 4 options:
  // 1. correct word (answer)
  // 2. misspelled version of target word
  // 3 & 4. other words from this grade (preferring antonyms if available)
  const misspelled = plausibleMisspelling(entry.word)

  const others = []
  // First try a mined antonym from the vocab entry itself, then the static table.
  const minedAntonym = Array.isArray(entry.antonyms)
    ? entry.antonyms.find((a) => a && a !== entry.word)
    : null
  if (minedAntonym) others.push(minedAntonym)
  const tableAntonym = antonymOf(entry.word)
  if (tableAntonym && tableAntonym !== entry.word && !others.includes(tableAntonym)) {
    others.push(tableAntonym)
  }

  const otherCandidates = shuffle(
    pool
      .map((e) => e.word)
      .filter((w) => w !== entry.word && !others.includes(w))
  )
  while (others.length < 2 && otherCandidates.length) {
    others.push(otherCandidates.shift())
  }

  const options = shuffle([entry.word, misspelled, ...others.slice(0, 2)])

  return {
    type: 'choice',
    question: `Which word means "${def}"?`,
    options,
    answer: entry.word,
    emoji: entry.emoji || '📖'
  }
}

// ---- Per-grade routing ----

const BUILDERS = {
  '1st Grade': [spellChoiceQ],
  '2nd Grade': [spellChoiceQ],
  '3rd Grade': [spellMeaningQ],
  '4th Grade': [spellMeaningQ],
  '5th Grade': [spellMeaningQ]
}

export function generateSpellingQuestions(grade, n = 10) {
  const builders = BUILDERS[grade]
  if (!builders?.length || !WORDS[grade]?.length) return []
  const out = []
  let attempts = 0
  while (out.length < n && attempts < n * 4) {
    const fn = builders[attempts % builders.length]
    const q = fn(grade)
    attempts++
    if (out.some((prev) => prev.answer === q.answer && prev.question === q.question)) continue
    out.push(q)
  }
  return out
}

export function hasSpelling(grade) {
  // Available if either static OR mined pool has entries (mined only matters
  // after vocab has been backfilled / generated; static is always present).
  return !!BUILDERS[grade]?.length && poolForGrade(grade).length > 0
}
