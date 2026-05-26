// Reading & Vocabulary question generators. All multiple-choice.
//
// Templates: "What does X mean?", "Which word means Y?",
// synonym/antonym, and cloze (fill the blank with multiple choice).

import { WORDS, SYNONYMS, ANTONYMS } from './wordlists.js'
import { getMinedForGrade, mergeWordlists } from './minedVocab.js'

function poolForGrade(grade) {
  const staticEntries = WORDS[grade] || []
  const mined = getMinedForGrade(grade)
  return mergeWordlists(staticEntries, mined)
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function distinctSample(pool, n, exclude = new Set()) {
  const out = []
  const seen = new Set([...exclude])
  for (const v of shuffle(pool)) {
    if (seen.has(v)) continue
    out.push(v)
    seen.add(v)
    if (out.length >= n) break
  }
  return out
}

function choice(question, answer, distractors, emoji) {
  const ds = []
  const seen = new Set([answer])
  for (const d of distractors) {
    if (!seen.has(d)) {
      ds.push(d)
      seen.add(d)
    }
    if (ds.length >= 3) break
  }
  return { type: 'choice', question, options: shuffle([answer, ...ds]), answer, emoji }
}

function definitionMeaningQ(grade) {
  const candidates = poolForGrade(grade).filter((e) => e.def)
  if (!candidates.length) return null
  const entry = pick(candidates)
  const distractors = distinctSample(
    candidates.map((e) => e.def).filter((d) => d !== entry.def),
    3
  )
  return choice(`What does "${entry.word}" mean?`, entry.def, distractors, entry.emoji || '📖')
}

function reverseDefinitionQ(grade) {
  const candidates = poolForGrade(grade).filter((e) => e.def)
  if (!candidates.length) return null
  const entry = pick(candidates)
  const distractors = distinctSample(
    candidates.map((e) => e.word).filter((w) => w !== entry.word),
    3
  )
  return choice(`Which word means "${entry.def}"?`, entry.word, distractors, entry.emoji || '🔍')
}

function clozeQ(grade) {
  // Cloze only works for entries with a sentence — currently only the static
  // wordlists provide one. Mined vocab can extend later.
  const candidates = poolForGrade(grade).filter((e) => e.sentence)
  if (!candidates.length) return null
  const entry = pick(candidates)
  const distractors = distinctSample(
    candidates.map((e) => e.word).filter((w) => w !== entry.word),
    3
  )
  return choice(
    `Fill the blank: "${entry.sentence}"`,
    entry.word,
    distractors,
    entry.emoji || '✏️'
  )
}

function synonymQ() {
  const pair = pick(SYNONYMS)
  const word = pair[0]
  const synonym = pair[1]
  const allWords = [...SYNONYMS.flat(), ...ANTONYMS.flat()]
  const distractors = distinctSample(
    allWords.filter((w) => w !== word && w !== synonym),
    3
  )
  return choice(`Which word means the SAME as "${word}"?`, synonym, distractors, '🔄')
}

function antonymQ() {
  const pair = pick(ANTONYMS)
  const word = pair[0]
  const antonym = pair[1]
  const allWords = [...SYNONYMS.flat(), ...ANTONYMS.flat()]
  const distractors = distinctSample(
    allWords.filter((w) => w !== word && w !== antonym),
    3
  )
  return choice(`Which word means the OPPOSITE of "${word}"?`, antonym, distractors, '↔️')
}

const BUILDERS = {
  '1st Grade': [definitionMeaningQ, clozeQ],
  '2nd Grade': [definitionMeaningQ, reverseDefinitionQ, clozeQ, synonymQ, antonymQ],
  '3rd Grade': [definitionMeaningQ, reverseDefinitionQ, clozeQ, synonymQ, antonymQ],
  '4th Grade': [definitionMeaningQ, reverseDefinitionQ, clozeQ, synonymQ, antonymQ],
  '5th Grade': [definitionMeaningQ, reverseDefinitionQ, clozeQ, synonymQ, antonymQ]
}

export function generateReadingQuestions(grade, n = 10) {
  const builders = BUILDERS[grade]
  if (!builders?.length || !WORDS[grade]?.length) return []
  const out = []
  let i = 0
  let attempts = 0
  while (out.length < n && attempts < n * 4) {
    const fn = builders[i % builders.length]
    const q = fn(grade)
    attempts++
    if (!q) {
      i++
      continue
    }
    if (out.some((prev) => prev.question === q.question)) {
      i++
      continue
    }
    out.push(q)
    i++
  }
  return out
}

export function hasReading(grade) {
  return !!BUILDERS[grade]?.length && poolForGrade(grade).length > 0
}

// Coverage pool: distinct questions reachable from the static WORDS table,
// times the number of builders registered for this grade (one builder ≈
// one distinct question per word). Mined vocab is excluded — see spelling.
export function readingPoolSize(grade) {
  const n = (WORDS[grade] || []).length
  const builders = BUILDERS[grade]?.length || 0
  return n * builders
}
