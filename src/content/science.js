// Science questions: ~30 curated per grade plus templated families that
// generate variants from scienceFacts (animal classification, planet order,
// matter states, baby-animal names).

import {
  ANIMALS,
  ANIMAL_KINDS,
  PLANETS,
  POSITION_WORDS,
  MATTER_TRANSITIONS,
  LIFE_CYCLES,
  BABY_NAMES
} from './scienceFacts.js'

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

// ---- Templated families ----

function animalKindQ() {
  const a = pick(ANIMALS)
  const distractors = distinctSample(ANIMAL_KINDS.filter((k) => k !== a.kind), 3)
  return choice(
    `Which group does a ${a.name} belong to?`,
    a.kind,
    distractors,
    '🐾'
  )
}

function planetOrderQ() {
  const p = pick(PLANETS)
  const distractors = distinctSample(PLANETS.map((x) => x.name).filter((n) => n !== p.name), 3)
  return choice(
    `Which planet is ${POSITION_WORDS[p.position]} from the Sun?`,
    p.name,
    distractors,
    '🪐'
  )
}

function matterStateQ() {
  const m = pick(MATTER_TRANSITIONS)
  const states = ['Solid', 'Liquid', 'Gas']
  return choice(
    `What state of matter is ${m.description}?`,
    m.state,
    states.filter((s) => s !== m.state),
    '🧊'
  )
}

function lifeCycleStageQ() {
  const lc = pick(LIFE_CYCLES)
  const idx = Math.floor(Math.random() * (lc.stages.length - 1))
  const current = lc.stages[idx]
  const next = lc.stages[idx + 1]
  const distractors = distinctSample(lc.stages.filter((s) => s !== next), 3)
  return choice(
    `In a ${lc.creature}'s life cycle, what comes after the ${current}?`,
    next,
    distractors,
    '🦋'
  )
}

function babyNameQ() {
  const b = pick(BABY_NAMES)
  const distractors = distinctSample(BABY_NAMES.map((x) => x.baby).filter((n) => n !== b.baby), 3)
  return choice(
    `A baby ${b.animal} is called a...`,
    b.baby,
    distractors,
    '🍼'
  )
}

// ---- Curated questions per grade ----

const curated_1 = [
  ['Plants need this to grow:', 'Sunlight', ['Soap', 'Wind', 'Salt'], '🌱'],
  ['Which is a living thing?', 'A tree', ['A rock', 'A toy', 'A spoon'], '🌳'],
  ['Which of these is a baby animal?', 'Puppy', ['Apple', 'Cloud', 'Spoon'], '🐶'],
  ['You use this to see:', 'Eyes', ['Nose', 'Mouth', 'Ears'], '👀'],
  ['You use this to hear:', 'Ears', ['Eyes', 'Mouth', 'Hands'], '👂'],
  ['Sunny, rainy, snowy — these are all kinds of...', 'Weather', ['Food', 'Colors', 'Animals'], '☀️'],
  ['What do bees make?', 'Honey', ['Milk', 'Bread', 'Cheese'], '🐝'],
  ['How many legs does a spider have?', '8', ['4', '6', '10'], '🕷️'],
  ['Where do fish live?', 'Water', ['Trees', 'Caves', 'Clouds'], '🐠'],
  ['What do plants drink?', 'Water', ['Milk', 'Juice', 'Soda'], '💧'],
  ['What season has snow?', 'Winter', ['Summer', 'Spring', 'Fall'], '❄️'],
  ['Day comes from the...', 'Sun', ['Moon', 'Stars', 'Clouds'], '☀️'],
  ['Night sky has...', 'Stars', ['Flowers', 'Cars', 'Trees'], '🌟']
]

