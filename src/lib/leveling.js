// Tiered cumulative XP → level mapping.
//
// Each tier costs more XP per level than the last, so early levels feel
// quick and motivating, late levels feel earned (Xbox / Fortnite-style).
//
//   Tier         XP per level   Cumulative at top of tier
//   ----------   ------------   -------------------------
//   1  -> 10        100                  1,000
//   11 -> 25        200                  4,000
//   26 -> 50        400                 14,000
//   51 -> 100       800                 54,000
//   101+         1,500                  —
//
// xp = 1900 → level 14    (was 19 under flat /100)
// xp =  500 → level 6
// xp =    0 → level 1

const TIERS = [
  { fromLevel: 1, perLevel: 100, count: 10 }, // levels 1-10
  { fromLevel: 11, perLevel: 200, count: 15 }, // levels 11-25
  { fromLevel: 26, perLevel: 400, count: 25 }, // levels 26-50
  { fromLevel: 51, perLevel: 800, count: 50 }, // levels 51-100
  { fromLevel: 101, perLevel: 1500, count: Infinity } // 101+
]

// Returns the current level (1-indexed) given a total XP.
export function xpToLevel(xp) {
  let remaining = Math.max(0, Math.floor(xp))
  let level = 1
  for (const tier of TIERS) {
    const tierCapacity =
      tier.count === Infinity ? Infinity : tier.perLevel * tier.count
    if (remaining < tierCapacity) {
      level += Math.floor(remaining / tier.perLevel)
      return level
    }
    remaining -= tierCapacity
    level += tier.count
  }
  return level
}

// Returns { inLevel, perLevel } — how much XP the player has accumulated
// within the current level, and the size of that level. Useful for the
// progress bar.
export function progressInLevel(xp) {
  let remaining = Math.max(0, Math.floor(xp))
  for (const tier of TIERS) {
    const tierCapacity =
      tier.count === Infinity ? Infinity : tier.perLevel * tier.count
    if (remaining < tierCapacity) {
      return { inLevel: remaining % tier.perLevel, perLevel: tier.perLevel }
    }
    remaining -= tierCapacity
  }
  return { inLevel: 0, perLevel: 1500 }
}
