// Supabase Edge Function: generate-articles
//
// Three modes:
//   Default (POST without args): generate ~10 fresh "Did You Know?"
//     articles via Claude Haiku and insert into the `articles` table.
//   Vocab backfill (POST ?backfill=true): for each article whose
//     `vocab` column is still empty, call Claude with the existing
//     body to extract 3-5 vocabulary words and update the row.
//   Tags backfill (POST ?backfill_tags=true): for each article whose
//     `tags` is empty/null, derive 2-3 lowercase topic tags from the
//     body and update the row.
//
// Tolerates a missing ANTHROPIC_API_KEY — logs and no-ops so the app
// keeps working off the seed content.

// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5'
const ARTICLES_PER_LEVEL = 2

const TOPICS = [
  'animals', 'space', 'dinosaurs', 'oceans', 'weather', 'inventions',
  'world records', 'human body', 'plants', 'history', 'sports', 'food',
  'mountains', 'caves', 'volcanoes', 'mythology', 'art', 'music'
]

const READING_LEVEL_PROMPTS: Record<number, string> = {
  1: 'simple 1st-grade reading level. Short sentences (5-8 words). Common everyday words only. ~120 words total. Tone: playful and surprising.',
  2: '2nd-grade reading level. Short clear sentences (8-12 words). Familiar words. ~180 words total. Tone: curious and fun.',
  3: '3rd-grade reading level. Mix of short and medium sentences. Some new vocabulary explained in context. ~250 words total. Tone: friendly, slightly conversational.',
  4: '4th-grade reading level. Varied sentence length. Some abstract concepts. ~320 words total. Tone: engaging, like a Discovery Channel narrator.',
  5: '5th-grade reading level. Longer sentences allowed. More complex concepts and vocabulary. ~400 words total. Tone: thoughtful and a little dramatic.'
}

function buildArticlePrompt(readingLevel: number, topic: string) {
  return `Write a short "Did You Know?" article for kids at a ${READING_LEVEL_PROMPTS[readingLevel]}

Topic: ${topic}

Pick ONE fascinating, surprising, age-appropriate fact about ${topic} that most kids would not know. Write 3-4 paragraphs separated by blank lines. Then write exactly 2 multiple-choice comprehension questions about the article. Then extract 3-5 vocabulary words from the article body. Then provide 2-3 short topic tags. Each question must have exactly 4 options and one correct answer.

Vocabulary rules:
- Choose MEANINGFUL nouns, verbs, or adjectives that appear in the article body.
- Skip stopwords: the, a, an, is, are, was, were, be, of, to, in, and, or, but, with, on, for, at, by, from, as, that, this, it, he, she, they, we, you.
- Prefer words that build the kid's vocabulary — interesting words tied to the topic, not common kid words.
- For each word, give: lowercase form, kid-friendly definition, part of speech ("noun"|"verb"|"adjective"), a single best-fit emoji (use "📖" if nothing obvious), and an optional antonyms array (1-2 opposite words, or empty array).

Tag rules:
- 2-3 lowercase single-word tags. First MUST be "${topic}". Others are specific subtopics from the article body (e.g. "mars", "rovers", "bees", "honey").
- No spaces, no punctuation, no duplicates.

Output STRICT JSON with no preamble or markdown fences:
{
  "title": "Short hook-y title (under 70 chars)",
  "body": "3-4 paragraphs separated by blank lines",
  "topic": "${topic}",
  "tags": ["${topic}", "subtopic1", "subtopic2"],
  "questions": [
    { "question": "...?", "options": ["A", "B", "C", "D"], "answer": "B" },
    { "question": "...?", "options": ["A", "B", "C", "D"], "answer": "A" }
  ],
  "vocab": [
    { "word": "fossil", "definition": "the preserved remains of something that lived long ago", "pos": "noun", "emoji": "🦴", "antonyms": [] },
    { "word": "ancient", "definition": "very old", "pos": "adjective", "emoji": "🏛️", "antonyms": ["modern", "new"] }
  ]
}

Rules:
- Family-friendly only. No violence, scary content, politics, religion.
- Facts must be true and verifiable.
- Each "answer" string must appear EXACTLY in the matching "options" array.`
}

