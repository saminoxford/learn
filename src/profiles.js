// Single source of truth for how user accounts map to kid profiles.
//
// HOW TO ADD A NEW KID:
//   1. Create the user in Supabase → Authentication → Users.
//      Set a "Display name" (e.g. "Marshall") — that becomes the profile name.
//      If you leave it blank, the app falls back to the email's local part.
//   2. That's it. On first login a single profile is auto-created for them
//      and they go straight to Home. They can rename themselves and pick
//      a new avatar from inside the app at any time.
//
// HOW TO MAKE A USER AN ADMIN (full picker, Dad mode, sees all profiles):
//   In Supabase SQL editor:
//     update auth.users
//     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
//                           || '{"is_admin": true}'::jsonb
//     where email = 'their@email.com';
//   They must log out and back in for the flag to take effect.

const AVATAR_OVERRIDES = {
  Marshall: '🦅',
  Waylon: '🐊'
}

export const FALLBACK_AVATAR = '🙂'

// Emoji choices shown in the in-app avatar picker.
export const AVATAR_OPTIONS = [
  '🦅', '🐊', '🐶', '🐱', '🦊', '🐼',
  '🐯', '🦁', '🐸', '🐢', '🐝', '🦋',
  '🐧', '🦉', '🐰', '🐨', '🦄', '🐲',
  '🚀', '🌟', '🎯', '⚽', '🎸', '👑'
]

// Profiles auto-created for admin accounts on first login.
const ADMIN_DEFAULT_PROFILES = [
  { name: 'Marshall', avatar: '🦅' },
  { name: 'Waylon', avatar: '🐊' }
]

function titleCase(s) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function nameFromEmail(email) {
  const local = (email || '').split('@')[0]
  return local ? titleCase(local) : null
}

export function isAdminSession(session) {
  return session?.user?.app_metadata?.is_admin === true
}

// The kid's own profile derived from their auth user, preferring fields the
// user themselves can edit (display_name, avatar in user_metadata).
function ownProfileFromSession(session) {
  if (!session?.user) return null
  const md = session.user.user_metadata || {}
  const name = (md.display_name || nameFromEmail(session.user.email) || '').trim()
  if (!name) return null
  const avatar = md.avatar || AVATAR_OVERRIDES[name] || FALLBACK_AVATAR
  return { name, avatar }
}

function applyAvatarOverride(row) {
  return {
    ...row,
    avatar: AVATAR_OVERRIDES[row.name] || row.avatar || FALLBACK_AVATAR
  }
}

// Profiles to insert when an account has no profile rows yet.
export function expectedProfilesForSession(session) {
  if (isAdminSession(session)) return ADMIN_DEFAULT_PROFILES
  const p = ownProfileFromSession(session)
  return p ? [p] : []
}

// Profiles to show the logged-in user. Admins see everything; non-admins
// see exactly one row (their own), with name + avatar pulled live from
// user_metadata so dashboard edits and in-app edits are reflected
// immediately — even if the underlying DB row is briefly stale.
export function visibleProfilesForSession(session, allProfiles) {
  if (isAdminSession(session)) return allProfiles.map(applyAvatarOverride)
  if (!allProfiles?.length) return []
  const p = ownProfileFromSession(session)
  const row = allProfiles[0]
  return [
    {
      ...row,
      name: p?.name ?? row.name,
      avatar: p?.avatar ?? row.avatar ?? FALLBACK_AVATAR
    }
  ]
}
