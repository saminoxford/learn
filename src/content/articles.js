// Helpers for fetching "Did You Know?" article rows.

import { supabase } from '../supabase.js'

// The next unread article at this profile's reading level. Falls back to a
// random one at the same level if everything's been read.
export async function fetchNextArticle(profileId, readingLevel) {
  const { data: seenRows, error: seenErr } = await supabase
    .from('sessions')
    .select('article_id')
    .eq('user_id', profileId)
    .not('article_id', 'is', null)
  if (seenErr) throw seenErr

  const seenIds = new Set((seenRows || []).map((r) => r.article_id))

  const { data: all, error: allErr } = await supabase
    .from('articles')
    .select('*')
    .eq('reading_level', readingLevel)
    .order('created_at', { ascending: false })
  if (allErr) throw allErr

  if (!all?.length) return null

  const unread = all.filter((a) => !seenIds.has(a.id))
  const pool = unread.length > 0 ? unread : all
  return pool[Math.floor(Math.random() * pool.length)]
}

// One article by id — used when the Home peek deep-links to a specific
// article regardless of reading-level filter.
export async function fetchArticleById(articleId) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .maybeSingle()
  if (error) throw error
  return data || null
}

// The N newest articles, for the Home "Fresh reads" peek. Returns id, title,
// reading_level, topic, created_at — lightweight columns only.
export async function fetchLatestArticles(limit = 3) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, reading_level, topic, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}
