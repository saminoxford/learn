import { useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { updateProfile as updatePreviewProfile } from '../previewStore.js'
import { AVATAR_OPTIONS, FALLBACK_AVATAR } from '../profiles.js'
import { TOPICS } from '../content/topics.js'

const READING_LEVELS = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: 5, label: '5th' }
]

export default function EditProfile({ onClose }) {
  const { activeProfile, updateActiveProfile, localOnly, isKidAccount } = useAppCtx()
  const [name, setName] = useState(activeProfile.name || '')
  const [avatar, setAvatar] = useState(activeProfile.avatar || FALLBACK_AVATAR)
  const [readingLevel, setReadingLevel] = useState(
    Number(activeProfile.reading_level) || 3
  )
  const [gradeLevel, setGradeLevel] = useState(
    Number(activeProfile.grade_level) || 3
  )
  const [topicFilter, setTopicFilter] = useState(activeProfile.topic_filter || '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const save = async () => {
    const cleaned = name.trim()
    if (!cleaned) {
      setErr('Name is required.')
      return
    }
    setSaving(true)
    setErr('')

    const topicValue = topicFilter || null

    try {
      if (localOnly) {
        updatePreviewProfile(activeProfile.id, {
          name: cleaned,
          avatar,
          reading_level: readingLevel,
          grade_level: gradeLevel,
          topic_filter: topicValue
        })
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: cleaned,
            avatar,
            reading_level: readingLevel,
            grade_level: gradeLevel,
            topic_filter: topicValue
          })
          .eq('id', activeProfile.id)
        if (error) throw error

        if (isKidAccount) {
          await supabase.auth.updateUser({
            data: {
              display_name: cleaned,
              avatar,
              reading_level: readingLevel,
              grade_level: gradeLevel
            }
          })
        }
      }
      updateActiveProfile({
        name: cleaned,
        avatar,
        reading_level: readingLevel,
        grade_level: gradeLevel,
        topic_filter: topicValue
      })
      onClose()
    } catch (e) {
      setErr(e.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>Edit profile</h2>

        <label className="muted" style={{ fontSize: '0.85rem' }}>Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          style={{ width: '100%', marginTop: 4, marginBottom: 18 }}
        />

        <label className="muted" style={{ fontSize: '0.85rem' }}>Avatar</label>
        <div className="avatar-grid" style={{ marginTop: 8, marginBottom: 18 }}>
          {AVATAR_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`avatar-cell ${opt === avatar ? 'selected' : ''}`}
              onClick={() => setAvatar(opt)}
              aria-label={`Choose ${opt}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <label className="muted" style={{ fontSize: '0.85rem' }}>
          Grade (default for quizzes)
        </label>
        <div className="reading-level-row" style={{ marginTop: 8, marginBottom: 18 }}>
          {READING_LEVELS.map((rl) => (
            <button
              key={rl.value}
              type="button"
              className={`reading-pill ${rl.value === gradeLevel ? 'selected' : ''}`}
              onClick={() => setGradeLevel(rl.value)}
              aria-label={`Grade ${rl.label}`}
            >
              {rl.label}
            </button>
          ))}
        </div>

        <label className="muted" style={{ fontSize: '0.85rem' }}>
          Reading level (for Did You Know?)
        </label>
        <div className="reading-level-row" style={{ marginTop: 8 }}>
          {READING_LEVELS.map((rl) => (
            <button
              key={rl.value}
              type="button"
              className={`reading-pill ${rl.value === readingLevel ? 'selected' : ''}`}
              onClick={() => setReadingLevel(rl.value)}
              aria-label={`Reading level ${rl.label}`}
            >
              {rl.label}
            </button>
          ))}
        </div>

        <label
          className="muted"
          style={{ fontSize: '0.85rem', marginTop: 18, display: 'block' }}
        >
          Topic of the week (Spelling &amp; Reading)
        </label>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          style={{ width: '100%', marginTop: 8 }}
        >
          <option value="">Any topic (default)</option>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.emoji} {t.label}
            </option>
          ))}
        </select>

        {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
