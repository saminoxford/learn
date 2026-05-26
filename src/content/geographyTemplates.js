// Geography question templates. Each builder returns a single question
// object: { type: 'choice', question, options, answer, emoji }.

import {
  US_STATES,
  COUNTRIES,
  CONTINENTS,
  COMPASS,
  LANDMARKS
} from './geographyFacts.js'

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
  const candidates = shuffle(pool)
  for (const v of candidates) {
    if (seen.has(v)) continue
    out.push(v)
    seen.add(v)
    if (out.length >= n) break
  }
  return out
}

function choice(question, answer, distractors, emoji) {
  // Make sure options include the answer + 3 distinct distractors
  const ds = []
  const seen = new Set([answer])
  for (const d of distractors) {
    if (!seen.has(d)) {
      ds.push(d)
      seen.add(d)
    }
    if (ds.length >= 3) break
  }
  const options = shuffle([answer, ...ds])
  return { type: 'choice', question, options, answer, emoji }
}

// ---- State / capital templates ----
function stateCapitalQ(states) {
  const s = pick(states)
  const sameRegion = US_STATES.filter(
    (x) => x.region === s.region && x.name !== s.name
  )
  const distractors = distinctSample(
    sameRegion.length >= 3 ? sameRegion.map((x) => x.capital) : US_STATES.map((x) => x.capital),
    3,
    new Set([s.capital])
  )
  return choice(`Capital of ${s.name}?`, s.capital, distractors, '🏛️')
}

function capitalStateQ(states) {
  const s = pick(states)
  const distractors = distinctSample(
    US_STATES.map((x) => x.name).filter((n) => n !== s.name),
    3
  )
  return choice(`${s.capital} is the capital of which state?`, s.name, distractors, '🗽')
}

function regionQ(states) {
  const s = pick(states)
  const regions = ['Northeast', 'South', 'Midwest', 'West']
  const distractors = regions.filter((r) => r !== s.region)
  return choice(`Which US region is ${s.name} in?`, s.region, distractors, '🗺️')
}

// ---- Country / continent / capital templates ----
function countryContinentQ() {
  const c = pick(COUNTRIES)
  const distractors = distinctSample(CONTINENTS.filter((x) => x !== c.continent), 3)
  return choice(`Which continent is ${c.name} on?`, c.continent, distractors, '🌎')
}

function countryCapitalQ() {
  const c = pick(COUNTRIES)
  const distractors = distinctSample(
    COUNTRIES.map((x) => x.capital).filter((cap) => cap !== c.capital),
    3
  )
  return choice(`Capital of ${c.name}?`, c.capital, distractors, '🌍')
}

// ---- Continent / ocean global facts ----
function howManyContinentsQ() {
  return choice('How many continents are there?', '7', ['5', '6', '8'], '🌐')
}

function howManyOceansQ() {
  return choice('How many oceans are there?', '5', ['3', '4', '7'], '🌊')
}

function largestOceanQ() {
  return choice('Which is the largest ocean?', 'Pacific', ['Atlantic', 'Indian', 'Arctic'], '🌊')
}

function smallestOceanQ() {
  return choice('Which is the smallest ocean?', 'Arctic', ['Indian', 'Southern', 'Atlantic'], '🧊')
}

function equatorQ() {
  return choice(
    'The Equator divides Earth into which two halves?',
    'Northern/Southern',
    ['East/West', 'Inner/Outer', 'Top/Bottom'],
    '🌐'
  )
}

// ---- Compass templates ----
function compassQ() {
  const faces = Object.keys(COMPASS)
  const side = pick(['right', 'left', 'behind'])
  const facing = pick(faces)
  const ans = COMPASS[facing][side]
  const others = ['North', 'South', 'East', 'West'].filter((d) => d !== ans)
  return choice(
    `If you face ${facing}, what is ${side === 'behind' ? 'behind you' : `on your ${side}`}?`,
    ans,
    others,
    '🧭'
  )
}

// ---- Landmark templates (upper grades) ----
function landmarkQ() {
  const l = pick(LANDMARKS)
  const distractors = distinctSample(
    LANDMARKS.map((x) => x.country).filter((c) => c !== l.country),
    3
  )
  return choice(`Where is the ${l.name}?`, l.country, distractors, '🏛️')
}

// ---- Per-grade template registries ----
// 1st grade: just continents + oceans + a tiny set of well-known states
const SIMPLE_STATES = US_STATES.filter((s) =>
  ['California', 'Texas', 'New York', 'Florida', 'Mississippi', 'Hawaii', 'Alaska'].includes(s.name)
)

const g1 = [
  howManyContinentsQ,
  howManyOceansQ,
  largestOceanQ,
  smallestOceanQ,
  equatorQ,
  () => compassQ()
]

const g2 = [
  ...g1,
  () => stateCapitalQ(SIMPLE_STATES),
  () => countryContinentQ()
]

// 3rd grade: well-known states + most countries + compass
const POPULAR_STATES = US_STATES.filter((s) =>
  [
    'California', 'Texas', 'New York', 'Florida', 'Illinois', 'Pennsylvania',
    'Ohio', 'Georgia', 'Michigan', 'Massachusetts', 'Mississippi', 'Hawaii',
    'Alaska', 'Washington', 'Colorado', 'Oregon', 'Arizona', 'Tennessee',
    'North Carolina', 'Virginia'
  ].includes(s.name)
)

const g3 = [
  () => stateCapitalQ(POPULAR_STATES),
  () => capitalStateQ(POPULAR_STATES),
  () => countryContinentQ(),
  () => countryCapitalQ(),
  () => compassQ(),
  largestOceanQ,
  smallestOceanQ,
  howManyContinentsQ,
  () => regionQ(POPULAR_STATES)
]

const g4 = [
  () => stateCapitalQ(US_STATES),
  () => capitalStateQ(US_STATES),
  () => countryContinentQ(),
  () => countryCapitalQ(),
  () => compassQ(),
  () => regionQ(US_STATES),
  () => landmarkQ(),
  largestOceanQ
]

const g5 = [
  () => stateCapitalQ(US_STATES),
  () => capitalStateQ(US_STATES),
  () => countryContinentQ(),
  () => countryCapitalQ(),
  () => regionQ(US_STATES),
  () => landmarkQ(),
  () => compassQ(),
  smallestOceanQ
]

const GENERATORS = {
  '1st Grade': g1,
  '2nd Grade': g2,
  '3rd Grade': g3,
  '4th Grade': g4,
  '5th Grade': g5
}

export function generateGeographyQuestions(grade, n = 10) {
  const builders = GENERATORS[grade]
  if (!builders?.length) return []
  const out = []
  for (let i = 0; i < n; i++) {
    const fn = builders[(i + Math.floor(Math.random() * builders.length)) % builders.length]
    let q
    let tries = 0
    do {
      q = fn()
      tries++
    } while (tries < 5 && out.some((prev) => prev.question === q.question))
    out.push(q)
  }
  return out
}

export function hasGeography(grade) {
  return !!GENERATORS[grade]?.length
}
