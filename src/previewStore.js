// In-memory + localStorage backed store used when running in preview mode.
// Preview mode is enabled by the dev-only "Preview without account" button on Login.
// It lets you walk through the full UX without an auth user.

const FLAG_KEY = 'learn:preview'
const PROFILES_KEY = 'learn:preview:profiles'
const SESSIONS_KEY = 'learn:preview:sessions'

// Dad mode uses a separate key — Dad's identity (name/avatar) and accumulated
// XP persist across exit + re-enter, but stay isolated from preview profiles.
const DAD_KEY = 'learn:test:dad'
export const DAD_DEFAULTS = { id: 'dad', name: 'Dad', avatar: '👨', xp: 0 }

const DEFAULTS = [
  { name: 'Marshall', avatar: '🦅' },
  { name: 'Waylon', avatar: '🐊' }
]

const uuid = () =>
  (crypto?.randomUUID && crypto.randomUUID()) ||
  Math.random().toString(36).slice(2) + Date.now().toString(36)

export function isPreviewMode() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(FLAG_KEY) === '1'
}

export function enablePreviewMode() {
  window.localStorage.setItem(FLAG_KEY, '1')
}

export function disablePreviewMode() {
  window.localStorage.removeItem(FLAG_KEY)
}

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function listProfiles() {
  let rows = read(PROFILES_KEY, [])
  if (rows.length === 0) {
    rows = DEFAULTS.map((d) => ({
      id: uuid(),
      name: d.name,
      avatar: d.avatar,
      xp: 0,
      created_at: new Date().toISOString()
    }))
    write(PROFILES_KEY, rows)
  }
  return rows
}

export function getDadProfile() {
  const saved = read(DAD_KEY, null)
  return { ...DAD_DEFAULTS, ...(saved || {}) }
}

function saveDadProfile(patch) {
  const current = read(DAD_KEY, {})
  const next = { ...current, ...patch }
  write(DAD_KEY, next)
  return { ...DAD_DEFAULTS, ...next }
}

export function updateProfile(id, patch) {
  if (id === DAD_DEFAULTS.id) {
    return saveDadProfile(patch)
  }
  const rows = read(PROFILES_KEY, []).map((p) =>
    p.id === id ? { ...p, ...patch } : p
  )
  write(PROFILES_KEY, rows)
  return rows.find((p) => p.id === id)
}

export function recordSession({ user_id, subject, grade, score, total }) {
  const rows = read(SESSIONS_KEY, [])
  const row = {
    id: uuid(),
    user_id,
    subject,
    grade,
    score,
    total,
    created_at: new Date().toISOString()
  }
  rows.unshift(row)
  write(SESSIONS_KEY, rows)
  return row
}

export function listSessions(profileId) {
  return read(SESSIONS_KEY, []).filter((s) => s.user_id === profileId)
}

export function resetPreview() {
  window.localStorage.removeItem(PROFILES_KEY)
  window.localStorage.removeItem(SESSIONS_KEY)
  window.localStorage.removeItem(FLAG_KEY)
}
