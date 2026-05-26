import { TOPICS, topicLabel } from '../content/topics.js'

// Horizontal chip-bar that lets the kid swap the topic filter for a single
// Spelling/Reading quiz. Renders "All" plus the canonical topic list, with
// the current value highlighted. Selection does NOT persist to the profile.
//
// `disabled` is set true once the kid has started answering — switching
// topics mid-quiz would tear down the question pool. The pinned profile
// default is restored next time they enter the subject.
export default function TopicChipBar({ value, onChange, disabled, fallbackNotice }) {
  return (
    <div className="topic-chip-bar" style={{ marginBottom: 20 }}>
      <div className="topic-chip-row">
        <button
          type="button"
          className={`topic-chip ${!value ? 'topic-chip-active' : ''}`}
          onClick={() => onChange(null)}
          disabled={disabled}
        >
          All
        </button>
        {TOPICS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`topic-chip ${value === t.value ? 'topic-chip-active' : ''}`}
            onClick={() => onChange(t.value)}
            disabled={disabled}
            title={t.label}
          >
            <span style={{ marginRight: 4 }}>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>
      {fallbackNotice && (
        <p className="muted" style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: 8 }}>
          No "{topicLabel(value)}" words yet at this level — using regular words.
        </p>
      )}
    </div>
  )
}
