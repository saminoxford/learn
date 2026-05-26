// Procedural math question generators. Each grade is an array of skill
// functions that, on call, return one question object:
//   { type: 'choice', question, options, answer, emoji }
//
// generateMathQuestions(grade, n) round-robins across the grade's skills,
// shuffling so the kid doesn't see the same skill in the same slot every time.

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function uniqueOptions(answer, candidates, n = 4) {
  const set = new Set([String(answer)])
  for (const c of candidates) {
    if (set.size >= n) break
    if (c == null) continue
    set.add(String(c))
  }
  while (set.size < n) set.add(String(rand(0, 99) + 1000)) // emergency filler
  const opts = Array.from(set)
  // Shuffle so the answer isn't always first
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts
}

// -------- 1st grade --------
const g1 = [
  () => {
    const a = rand(0, 9), b = rand(0, 9)
    const ans = a + b
    return choice(`${a} + ${b} = ?`, ans, ['🍎', '🍌', '⭐', '🐝'], [ans + 1, ans - 1, ans + 2, a * b || ans + 3])
  },
  () => {
    const a = rand(2, 10), b = rand(0, a)
    const ans = a - b
    return choice(`${a} - ${b} = ?`, ans, ['🐶', '🍪', '🖐️'], [ans + 1, ans - 1, ans + 2, a + b])
  },
  () => {
    const n = rand(2, 9)
    return choice(`What comes after ${n}?`, n + 1, ['🔢'], [n - 1, n + 2, n])
  },
  () => {
    const a = rand(1, 9), b = rand(1, 9)
    if (a === b) return choice(`Which is bigger: ${a} or ${b + 1}?`, b + 1, ['🐘'], [a, 'Same', 'Neither'])
    const bigger = Math.max(a, b)
    return choice(`Which is bigger: ${a} or ${b}?`, bigger, ['🐘'], [Math.min(a, b), 'Same', 'Neither'])
  },
  () => {
    const shapes = [
      { name: 'triangle', sides: 3 },
      { name: 'square', sides: 4 },
      { name: 'rectangle', sides: 4 },
      { name: 'pentagon', sides: 5 },
      { name: 'hexagon', sides: 6 }
    ]
    const s = pick(shapes)
    return choice(
      `How many sides does a ${s.name} have?`,
      s.sides,
      ['🔺'],
      [s.sides - 1, s.sides + 1, s.sides + 2]
    )
  },
  () => {
    const n = rand(3, 8)
    const fish = '🐟'.repeat(n)
    return choice(`Count: ${fish}`, n, ['🐟'], [n - 1, n + 1, n + 2])
  }
]

// -------- 2nd grade --------
const g2 = [
  () => {
    const a = rand(10, 50), b = rand(1, 20)
    const ans = a + b
    return choice(`${a} + ${b} = ?`, ans, ['🌟', '🎁'], [ans + 1, ans - 1, ans + 10])
  },
  () => {
    const a = rand(15, 99), b = rand(1, a - 1)
    const ans = a - b
    return choice(`${a} - ${b} = ?`, ans, ['💰', '🚀'], [ans + 1, ans - 1, ans + 10])
  },
  () => {
    const a = rand(2, 10), b = pick([2, 5, 10])
    const ans = a * b
    return choice(`${a} × ${b} = ?`, ans, ['🍇', '🐝'], [ans + b, ans - b, ans + 1])
  },
  () => {
    const evens = [2, 4, 6, 8, 10, 12, 14]
    const odds = [3, 5, 7, 9, 11, 13]
    if (Math.random() < 0.5) {
      const e = pick(evens)
      const distractors = [pick(odds), pick(odds), pick(odds)]
      return choice('Which number is even?', e, ['⚖️'], distractors)
    } else {
      const o = pick(odds)
      const distractors = [pick(evens), pick(evens), pick(evens)]
      return choice('Which number is odd?', o, ['🎲'], distractors)
    }
  },
  () => {
    const a = rand(4, 20)
    return choice(`Half of ${a * 2} is...`, a, ['🍕'], [a + 1, a - 1, a + 2])
  },
  () => {
    const facts = [
      ['How many minutes in an hour?', 60, [30, 45, 100], '⏰'],
      ['How many days in a week?', 7, [5, 6, 8], '📅'],
      ['How many months in a year?', 12, [10, 11, 13], '📆'],
      ['How many hours in a day?', 24, [12, 20, 30], '🕒']
    ]
    const [q, a, d, e] = pick(facts)
    return choice(q, a, [e], d)
  }
]

