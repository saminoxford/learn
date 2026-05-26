import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { fetchNextArticle } from '../content/articles.js'
import ChoiceAnswer from '../components/ChoiceAnswer.jsx'
import { recordSession, updateProfile } from '../previewStore.js'

const READING_XP = 50 // base reward for finishing an article
const COMPREHENSION_XP = 10 // per correct comprehension answer

export default function Article() {
  const { activeProfile, setRoute, updateActiveProfile, localOnly, canWrite } = useAppCtx()

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  // 'reading' → show body + "I read it"
  // 'questions' → run through comprehension Qs
  // 'done' → saving + transitioning to Results
  const [phase, setPhase] = useState('reading')

  // Per-question state for comprehension
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setErr('')
      try {
        const readingLevel = activeProfile?.reading_level ?? 3
        if (localOnly) {
          // Preview/test mode: ship a tiny in-memory sample so the flow renders
          if (!cancelled) {
            setArticle({
              id: 'preview-article',
              title: 'Preview mode',
              body: 'This is a sample article for preview mode.\n\nReal articles come from Supabase. Add an Anthropic API key in Supabase secrets and the daily cron will keep new ones flowing.',
              questions: [
                {
                  question: 'What powers the article generator?',
                  options: ['Magic', 'A daily cron + Claude API', 'A robot in the basement', 'Coffee'],
                  answer: 'A daily cron + Claude API'
                }
              ]
            })
            setLoading(false)
          }
          return
        }
        const next = await fetchNextArticle(activeProfile.id, readingLevel)
        if (cancelled) return
        if (!next) {
          setErr('No articles available yet at your reading level. Check back soon!')
          setLoading(false)
          return
        }
        setArticle(next)
        setLoading(false)
      } catch (e) {
        if (!cancelled) {
          setErr(e.message || 'Failed to load article.')
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [activeProfile, localOnly])

  if (loading) {
    return (
      <div className="app-shell center-col">
        <p className="muted">Loading…</p>
      </div>
    )
  }
  if (err) {
    return (
      <div className="app-shell center-col">
        <div className="card" style={{ maxWidth: 460, textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 8 }}>📰 Did You Know?</h2>
          <p className="muted">{err}</p>
          <button
            style={{ marginTop: 16 }}
            onClick={() => setRoute({ name: 'home' })}
          >
            ← Home
          </button>
        </div>
      </div>
    )
  }
  if (!article) return null

  const questions = Array.isArray(article.questions) ? article.questions : []
  const hasQuestions = questions.length > 0
  const q = phase === 'questions' ? questions[qIdx] : null
  const isLastQ = phase === 'questions' && qIdx === questions.length - 1
  const isCorrect = q ? selected === q.answer : false

  const startQuestions = () => {
    if (!hasQuestions) {
      finish(0)
      return
    }
    setPhase('questions')
  }

  const checkAnswer = () => {
    if (selected == null) return
    setChecked(true)
    if (selected === q.answer) setScore((s) => s + 1)
  }

  const nextQuestion = async () => {
    if (!isLastQ) {
      setQIdx((i) => i + 1)
      setSelected(null)
      setChecked(false)
      return
    }
    await finish(score)
  }

  async function finish(finalScore) {
    setSaving(true)
    const xpEarned = READING_XP + COMPREHENSION_XP * finalScore
    try {
      if (localOnly) {
        recordSession({
          user_id: activeProfile.id,
          subject: 'Did You Know?',
          grade: `Level ${activeProfile.reading_level ?? 3}`,
          score: finalScore,
          total: questions.length
        })
        const newXp = (activeProfile.xp ?? 0) + xpEarned
        updateProfile(activeProfile.id, { xp: newXp })
        updateActiveProfile({ xp: newXp })
      } else if (canWrite) {
        await supabase.from('sessions').insert({
          user_id: activeProfile.id,
          subject: 'Did You Know?',
          grade: `Level ${activeProfile.reading_level ?? 3}`,
          score: finalScore,
          total: questions.length,
          article_id: article.id
        })
        const newXp = (activeProfile.xp ?? 0) + xpEarned
        await supabase.from('profiles').update({ xp: newXp }).eq('id', activeProfile.id)
        updateActiveProfile({ xp: newXp })
      }
    } catch (e) {
      console.error('Failed saving DYK session', e)
    } finally {
      setSaving(false)
      setRoute({
        name: 'results',
        subject: 'Did You Know?',
        grade: `Level ${activeProfile.reading_level ?? 3}`,
        score: finalScore,
        total: questions.length,
        xpEarned
      })
    }
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <button className="btn-ghost" onClick={() => setRoute({ name: 'home' })}>
          ← Home
        </button>
        <div className="brand">📰 Did You Know?</div>
        <div className="muted" style={{ minWidth: 60, textAlign: 'right' }}>
          {phase === 'questions' ? `${qIdx + 1} / ${questions.length}` : ''}
        </div>
      </div>

      {phase === 'reading' && (
        <>
          <div className="card article-card fade-in">
            <h1 className="article-title">{article.title}</h1>
            <div className="article-body">
              {article.body.split(/\n\s*\n/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <button className="btn-primary" onClick={startQuestions}>
              {hasQuestions ? 'I read it! 📖' : 'Done reading'}
            </button>
          </div>
        </>
      )}

      {phase === 'questions' && q && (
        <>
          <div className="card fade-in" style={{ marginBottom: 20 }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.4rem' }}>{q.question}</h2>
          </div>
          <ChoiceAnswer
            options={q.options}
            selected={selected}
            onSelect={setSelected}
            checked={checked}
            correctAnswer={q.answer}
          />
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            {!checked ? (
              <button
                className="btn-primary"
                disabled={selected == null}
                onClick={checkAnswer}
              >
                Check answer
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: '1.15rem' }}>
                  {isCorrect ? '✅ Correct!' : `❌ Answer: ${q.answer}`}
                </div>
                <button className="btn-primary" onClick={nextQuestion} disabled={saving}>
                  {isLastQ ? (saving ? 'Saving…' : 'Finish') : 'Next →'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
