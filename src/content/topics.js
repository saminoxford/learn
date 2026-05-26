// Canonical list of article topics. Kept in sync with the TOPICS array in
// supabase/functions/generate-articles/index.ts — these are the topics
// new "Did You Know?" articles are generated from, and the choices for the
// per-kid topic-of-the-week filter.
//
// Each entry: { value, label, emoji }.
// `value` is what gets stored in profiles.topic_filter and matched against
// articles.tags[0] (the topic tag).

export const TOPICS = [
  { value: 'animals', label: 'Animals', emoji: '🐾' },
  { value: 'space', label: 'Space', emoji: '🚀' },
  { value: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕' },
  { value: 'oceans', label: 'Oceans', emoji: '🌊' },
  { value: 'weather', label: 'Weather', emoji: '⛈️' },
  { value: 'inventions', label: 'Inventions', emoji: '💡' },
  { value: 'world records', label: 'World Records', emoji: '🏆' },
  { value: 'human body', label: 'Human Body', emoji: '🧠' },
  { value: 'plants', label: 'Plants', emoji: '🌱' },
  { value: 'history', label: 'History', emoji: '📜' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'food', label: 'Food', emoji: '🍎' },
  { value: 'mountains', label: 'Mountains', emoji: '⛰️' },
  { value: 'caves', label: 'Caves', emoji: '🕳️' },
  { value: 'volcanoes', label: 'Volcanoes', emoji: '🌋' },
  { value: 'mythology', label: 'Mythology', emoji: '🐉' },
  { value: 'art', label: 'Art', emoji: '🎨' },
  { value: 'music', label: 'Music', emoji: '🎵' }
]

export function topicLabel(value) {
  if (!value) return null
  const t = TOPICS.find((x) => x.value === value)
  return t ? t.label : value
}
