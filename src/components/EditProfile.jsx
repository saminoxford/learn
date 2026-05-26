import { useState } from 'react'
import { supabase } from '../supabase.js'
import { useAppCtx } from '../AppContext.js'
import { updateProfile as updatePreviewProfile } from '../previewStore.js'
import { AVATAR_OPTIONS, FALLBACK_AVATAR } from '../profiles.js'

export default function EditProfile({ onClose }) {
  const { activeProfile, updateActiveProfile, localOnly, isKidAccount } = useAppCtx()
  const [name, setName] = useState(activeProfile.name || '')
  const [avatar, setAvatar] = useState(activeProfile.avatar || FALLBACK_AVATAR)
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

    try {
      if (localOnly) {
        updatePreviewProfile(activeProfile.id, { name: cleaned, avatar })
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ name: cleaned, avatar })
          .eq('id', activeProfile.id)
        if (error) throw error

        // For real kid accounts, sync to the auth user record so the
        // Supabase dashboard's Display name column reflects the change.
        // Admins editing their own simulated copies don't touch user_metadata.
        if (isKidAccount) {
          await supabase.auth.updateUser({
            data: { display_name: cleaned, avatar }
          })
        }
      }
      updateActiveProfile({ name: cleaned, avatar })
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
        <div className="avatar-grid" style={{ marginTop: 8 }}>
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
