// Supabase Edge Function: generate-articles
//
// Runs daily via pg_cron. For each reading level 1-5, generates 2 fresh
// "Did You Know?" articles using the Anthropic API (Claude Haiku) and
// inserts them into the `articles` table.
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

function buildPrompt(readingLevel: number, topic: string) {
  return `Write a short "Did You Know?" article for kids at a ${READING_LEVEL_PROMPTS[readingLevel]}

Topic: ${topic}

Pick ONE fascinating, surprising, age-appropriate fact about ${topic} that most kids would not know. Write 3-4 paragraphs separated by blank lines. Then write exactly 2 multiple-choice comprehension questions about the article. Each question must have exactly 4 options and one correct answer.

Output STRICT JSON with no preamble or markdown fences:
{
  "title": "Short hook-y title (under 70 chars)",
  "body": "3-4 paragraphs separated by blank lines",
  "topic": "${topic}",
  "questions": [
    { "question": "...?", "options": ["A", "B", "C", "D"], "answer": "B" },
    { "question": "...?", "options": ["A", "B", "C", "D"], "answer": "A" }
  ]
}

Rules:
- Family-friendly only. No violence, scary content, politics, religion.
- Facts must be true and verifiable.
- Each "answer" string must appear EXACTLY in the matching "options" array.`
}

async function generateOneArticle(apiKey: string, readingLevel: number, topic: string) {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: buildPrompt(readingLevel, topic) }]
    })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = await res.json() as any
  const text = data?.content?.[0]?.text
  if (!text) throw new Error('No text in Anthropic response')

  // Strip any accidental markdown fences
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  const parsed = JSON.parse(clean)

  // Sanity check
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

  return parsed
}

function pickTopic(): string {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)]
}

Deno.serve(async (_req) => {
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
  const results: { level: number; ok: boolean; error?: string; title?: string }[] = []

  for (let level = 1; level <= 5; level++) {
    for (let i = 0; i < ARTICLES_PER_LEVEL; i++) {
      const topic = pickTopic()
      try {
        const article = await generateOneArticle(apiKey, level, topic)
        const { error } = await supabase.from('articles').insert({
          reading_level: level,
          title: article.title,
          body: article.body,
          questions: article.questions,
          topic: article.topic || topic,
          source: 'claude-api',
          tags: []
        })
        if (error) throw error
        results.push({ level, ok: true, title: article.title })
        console.log(`✓ level ${level} topic ${topic}: "${article.title}"`)
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        results.push({ level, ok: false, error: msg })
        console.error(`✗ level ${level} topic ${topic}: ${msg}`)
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      generated: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results
    }),
    { headers: { 'content-type': 'application/json' } }
  )
})