function buildTagsBackfillPrompt(title: string, body: string, topic: string) {
  return `Given this kids' "Did You Know?" article, produce 2-3 short topic tags.

TITLE: ${title}
TOPIC: ${topic}
ARTICLE:
${body}

Tag rules:
- 2-3 lowercase single-word tags. First MUST be "${topic}". Others are specific subtopics from the body (e.g. "mars", "rovers", "bees", "honey", "ancient").
- No spaces, no punctuation, no duplicates.

Output STRICT JSON, nothing else:
{ "tags": ["${topic}", "subtopic1", "subtopic2"] }`
}

function buildBackfillPrompt(body: string, readingLevel: number) {
  return `Given this kids' "Did You Know?" article at a ${READING_LEVEL_PROMPTS[readingLevel]}, extract 3-5 vocabulary words that build a kid's vocabulary.

ARTICLE:
${body}

Vocabulary rules:
- Choose MEANINGFUL nouns, verbs, or adjectives that appear in the article body.
- Skip stopwords: the, a, an, is, are, was, were, be, of, to, in, and, or, but, with, on, for, at, by, from, as, that, this, it, he, she, they, we, you.
- Prefer words that build vocabulary — interesting words tied to the topic, not common kid words.
- For each word: lowercase form, kid-friendly definition, part of speech ("noun"|"verb"|"adjective"), a single best-fit emoji (use "📖" if nothing obvious), optional antonyms array.

Output STRICT JSON, nothing else:
{
  "vocab": [
    { "word": "fossil", "definition": "the preserved remains of something that lived long ago", "pos": "noun", "emoji": "🦴", "antonyms": [] }
  ]
}`
}

async function callClaude(apiKey: string, prompt: string, maxTokens = 1500) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = await res.json() as any
  const text = data?.content?.[0]?.text
  if (!text) throw new Error('No text in Anthropic response')

  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(clean)
}

function isValidVocab(vocab: unknown): vocab is any[] {
  if (!Array.isArray(vocab)) return false
  return vocab.every(
    (v) =>
      v &&
      typeof v === 'object' &&
      typeof v.word === 'string' &&
      typeof v.definition === 'string' &&
      typeof v.pos === 'string' &&
      ['noun', 'verb', 'adjective'].includes(v.pos) &&
      typeof v.emoji === 'string'
  )
}

// Tags must be 2-5 short single-word lowercase strings, deduped. The caller
// passes the article's topic so we can guarantee it appears as tags[0].
function normalizeTags(raw: unknown, topic: string): string[] {
  const fallback = [topic.toLowerCase()]
  if (!Array.isArray(raw)) return fallback
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of raw) {
    if (typeof t !== 'string') continue
    const norm = t.toLowerCase().trim()
    if (!norm || norm.length > 24) continue
    if (/[\s\W]/.test(norm)) continue // single-word only
    if (seen.has(norm)) continue
    seen.add(norm)
    out.push(norm)
    if (out.length >= 5) break
  }
  if (out.length === 0) return fallback
  // Guarantee topic-first.
  const topicNorm = topic.toLowerCase().trim()
  if (out[0] !== topicNorm) {
    const i = out.indexOf(topicNorm)
    if (i > 0) out.splice(i, 1)
    out.unshift(topicNorm)
  }
  return out.slice(0, 5)
}

function validateArticle(parsed: any) {
  if (!parsed.title || !parsed.body || !Array.isArray(parsed.questions)) {
    throw new Error('Generated article missing required fields')
  }
  for (const q of parsed.questions) {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.answer) {
      throw new Error('Generated question has wrong shape')
    }
    if (!q.options.includes(q.answer)) {
      throw new Error(`Answer "${q.answer}" not in options ${JSON.stringify(q.options)}`)
    }
  }
  // Vocab is best-effort — if invalid, drop it and continue
  if (!isValidVocab(parsed.vocab)) {
    parsed.vocab = []
  }
}

function pickTopic(): string {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)]
}

// ---- Mode: generate new articles ----

async function generateMode(apiKey: string, supabase: any) {
  const results: { level: number; ok: boolean; error?: string; title?: string }[] = []

  for (let level = 1; level <= 5; level++) {
    for (let i = 0; i < ARTICLES_PER_LEVEL; i++) {
      const topic = pickTopic()
      try {
        const article = await callClaude(apiKey, buildArticlePrompt(level, topic))
        validateArticle(article)
        const articleTopic = article.topic || topic
        const { error } = await supabase.from('articles').insert({
          reading_level: level,
          title: article.title,
          body: article.body,
          questions: article.questions,
          vocab: article.vocab || [],
          topic: articleTopic,
          source: 'claude-api',
          tags: normalizeTags(article.tags, articleTopic)
        })
        if (error) throw error
        results.push({ level, ok: true, title: article.title })
        console.log(`✓ level ${level} topic ${topic}: "${article.title}" (${article.vocab?.length || 0} vocab)`)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        results.push({ level, ok: false, error: msg })
        console.error(`✗ level ${level} topic ${topic}: ${msg}`)
      }
    }
  }

  return {
    ok: true,
    mode: 'generate',
    generated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results
  }
}