// -------- 3rd grade --------
const g3 = [
  () => {
    const a = rand(2, 12), b = rand(2, 12)
    const ans = a * b
    return choice(`${a} × ${b} = ?`, ans, ['🦄', '🦋', '🎯'], [ans + a, ans - a, ans + b])
  },
  () => {
    const b = rand(2, 12), q = rand(2, 12)
    const a = b * q
    return choice(`${a} ÷ ${b} = ?`, q, ['🧩', '🍫'], [q + 1, q - 1, q + 2])
  },
  () => {
    const a = rand(100, 500), b = rand(50, 400)
    const ans = a + b
    return choice(`${a} + ${b} = ?`, ans, ['➕', '🧮'], [ans + 10, ans - 10, ans + 100])
  },
  () => {
    const a = rand(300, 900), b = rand(50, a - 50)
    const ans = a - b
    return choice(`${a} - ${b} = ?`, ans, ['🧮'], [ans + 10, ans - 10, ans + 100])
  },
  () => {
    const n = rand(11, 99)
    const ans = Math.round(n / 10) * 10
    const d = [ans + 10, ans - 10, n]
    return choice(`Round ${n} to the nearest 10.`, ans, ['🔄'], d)
  },
  () => {
    // "Which fraction is bigger?"
    const a = pick([
      ['1/2', '1/4', '1/2'],
      ['1/3', '1/2', '1/2'],
      ['2/3', '1/3', '2/3'],
      ['3/4', '1/4', '3/4'],
      ['1/5', '1/2', '1/2'],
      ['5/8', '3/8', '5/8']
    ])
    return choice(`Which is bigger: ${a[0]} or ${a[1]}?`, a[2], ['🍰', '🍕'], ['Same', 'Neither'])
  },
  () => {
    const side = rand(3, 12)
    return choice(`Perimeter of a square with side ${side}?`, side * 4, ['⬛'], [side * 3, side * 2, side * 4 + side])
  },
  () => {
    const facts = [
      ['How many feet in a yard?', 3, [1, 10, 12], '📏'],
      ['How many inches in a foot?', 12, [10, 16, 24], '👣'],
      ['How many sides does a hexagon have?', 6, [5, 7, 8], '🐝']
    ]
    const [q, a, d, e] = pick(facts)
    return choice(q, a, [e], d)
  }
]

// -------- 4th grade --------
const g4 = [
  () => {
    const a = rand(100, 999), b = rand(100, 999)
    const ans = a + b
    return choice(`${a.toLocaleString()} + ${b.toLocaleString()} = ?`, ans.toLocaleString(), ['🧮'], [(ans + 10).toLocaleString(), (ans - 10).toLocaleString(), (ans + 100).toLocaleString()])
  },
  () => {
    const a = rand(11, 25), b = rand(11, 25)
    const ans = a * b
    return choice(`${a} × ${b} = ?`, ans, ['✖️'], [ans + 10, ans - 10, ans + a])
  },
  () => {
    const b = rand(2, 12), q = rand(8, 15)
    const a = b * q
    return choice(`${a} ÷ ${b} = ?`, q, ['🥚'], [q + 1, q - 1, q + 2])
  },
  () => {
    const len = rand(4, 15), wid = rand(3, 12)
    return choice(`Area of a ${len} × ${wid} rectangle?`, len * wid, ['🟦'], [len + wid, 2 * (len + wid), len * wid + 5])
  },
  () => {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]
    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25]
    const p = pick(primes)
    const d = [pick(composites), pick(composites), pick(composites)]
    return choice('Which number is prime?', p, ['🔢'], d)
  },
  () => {
    const denom = pick([2, 4, 5, 8, 10])
    const num = rand(1, denom - 1)
    const dec = (num / denom).toFixed(denom === 5 ? 1 : 2)
    return choice(`What is ${num}/${denom} as a decimal?`, String(dec), ['🔄'], [
      String((num / (denom + 1)).toFixed(2)),
      String((num + 1) / denom).slice(0, 4),
      String((num - 1 || 1) / denom).slice(0, 4)
    ])
  },
  () => {
    const n = rand(1000, 9999)
    const ans = Math.round(n / 100) * 100
    return choice(`Round ${n.toLocaleString()} to the nearest 100.`, ans.toLocaleString(), ['🔄'], [(ans + 100).toLocaleString(), (ans - 100).toLocaleString(), n.toLocaleString()])
  },
  () => {
    const facts = [
      ['How many degrees in a right angle?', '90°', ['45°', '180°', '360°'], '📐'],
      ['1 kilometer = ? meters', '1,000', ['100', '500', '10,000'], '📏'],
      ['1 hour = ? minutes', '60', ['30', '90', '120'], '⏰']
    ]
    const [q, a, d, e] = pick(facts)
    return choice(q, a, [e], d)
  }
]

