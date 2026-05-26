// Science fact tables used by the templated question families in
// scienceTemplates (see science.js).

export const ANIMALS = [
  { name: 'dog', kind: 'mammal' },
  { name: 'cat', kind: 'mammal' },
  { name: 'cow', kind: 'mammal' },
  { name: 'horse', kind: 'mammal' },
  { name: 'whale', kind: 'mammal' },
  { name: 'dolphin', kind: 'mammal' },
  { name: 'bat', kind: 'mammal' },
  { name: 'human', kind: 'mammal' },
  { name: 'elephant', kind: 'mammal' },
  { name: 'kangaroo', kind: 'mammal' },
  { name: 'lizard', kind: 'reptile' },
  { name: 'snake', kind: 'reptile' },
  { name: 'crocodile', kind: 'reptile' },
  { name: 'turtle', kind: 'reptile' },
  { name: 'iguana', kind: 'reptile' },
  { name: 'eagle', kind: 'bird' },
  { name: 'owl', kind: 'bird' },
  { name: 'penguin', kind: 'bird' },
  { name: 'flamingo', kind: 'bird' },
  { name: 'parrot', kind: 'bird' },
  { name: 'salmon', kind: 'fish' },
  { name: 'shark', kind: 'fish' },
  { name: 'goldfish', kind: 'fish' },
  { name: 'tuna', kind: 'fish' },
  { name: 'frog', kind: 'amphibian' },
  { name: 'toad', kind: 'amphibian' },
  { name: 'salamander', kind: 'amphibian' },
  { name: 'newt', kind: 'amphibian' }
]

export const ANIMAL_KINDS = ['mammal', 'reptile', 'bird', 'fish', 'amphibian']

export const PLANETS = [
  { name: 'Mercury', position: 1 },
  { name: 'Venus', position: 2 },
  { name: 'Earth', position: 3 },
  { name: 'Mars', position: 4 },
  { name: 'Jupiter', position: 5 },
  { name: 'Saturn', position: 6 },
  { name: 'Uranus', position: 7 },
  { name: 'Neptune', position: 8 }
]

export const POSITION_WORDS = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  5: '5th',
  6: '6th',
  7: '7th',
  8: '8th'
}

export const MATTER_TRANSITIONS = [
  { description: 'liquid water cooled below freezing', state: 'Solid' },
  { description: 'ice on a warm day', state: 'Liquid' },
  { description: 'water boiling in a pot', state: 'Gas' },
  { description: 'breath you can see on a cold day', state: 'Gas' },
  { description: 'a frozen lake in winter', state: 'Solid' }
]

export const LIFE_CYCLES = [
  { creature: 'butterfly', stages: ['egg', 'caterpillar', 'chrysalis', 'butterfly'] },
  { creature: 'frog', stages: ['egg', 'tadpole', 'froglet', 'frog'] },
  { creature: 'chicken', stages: ['egg', 'chick', 'pullet', 'chicken'] }
]

export const BABY_NAMES = [
  { animal: 'frog', baby: 'tadpole' },
  { animal: 'cat', baby: 'kitten' },
  { animal: 'dog', baby: 'puppy' },
  { animal: 'cow', baby: 'calf' },
  { animal: 'horse', baby: 'foal' },
  { animal: 'sheep', baby: 'lamb' },
  { animal: 'goat', baby: 'kid' },
  { animal: 'pig', baby: 'piglet' },
  { animal: 'kangaroo', baby: 'joey' },
  { animal: 'butterfly', baby: 'caterpillar' },
  { animal: 'eagle', baby: 'eaglet' },
  { animal: 'bear', baby: 'cub' }
]
