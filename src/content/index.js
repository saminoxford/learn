// Central entry point for the screens layer to consume questions.
// Owns the dispatch from (subject, grade) to the right generator,
// and the anti-repeat windowing.

import { generateMathQuestions, hasMath } from './mathGenerators.js'
import { generateGeographyQuestions, hasGeography, geographyPoolSize } from './geographyTemplates.js'
import { generateScienceQuestions, hasScience, sciencePoolSize } from './science.js'
import { generateSpellingQuestions, hasSpelling, spellingPoolSize } from './spellingGenerators.js'
import { generateReadingQuestions, hasReading, readingPoolSize } from './readingGenerators.js'
import { generateLifeSkillsQuestions, hasLifeSkills, lifeSkillsPoolSize } from './lifeSkills.js'
import { generateRandomQuestions, hasRandom } from './randomMixed.js'
import { pickWithFrequencyBias } from './recent.js'

// Each generator returns an array of question objects shaped like
//   { type: 'choice' | 'fill' | 'order', question, ... }
const GENERATE = {
  Math: generateMathQuestions,
  Geography: generateGeographyQuestions,
  Science: generateScienceQuestions,
  Spelling: generateSpellingQuestions,
  Reading: generateReadingQuestions,
  'Life Skills': generateLifeSkillsQuestions,
  Random: generateRandomQuestions
}

const HAS = {
  Math: hasMath,
  Geography: hasGeography,
  Science: hasScience,
  Spelling: hasSpelling,
  Reading: hasReading,
  'Life Skills': hasLifeSkills,
  Random: hasRandom
}

// Returns the next quiz's questions for this profile × subject × grade,
// preferring fresh questions over recently-seen ones. We over-generate
// (3x) so the recent-memory picker has variety to choose from.
export function getQuestions(profileId, subject, grade, n = 10) {
  const gen = GENERATE[subject]
  if (!gen) return []
  const oversample = gen(grade, n * 3)
  if (!oversample.length) return []
  return pickWithFrequencyBias(profileId, subject, grade, oversample, n)
}

export function hasContent(subject, grade) {
  const fn = HAS[subject]
  return fn ? fn(grade) : false
}

export const SUBJECTS_AVAILABLE = Object.keys(GENERATE)

// Coverage pool sizes per (subject, grade). Procedural subjects (Math,
// Random, Did You Know?) and the synthetic Review subject return null —
// those don't have a finite pool, so the UI shows them as "—".
const POOL = {
  Geography: geographyPoolSize,
  Science: sciencePoolSize,
  Spelling: spellingPoolSize,
  Reading: readingPoolSize,
  'Life Skills': lifeSkillsPoolSize
}
export function poolSize(subject, grade) {
  const fn = POOL[subject]
  return fn ? fn(grade) : null
}

// Subjects that show a coverage % bar in Progress. Order is the display order.
export const COVERAGE_SUBJECTS = ['Spelling', 'Reading', 'Science', 'Geography', 'Life Skills']
export const GRADES = ['1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade']
