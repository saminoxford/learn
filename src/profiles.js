// Single source of truth for which auth emails map to which kid profile.
// Used by App.jsx (to derive isKidAccount) and ProfileSelect.jsx (to auto-create
// and auto-select). Add new kids here.

export const EMAIL_TO_PROFILE = {
  'marshall@stubbs.app': { name: 'Marshall', avatar: '🦅' },
  'waylon@stubbs.app': { name: 'Waylon', avatar: '🐊' }
}

export const DEFAULT_PROFILES = [
  { name: 'Marshall', avatar: '🦅' },
  { name: 'Waylon', avatar: '🐊' }
]

export function lookupProfileByEmail(email) {
  return EMAIL_TO_PROFILE[(email || '').toLowerCase()] ?? null
}

export function isKidEmail(email) {
  return lookupProfileByEmail(email) !== null
}

export function expectedProfilesForEmail(email) {
  const match = lookupProfileByEmail(email)
  return match ? [match] : DEFAULT_PROFILES
}

export function visibleProfilesForEmail(email, allProfiles) {
  const match = lookupProfileByEmail(email)
  if (!match) return allProfiles
  return allProfiles.filter((p) => p.name === match.name)
}