// ---- Mode: backfill vocab for existing articles ----

async function backfillMode(apiKey: string, supabase: any) {
  const { data: rows, error } = await supabase
    .from('articles')
    .select('id, body, reading_level, title')
    .eq('vocab', '[]')
    .order('created_at', { ascending: true })
  if (error) throw error

  const targets = rows || []
  console.log(`Backfill: ${targets.length} articles missing vocab`)

  const results: { id: string; ok: boolean; error?: string; words?: number }[] = []
  for (const row of targets) {
    try {
      const parsed = await callClaude(apiKey, buildBackfillPrompt(row.body, row.reading_level), 800)
      const vocab = parsed?.vocab
      if (!isValidVocab(vocab) || vocab.length === 0) {
        throw new Error('Invalid or empty vocab returned')
      }
      const { error: upErr } = await supabase
        .from('articles')
        .update({ vocab })
        .eq('id', row.id)
      if (upErr) throw upErr
      results.push({ id: row.id, ok: true, words: vocab.length })
      console.log(`✓ backfilled ${row.id} ("${row.title}"): ${vocab.length} words`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({ id: row.id, ok: false, error: msg })
      console.error(`✗ backfill failed ${row.id}: ${msg}`)
    }
  }

  return {
    ok: true,
    mode: 'backfill',
    updated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    totalCandidates: targets.length,
    results
  }
}

// ---- Mode: backfill tags for existing articles ----

async function backfillTagsMode(apiKey: string, supabase: any) {
  // Rows with empty or null tags — Postgres returns text[] as JS array,
  // so we match on `cs.{}` (empty) and is.null. Two queries keep the
  // PostgREST filter readable.
  const { data: emptyRows, error: emptyErr } = await supabase
    .from('articles')
    .select('id, title, body, topic')
    .eq('tags', '{}')
  if (emptyErr) throw emptyErr

  const { data: nullRows, error: nullErr } = await supabase
    .from('articles')
    .select('id, title, body, topic')
    .is('tags', null)
  if (nullErr) throw nullErr

  const targets = [...(emptyRows || []), ...(nullRows || [])]
  console.log(`Tags backfill: ${targets.length} articles missing tags`)

  const results: { id: string; ok: boolean; error?: string; tags?: string[] }[] = []
  for (const row of targets) {
    try {
      const parsed = await callClaude(
        apiKey,
        buildTagsBackfillPrompt(row.title, row.body, row.topic || ''),
        300
      )
      const tags = normalizeTags(parsed?.tags, row.topic || '')
      if (tags.length === 0) throw new Error('No valid tags produced')
      const { error: upErr } = await supabase
        .from('articles')
        .update({ tags })
        .eq('id', row.id)
      if (upErr) throw upErr
      results.push({ id: row.id, ok: true, tags })
      console.log(`✓ tags ${row.id} ("${row.title}"): ${tags.join(', ')}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      results.push({ id: row.id, ok: false, error: msg })
      console.error(`✗ tags failed ${row.id}: ${msg}`)
    }
  }

  return {
    ok: true,
    mode: 'backfill_tags',
    updated: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    totalCandidates: targets.length,
    results
  }
}

Deno.serve(async (req) => {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!apiKey) {
    console.log('ANTHROPIC_API_KEY not set — no-op')
    return new Response(JSON.stringify({ ok: true, skipped: 'no api key' }), {
      headers: { 'content-type': 'application/json' }
    })
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Missing Supabase env vars' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const url = new URL(req.url)
  const isBackfill = url.searchParams.get('backfill') === 'true'
  const isBackfillTags = url.searchParams.get('backfill_tags') === 'true'

  try {
    let result
    if (isBackfillTags) {
      result = await backfillTagsMode(apiKey, supabase)
    } else if (isBackfill) {
      result = await backfillMode(apiKey, supabase)
    } else {
      result = await generateMode(apiKey, supabase)
    }
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' }
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
})
