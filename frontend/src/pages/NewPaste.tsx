import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPaste } from '../api.ts'

export default function NewPaste() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = content.trim().length > 0 && !submitting

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) {
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const paste = await createPaste({ title, content })
      navigate(`/p/${paste.id}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'failed to create paste'
      setError(message)
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h1>New paste</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Title (optional)</span>
          <input
            className="input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            maxLength={200}
          />
        </label>
        <label className="field">
          <span className="field-label">Content</span>
          <textarea
            className="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text here..."
            rows={14}
            required
          />
        </label>
        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button className="button" type="submit" disabled={!canSubmit}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