const curated_2 = [
  ['Caterpillars turn into:', 'Butterflies', ['Bees', 'Birds', 'Bats'], '🦋'],
  ['Which is a habitat?', 'Forest', ['Pencil', 'Book', 'Cup'], '🌲'],
  ['Glass and rocks are this material:', 'Hard', ['Soft', 'Liquid', 'Gas'], '🪨'],
  ['Cotton and wool are this material:', 'Soft', ['Hard', 'Metal', 'Glass'], '🧶'],
  ['A magnet sticks to:', 'Iron', ['Wood', 'Paper', 'Plastic'], '🧲'],
  ['Birds lay these:', 'Eggs', ['Puppies', 'Kittens', 'Seeds'], '🥚'],
  ['Trees give us...', 'Wood', ['Glass', 'Metal', 'Plastic'], '🌳'],
  ['Plants grow from:', 'Seeds', ['Sand', 'Rocks', 'Air'], '🌱'],
  ['Heaviest of these: rock, feather, leaf?', 'Rock', ['Feather', 'Leaf', 'Same'], '⚖️'],
  ['Salty water is found in the:', 'Ocean', ['Bathtub', 'Lake', 'Pond'], '🌊'],
  ['Which animal lives in the desert?', 'Camel', ['Whale', 'Penguin', 'Frog'], '🐫'],
  ['Which animal lives in the cold?', 'Polar bear', ['Camel', 'Lion', 'Monkey'], '🐻‍❄️']
]

const curated_3 = [
  ['How many planets in our solar system?', '8', ['7', '9', '10'], '🪐'],
  ['Steam is water in which state?', 'Gas', ['Solid', 'Liquid', 'Frozen'], '💨'],
  ['Ice is water in which state?', 'Solid', ['Liquid', 'Gas', 'Steam'], '🧊'],
  ['The closest star to Earth is...', 'The Sun', ['The Moon', 'Polaris', 'Mars'], '☀️'],
  ['Which is NOT a mammal?', 'Snake', ['Dog', 'Whale', 'Bat'], '🐍'],
  ['Living things need this to breathe:', 'Air', ['Sand', 'Plastic', 'Glass'], '🌬️'],
  ['Plants make food using:', 'Sunlight', ['Salt', 'Wind', 'Rain only'], '🌞'],
  ['Earth orbits the:', 'Sun', ['Moon', 'Mars', 'A star far away'], '🌍'],
  ['The Moon orbits the:', 'Earth', ['Sun', 'Mars', 'Jupiter'], '🌙'],
  ['Which has the most legs?', 'Spider', ['Bird', 'Frog', 'Snake'], '🕷️'],
  ['Plants release this gas during photosynthesis:', 'Oxygen', ['Carbon Dioxide', 'Nitrogen', 'Helium'], '🌿'],
  ['Which is liquid at room temperature?', 'Water', ['Ice', 'Steam', 'Wood'], '💧']
]

const curated_4 = [
  ['Producers in a food chain are usually:', 'Plants', ['Lions', 'Sharks', 'Eagles'], '🌱'],
  ['Carnivores eat:', 'Other animals', ['Only plants', 'Rocks', 'Sand'], '🦁'],
  ['Herbivores eat:', 'Plants', ['Other animals', 'Rocks', 'Glass'], '🦌'],
  ['Heart pumps...', 'Blood', ['Air', 'Water', 'Food'], '❤️'],
  ['Lungs help you...', 'Breathe', ['Walk', 'Digest', 'See'], '🫁'],
  ['Bones make up your...', 'Skeleton', ['Skin', 'Brain', 'Heart'], '🦴'],
  ['Which is a simple machine?', 'Lever', ['Robot', 'Computer', 'Battery'], '⚙️'],
  ['Wheels and axles are a kind of:', 'Simple machine', ['Living thing', 'Mineral', 'Plant'], '🛞'],
  ['Most of Earth\'s surface is:', 'Water', ['Forest', 'Desert', 'Ice'], '🌊'],
  ['A food chain starts with:', 'The Sun', ['A predator', 'A river', 'A rock'], '☀️'],
  ['Which planet is largest?', 'Jupiter', ['Earth', 'Mars', 'Saturn'], '🪐'],
  ['Coldest planet from the Sun is usually:', 'Neptune', ['Mars', 'Venus', 'Earth'], '🥶']
]

