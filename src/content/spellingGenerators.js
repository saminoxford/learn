// Spelling question generators.
//
// 1st–2nd grade: multiple choice "Which is spelled correctly?" with
// the correct word + 3 plausible misspellings produced by mutating
// the word (swap adjacent letters, drop a letter, double a letter,
// swap a vowel).
//
// 3rd–5th grade: typed fill-in. "Type the word that means {def}" or
// the cloze "Type the word: {sentence}". Answer comparison is
// case-insensitive and trimmed but otherwise strict (that's the
// point of a spelling quiz).

import { WORDS } from './wordlists.js'

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
  const i = 1 + Math.floor(Math.random() * (word.length - 2)) // not first or last
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

function plausibleMisspellings(word, n = 3) {
  const seen = new Set([word])
  const out = []
  let attempts = 0
  while (out.length < n && attempts < 30) {
    const fn = MUTATORS[(out.length + attempts) % MUTATORS.length]
    const candidate = fn(word)
    if (candidate !== word && candidate.length > 0 && !seen.has(candidate)) {
      out.push(candidate)
      seen.add(candidate)
    }
    attempts++
  }
  // Final fallback: pad with simple variants
  while (out.length < n) {
    out.push(word + String.fromCharCode(97 + out.length))
  }
  return out
}

// ---- Choice format (1st–2nd) ----

function spellChoiceQ(grade) {
  const entry = pick(WORDS[grade])
  const wrongs = plausibleMisspellings(entry.word, 3)
  return {
    type: 'choice',
    question: 'Which is spelled correctly?',
    options: shuffle([entry.word, ...wrongs]),
    answer: entry.word,
    emoji: '🔤'
  }
}

// ---- Fill format (3rd–5th) ----

function spellFillByDefinitionQ(grade) {
  const candidates = WORDS[grade].filter((e) => e.def)
  if (!candidates.length) return spellFillBySentenceQ(grade)
  const entry = pick(candidates)
  return {
    type: 'fill',
    question: `Spell the word that means: "${entry.def}"`,
    answer: entry.word,
    hint: `${entry.word.length} letters`,
    emoji: '✍️'
  }
}

function spellFillBySentenceQ(grade) {
  const candidates = WORDS[grade].filter((e) => e.sentence)
  if (!candidates.length) return spellFillByDefinitionQ(grade)
  const entry = pick(candidates)
  return {
    type: 'fill',
    question: `Type the word that fits: ${entry.sentence.replace('___', '___')}`,
    answer: entry.word,
    hint: `${entry.word.length} letters`,
    emoji: '📝'
  }
}

// ---- Per-grade routing ----

const BUILDERS = {
  '1st Grade': [spellChoiceQ],
  '2nd Grade': [spellChoiceQ],
  '3rd Grade': [spellFillByDefinitionQ, spellFillBySentenceQ, spellChoiceQ],
  '4th Grade': [spellFillByDefinitionQ, spellFillBySentenceQ],
  '5th Grade': [spellFillByDefinitionQ, spellFillBySentenceQ]
}

export function generateSpellingQuestions(grade, n = 10) {
  const builders = BUILDERS[grade]
  if (!builders?.length || !WORDS[grade]?.length) return []
  const out = []
  for (let i = 0; i < n; i++) {
    const fn = builders[i % builders.length]
    let q
    let tries = 0
    do {
      q = fn(grade)
      tries++
    } while (
      tries < 5 &&
      out.some((prev) => prev.answer === q.answer && prev.question === q.question)
    )
    out.push(q)
  }
  return out
}

export function hasSpelling(grade) {
  return !!BUILDERS[grade]?.length && !!WORDS[grade]?.length
}
