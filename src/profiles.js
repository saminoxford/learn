// Profile helpers.
//
// Model: every auth user has exactly one profile row in `public.profiles`
// (enforced by the unique index profiles_owner_uniq on owner_id). Whether
// you're an admin or a kid, you have your own row, your own XP, and your
// own quiz history. The is_admin flag (set in auth.users.app_metadata)
// only adds read access — admins can SELECT every profile and every
// session in the system via the admin RLS policies. Admins cannot write
// to other users' rows.
//
// HOW TO ADD A NEW KID:
//   1. Create the user in Supabase → Authentication → Users. Set "Display
//      name" to what you want their profile to be called (otherwise it
//      falls back to the email's local part, title-cased).
//   2. That's it. On first login a single profile is auto-created for
//      them and they go straight to Home.
//
// HOW TO MAKE A USER AN ADMIN:
//   In Supabase SQL editor:
//     update auth.users
//     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
//                           || '{"is_admin": true}'::jsonb
//     where email = 'their@email.com';
//   They must log out and back in for the flag to take effect.

const AVATAR_OVERRIDES = {
  Marshall: '🦅',
  Waylon: '🐊',
  Sam: '👑'
}

export const FALLBACK_AVATAR = '🙂'

export const AVATAR_OPTIONS = [
  '🦅', '🐊', '🐶', '🐱', '🦊', '🐼',
  '🐯', '🦁', '🐸', '🐢', '🐝', '🦋',
  '🐧', '🦉', '🐰', '🐨', '🦄', '🐲',
  '🚀', '🌟', '🎯', '⚽', '🎸', '👑'
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

// The profile that should be auto-created for this session if one doesn't
// already exist. Prefers user_metadata.display_name (admin-editable in
// Supabase dashboard, user-editable via auth.updateUser), falls back to
// the email's local part.
export function expectedProfileForSession(session) {
  if (!session?.user) return null
  const md = session.user.user_metadata || {}
  const name = (md.display_name || nameFromEmail(session.user.email) || '').trim()
  if (!name) return null
  const avatar = md.avatar || AVATAR_OVERRIDES[name] || FALLBACK_AVATAR
  return { name, avatar }
}

// Cosmetic-only: always render the override avatar if one exists for that
// name, so we can tweak emoji in code without DB migrations.
export function applyAvatarOverride(row) {
  return {
    ...row,
    avatar: AVATAR_OVERRIDES[row?.name] || row?.avatar || FALLBACK_AVATAR
  }
}
