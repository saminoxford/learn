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

// ---- Practical geography: place hierarchy, addresses, navigation ----
//
// These help kids understand the real-world stack a mailing address rides
// on (country → state → county → city → street → house number) and the
// vocabulary they need to ask for or give directions.

const GEO_LEVELS = ['Country', 'State', 'County', 'City', 'Street', 'Address']

const SAMPLE_ADDRESSES = [
  {
    full: '123 Maple Street, Oxford, MS 38655',
    house: '123',
    street: 'Maple Street',
    city: 'Oxford',
    state: 'MS',
    zip: '38655'
  },
  {
    full: '4500 Pine Road, Jackson, MS 39201',
    house: '4500',
    street: 'Pine Road',
    city: 'Jackson',
    state: 'MS',
    zip: '39201'
  },
  {
    full: '88 Oak Avenue, Memphis, TN 38103',
    house: '88',
    street: 'Oak Avenue',
    city: 'Memphis',
    state: 'TN',
    zip: '38103'
  }
]

// Pick a random ordered pair (bigger, smaller) from GEO_LEVELS for the
// hierarchy question. Returns nulls if the random pick somehow collides
// — the wrapper retries.
function pickHierarchyPair() {
  const i = Math.floor(Math.random() * GEO_LEVELS.length)
  let j = Math.floor(Math.random() * GEO_LEVELS.length)
  if (i === j) j = (j + 1) % GEO_LEVELS.length
  const [bigger, smaller] = i < j ? [GEO_LEVELS[i], GEO_LEVELS[j]] : [GEO_LEVELS[j], GEO_LEVELS[i]]
  return { bigger, smaller }
}

function hierarchyBiggerQ() {
  const { bigger, smaller } = pickHierarchyPair()
  const distractors = GEO_LEVELS.filter((g) => g !== bigger && g !== smaller).slice(0, 3)
  return choice(
    `Which is bigger: a ${smaller.toLowerCase()} or a ${bigger.toLowerCase()}?`,
    bigger,
    [smaller, ...distractors],
    '🗺️'
  )
}

function hierarchyContainsQ() {
  // "A city is part of a…" → State (one step up)
  const i = 1 + Math.floor(Math.random() * (GEO_LEVELS.length - 1))
  const item = GEO_LEVELS[i]
  const parent = GEO_LEVELS[i - 1]
  const distractors = GEO_LEVELS.filter((g) => g !== item && g !== parent).slice(0, 3)
  return choice(
    `A ${item.toLowerCase()} is part of a…`,
    parent,
    distractors,
    '🧭'
  )
}

function placeIsAQ() {
  // Concrete examples kids recognize, mapped to their level in the hierarchy.
  const examples = [
    { name: 'Mississippi', level: 'State' },
    { name: 'Texas', level: 'State' },
    { name: 'Lafayette', level: 'County' },
    { name: 'Oxford', level: 'City' },
    { name: 'Memphis', level: 'City' },
    { name: 'United States', level: 'Country' },
    { name: 'Mexico', level: 'Country' },
    { name: 'Maple Street', level: 'Street' }
  ]
  const ex = pick(examples)
  const distractors = GEO_LEVELS.filter((g) => g !== ex.level).slice(0, 3)
  return choice(
    `${ex.name} is a…`,
    ex.level,
    distractors,
    '📍'
  )
}

// ---- Address anatomy ----
function addressPartQ() {
  const addr = pick(SAMPLE_ADDRESSES)
  const parts = [
    { label: 'house number', value: addr.house },
    { label: 'street name', value: addr.street },
    { label: 'city', value: addr.city },
    { label: 'state', value: addr.state },
    { label: 'ZIP code', value: addr.zip }
  ]
  const target = pick(parts)
  const distractors = parts
    .filter((p) => p.value !== target.value)
    .map((p) => p.value)
  return choice(
    `In the address "${addr.full}", which part is the ${target.label}?`,
    target.value,
    distractors,
    '✉️'
  )
}

