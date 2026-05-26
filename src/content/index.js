// Central entry point for the screens layer to consume questions.
// Owns the dispatch from (subject, grade) to the right generator,
// and the anti-repeat windowing.

import { generateMathQuestions, hasMath } from './mathGenerators.js'
import { generateGeographyQuestions, hasGeography } from './geographyTemplates.js'
import { generateScienceQuestions, hasScience } from './science.js'
import { generateSpellingQuestions, hasSpelling } from './spellingGenerators.js'
import { generateReadingQuestions, hasReading } from './readingGenerators.js'
import { generateLifeSkillsQuestions, hasLifeSkills } from './lifeSkills.js'
import { generateRandomQuestions, hasRandom } from './randomMixed.js'
import { pickWithRecentMemory } from './recent.js'

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
  return pickWithRecentMemory(profileId, subject, grade, oversample, n)
}

export function hasContent(subject, grade) {
  const fn = HAS[subject]
  return fn ? fn(grade) : false
}

export const SUBJECTS_AVAILABLE = Object.keys(GENERATE)
