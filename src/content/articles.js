// Fetch an article the active profile hasn't read yet, at their reading level.
// Falls back to a random article at that level if everything's been read.

import { supabase } from '../supabase.js'

export async function fetchNextArticle(profileId, readingLevel) {
  // Read IDs the kid has already seen
  const { data: seenRows, error: seenErr } = await supabase
    .from('sessions')
    .select('article_id')
    .eq('user_id', profileId)
    .not('article_id', 'is', null)
  if (seenErr) throw seenErr

  const seenIds = new Set((seenRows || []).map((r) => r.article_id))

  // Pull every article at this reading level (low volume — fine to filter client-side)
  const { data: all, error: allErr } = await supabase
    .from('articles')
    .select('*')
    .eq('reading_level', readingLevel)
    .order('created_at', { ascending: false })
  if (allErr) throw allErr

  if (!all?.length) return null

  // Prefer unread; if exhausted, allow any
  const unread = all.filter((a) => !seenIds.has(a.id))
  const pool = unread.length > 0 ? unread : all
  return pool[Math.floor(Math.random() * pool.length)]
}
