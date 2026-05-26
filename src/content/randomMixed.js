// Random subject: draws questions from all the other subjects at the
// chosen grade and mixes them, so the kid never knows what's next.
// Stays out of `content/index.js` to avoid a circular import — directly
// imports the per-subject generators.

import { generateMathQuestions, hasMath } from './mathGenerators.js'
import { generateGeographyQuestions, hasGeography } from './geographyTemplates.js'
import { generateScienceQuestions, hasScience } from './science.js'
import { generateSpellingQuestions, hasSpelling } from './spellingGenerators.js'
import { generateReadingQuestions, hasReading } from './readingGenerators.js'
import { generateLifeSkillsQuestions, hasLifeSkills } from './lifeSkills.js'

const POOLS = [
  { name: 'Math', gen: generateMathQuestions, has: hasMath },
  { name: 'Science', gen: generateScienceQuestions, has: hasScience },
  { name: 'Geography', gen: generateGeographyQuestions, has: hasGeography },
  { name: 'Spelling', gen: generateSpellingQuestions, has: hasSpelling },
  { name: 'Reading', gen: generateReadingQuestions, has: hasReading },
  { name: 'Life Skills', gen: generateLifeSkillsQuestions, has: hasLifeSkills }
]

function shuffle(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function generateRandomQuestions(grade, n = 10) {
  const eligible = POOLS.filter((p) => p.has(grade))
  if (!eligible.length) return []
  // Oversample from each subject so the final shuffle has variety even if
  // any one subject's pool is small at this grade.
  const perSubject = Math.max(2, Math.ceil(n / eligible.length) + 1)
  const all = []
  for (const p of eligible) {
    const qs = p.gen(grade, perSubject)
    for (const q of qs) {
      all.push({ ...q, sourceSubject: p.name })
    }
  }
  return shuffle(all).slice(0, n)
}

export function hasRandom(grade) {
  return POOLS.some((p) => p.has(grade))
}
