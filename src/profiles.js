// Single source of truth for how user accounts map to kid profiles.
//
// HOW TO ADD A NEW KID:
//   1. Create the user in Supabase → Authentication → Users.
//      Pick an email where the part before "@" is the kid's first name.
//      Example: dawson@stubbs.app → profile named "Dawson"
//   2. That's it. On first login a single profile is auto-created for
//      them, and they go straight to Home. No code change required.
//
// HOW TO GIVE A KID A SPECIFIC AVATAR EMOJI:
//   Add to AVATAR_OVERRIDES below. Otherwise they get the fallback 🙂.
//   You can change this any time — the avatar is re-applied on every
//   render so no DB update needed.
//
// HOW TO MAKE A USER AN ADMIN (full picker, Dad mode, sees all profiles):
//   In Supabase SQL editor, run:
//     update auth.users
//     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
//                           || '{"is_admin": true}'::jsonb
//     where email = 'their@email.com';
//   They must log out and back in for the flag to take effect.

const AVATAR_OVERRIDES = {
  Marshall: '🦅',
  Waylon: '🐊'
}

const FALLBACK_AVATAR = '🙂'

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

function profileForEmail(email) {
  const name = nameFromEmail(email)
  if (!name) return null
  return {
    name,
    avatar: AVATAR_OVERRIDES[name] ?? FALLBACK_AVATAR
  }
}

function applyAvatarOverride(row) {
  return {
    ...row,
    avatar: AVATAR_OVERRIDES[row.name] ?? row.avatar ?? FALLBACK_AVATAR
  }
}

// Profiles to insert on first login for an account that has none yet.
export function expectedProfilesForEmail(email, isAdmin) {
  if (isAdmin) return ADMIN_DEFAULT_PROFILES
  const p = profileForEmail(email)
  return p ? [p] : []
}

// Profiles to show the logged-in user from the rows we fetched.
// Admins see everything; kids only see the row matching their email.
export function visibleProfilesForEmail(email, allProfiles, isAdmin) {
  if (isAdmin) return allProfiles.map(applyAvatarOverride)
  const p = profileForEmail(email)
  if (!p) return []
  return allProfiles
    .filter((row) => row.name === p.name)
    .map((row) => ({ ...row, avatar: p.avatar }))
}