// -------- 5th grade --------
const g5 = [
  () => {
    const x = rand(2, 12), product = x * rand(2, 12)
    return choice(`Solve: ${product / x} × x = ${product}. x = ?`, x, ['🧠'], [x + 1, x - 1, x + 2])
  },
  () => {
    const whole = rand(40, 200)
    const pct = pick([10, 20, 25, 50])
    const ans = (whole * pct) / 100
    if (!Number.isInteger(ans)) {
      // retry with cleaner numbers
      const w = pick([20, 40, 60, 80, 100])
      const p = pick([10, 25, 50])
      return choice(`What is ${p}% of ${w}?`, (w * p) / 100, ['💯'], [(w * (p + 10)) / 100, (w * (p - 5)) / 100, w / 2])
    }
    return choice(`What is ${pct}% of ${whole}?`, ans, ['💯'], [ans + 5, ans - 5, ans * 2])
  },
  () => {
    const l = rand(2, 8), w = rand(2, 8), h = rand(2, 8)
    return choice(`Volume of a ${l} × ${w} × ${h} box?`, l * w * h, ['📦'], [l + w + h, 2 * (l * w + w * h + l * h), l * w])
  },
  () => {
    const a = pick([
      ['2/3 + 1/6', '5/6'],
      ['1/2 + 1/4', '3/4'],
      ['3/4 - 1/4', '1/2'],
      ['1/3 + 1/6', '1/2'],
      ['2/5 + 1/5', '3/5'],
      ['5/8 - 1/4', '3/8']
    ])
    return choice(`${a[0]} = ?`, a[1], ['🥧'], ['1', '1/2', '2/3', '3/8'].filter((x) => x !== a[1]))
  },
  () => {
    const n = rand(2, 13)
    return choice(`${n}² = ?`, n * n, ['🔲'], [n * 2, n * n + 1, n * n - 1])
  },
  () => {
    const arr = [rand(1, 20), rand(1, 20), rand(1, 20), rand(1, 20)]
    const sum = arr.reduce((s, x) => s + x, 0)
    if (sum % 4 !== 0) {
      // tweak last value to make integer mean
      arr[3] += 4 - (sum % 4)
    }
    const mean = arr.reduce((s, x) => s + x, 0) / 4
    return choice(`Mean of ${arr.join(', ')}?`, mean, ['📊'], [mean + 1, mean - 1, mean + 2])
  },
  () => {
    const facts = [
      ['1 gallon = ? quarts', 4, [2, 3, 8], '🥛'],
      ['How many sides does an octagon have?', 8, [6, 7, 9], '🛑'],
      ['Sum of angles in a triangle?', '180°', ['90°', '270°', '360°'], '📐']
    ]
    const [q, a, d, e] = pick(facts)
    return choice(q, a, [e], d)
  }
]

function choice(question, answer, emojis, distractors) {
  return {
    type: 'choice',
    question,
    options: uniqueOptions(answer, distractors),
    answer: String(answer),
    emoji: pick(emojis)
  }
}

const GENERATORS = {
  '1st Grade': g1,
  '2nd Grade': g2,
  '3rd Grade': g3,
  '4th Grade': g4,
  '5th Grade': g5
}

export function generateMathQuestions(grade, n = 10) {
  const skills = GENERATORS[grade]
  if (!skills?.length) return []
  // Make a shuffled, repeating list so each grade contributes variety
  const out = []
  for (let i = 0; i < n; i++) {
    const fn = skills[(i + Math.floor(Math.random() * skills.length)) % skills.length]
    let q
    let attempts = 0
    do {
      q = fn()
      attempts++
    } while (
      attempts < 5 &&
      out.some((prev) => prev.question === q.question) // avoid back-to-back duplicates within the SAME quiz
    )
    out.push(q)
  }
  return out
}

export function hasMath(grade) {
  return !!GENERATORS[grade]?.length
}