const curated_5 = [
  ['Atoms make up...', 'Matter', ['Light only', 'Sound only', 'Time'], '⚛️'],
  ['H₂O is the formula for:', 'Water', ['Salt', 'Oxygen', 'Carbon'], '💧'],
  ['Energy from food is called:', 'Chemical energy', ['Solar energy', 'Sound energy', 'Mechanical energy'], '🍎'],
  ['Sound travels in:', 'Waves', ['Lines', 'Boxes', 'Sparks'], '🔊'],
  ['Light from the Sun reaches Earth in about:', '8 minutes', ['1 second', '1 hour', '1 day'], '☀️'],
  ['Earth\'s shape is most like a:', 'Sphere', ['Cube', 'Pyramid', 'Pancake'], '🌐'],
  ['Volcanoes erupt with:', 'Magma', ['Snow', 'Air only', 'Rain'], '🌋'],
  ['Which is a renewable energy source?', 'Wind', ['Coal', 'Oil', 'Plastic'], '💨'],
  ['Which is fossil fuel?', 'Coal', ['Wind', 'Sun', 'Water'], '⛽'],
  ['Earthquakes happen when...', 'Plates shift', ['It rains', 'Wind blows', 'Sun rises'], '🌎'],
  ['A solar eclipse happens when the...', 'Moon blocks the Sun', ['Sun blocks the Earth', 'Stars line up', 'Earth blocks the Sun'], '🌑'],
  ['Plants make their food in:', 'Leaves', ['Roots', 'Bark', 'Flowers only'], '🌿']
]

function curatedAsQuestion([question, answer, distractors, emoji], idx, grade) {
  return {
    type: 'choice',
    id: `science-${grade}-${idx}`,
    question,
    options: shuffle([answer, ...distractors]),
    answer,
    emoji
  }
}

// ---- Per-grade generators ----

const GRADE_BUILDERS = {
  '1st Grade': [
    ...curated_1.map((c, i) => () => curatedAsQuestion(c, i, '1g')),
    babyNameQ,
    animalKindQ
  ],
  '2nd Grade': [
    ...curated_2.map((c, i) => () => curatedAsQuestion(c, i, '2g')),
    babyNameQ,
    animalKindQ,
    lifeCycleStageQ
  ],
  '3rd Grade': [
    ...curated_3.map((c, i) => () => curatedAsQuestion(c, i, '3g')),
    animalKindQ,
    planetOrderQ,
    matterStateQ,
    babyNameQ
  ],
  '4th Grade': [
    ...curated_4.map((c, i) => () => curatedAsQuestion(c, i, '4g')),
    animalKindQ,
    planetOrderQ,
    lifeCycleStageQ
  ],
  '5th Grade': [
    ...curated_5.map((c, i) => () => curatedAsQuestion(c, i, '5g')),
    planetOrderQ,
    matterStateQ
  ]
}

export function generateScienceQuestions(grade, n = 10) {
  const builders = GRADE_BUILDERS[grade]
  if (!builders?.length) return []
  const out = []
  const shuffled = shuffle(builders)
  for (let i = 0; i < n; i++) {
    const fn = shuffled[i % shuffled.length]
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

export function hasScience(grade) {
  return !!GRADE_BUILDERS[grade]?.length
}

// Distinct-question pool size for the Coverage % view in Progress.
// Curated rows count exactly. Templated builders (animalKindQ etc.) are
// approximated by their underlying fact-table sizes.
const SCIENCE_POOL = {
  '1st Grade': curated_1.length + BABY_NAMES.length + ANIMALS.length,
  '2nd Grade': curated_2.length + BABY_NAMES.length + ANIMALS.length + LIFE_CYCLES.length,
  '3rd Grade': curated_3.length + ANIMALS.length + POSITION_WORDS.length + MATTER_TRANSITIONS.length + BABY_NAMES.length,
  '4th Grade': curated_4.length + ANIMALS.length + POSITION_WORDS.length + LIFE_CYCLES.length,
  '5th Grade': curated_5.length + POSITION_WORDS.length + MATTER_TRANSITIONS.length
}
export function sciencePoolSize(grade) {
  return SCIENCE_POOL[grade] || 0
}