// ---- Navigation language ----
function emergencyNumberQ() {
  return choice(
    'What 3-digit number do you call for emergencies in the U.S.?',
    '911',
    ['411', '311', '811'],
    '🚨'
  )
}

function directionsOrderQ() {
  // The "biggest first / smallest last" convention people use to find a place.
  return choice(
    "If you're telling someone where you live, which order makes it easiest to find?",
    'Street, city, state',
    ['State, street, city', 'City, street, state', 'Street, state, city'],
    '🧭'
  )
}

function whyStateMattersQ() {
  return choice(
    'There are towns called "Oxford" in Mississippi AND in England. To know which one, you also need to say the…',
    'State or country',
    ['Street', 'House number', 'ZIP code'],
    '🌎'
  )
}

function whatGoesOnEnvelopeQ() {
  return choice(
    'When you mail a letter, the address on the envelope MUST include the…',
    'City, state, and ZIP code',
    ['Phone number', 'Email address', 'House color'],
    '✉️'
  )
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
  () => compassQ(),
  emergencyNumberQ,
  hierarchyBiggerQ,
  placeIsAQ
]

const g2 = [
  ...g1,
  () => stateCapitalQ(SIMPLE_STATES),
  () => countryContinentQ(),
  hierarchyContainsQ,
  addressPartQ
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
  () => regionQ(POPULAR_STATES),
  hierarchyBiggerQ,
  hierarchyContainsQ,
  placeIsAQ,
  addressPartQ,
  emergencyNumberQ,
  directionsOrderQ
]

const g4 = [
  () => stateCapitalQ(US_STATES),
  () => capitalStateQ(US_STATES),
  () => countryContinentQ(),
  () => countryCapitalQ(),
  () => compassQ(),
  () => regionQ(US_STATES),
  () => landmarkQ(),
  largestOceanQ,
  hierarchyBiggerQ,
  hierarchyContainsQ,
  placeIsAQ,
  addressPartQ,
  directionsOrderQ,
  whyStateMattersQ,
  whatGoesOnEnvelopeQ
]

const g5 = [
  () => stateCapitalQ(US_STATES),
  () => capitalStateQ(US_STATES),
  () => countryContinentQ(),
  () => countryCapitalQ(),
  () => regionQ(US_STATES),
  () => landmarkQ(),
  () => compassQ(),
  smallestOceanQ,
  hierarchyContainsQ,
  placeIsAQ,
  addressPartQ,
  directionsOrderQ,
  whyStateMattersQ,
  whatGoesOnEnvelopeQ
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

// Distinct-question pool size for the Coverage % view in Progress.
// Hand-tuned per grade — sums each builder's underlying cardinality
// (state × question-direction, country, address part, etc.). These are
// rough but stable; refine if a grade adds new builders.
const GEO_POOL = {
  '1st Grade': 6 + 4 + SIMPLE_STATES.length, // misc one-shots + compass + place-is-a samples
  '2nd Grade': 6 + 4 + SIMPLE_STATES.length * 2 + COUNTRIES.length + 5,
  '3rd Grade':
    POPULAR_STATES.length * 2 + // stateCapitalQ + capitalStateQ
    COUNTRIES.length * 2 +      // countryContinentQ + countryCapitalQ
    POPULAR_STATES.length +     // regionQ
    12 + 5 + 4 + 8 + 15 + 1 + 1, // compass + oceans + hierarchy + placeIsA + addressPart + misc
  '4th Grade':
    US_STATES.length * 2 +
    COUNTRIES.length * 2 +
    US_STATES.length +
    LANDMARKS.length +
    12 + 1 + 15 + 5 + 8 + 15 + 3,
  '5th Grade':
    US_STATES.length * 2 +
    COUNTRIES.length * 2 +
    US_STATES.length +
    LANDMARKS.length +
    12 + 1 + 5 + 8 + 15 + 3
}
export function geographyPoolSize(grade) {
  return GEO_POOL[grade] || 0
}
