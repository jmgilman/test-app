import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPaste, HttpError, type Paste } from '../api.ts'
import { copyText } from '../clipboard.ts'

type Status = 'loading' | 'loaded' | 'notfound' | 'error'

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>()
  const [status, setStatus] = useState<Status>('loading')
  const [paste, setPaste] = useState<Paste | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [copied, setCopied] = useState<'paste' | 'link' | null>(null)

  useEffect(() => {
    if (!id) {
      setStatus('notfound')
      return
    }
    let cancelled = false
    setStatus('loading')
    getPaste(id)
      .then((p) => {
        if (cancelled) return
        setPaste(p)
        setStatus('loaded')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        if (err instanceof HttpError && err.status === 404) {
          setStatus('notfound')
          return
        }
        setErrorMsg(
          err instanceof Error ? err.message : 'failed to load paste',
        )
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleCopy(which: 'paste' | 'link', text: string) {
    const ok = await copyText(text)
    if (ok) {
      setCopied(which)
      window.setTimeout(() => setCopied(null), 1500)
    }
  }

  if (status === 'loading') {
    return (
      <div className="card">
        <p className="message">Loading...</p>
      </div>
    )
  }

  if (status === 'notfound') {
    return (
      <div className="card">
        <h1>Paste not found</h1>
        <Link className="link" to="/">
          New paste
        </Link>
      </div>
    )
  }

  if (status === 'error' || !paste) {
    return (
      <div className="card">
        <h1>Something went wrong</h1>
        <p className="message error" role="alert">
          {errorMsg || 'failed to load paste'}
        </p>
        <Link className="link" to="/">
          New paste
        </Link>
      </div>
    )
  }

  const link = `${window.location.origin}/p/${paste.id}`

  return (
    <div className="card">
      <h1 className="paste-title">{paste.title.trim() || 'Untitled'}</h1>
      <pre className="paste-content">{paste.content}</pre>
      <div className="actions">
        <button
          className="button"
          type="button"
          onClick={() => handleCopy('paste', paste.content)}
        >
          {copied === 'paste' ? 'Copied!' : 'Copy paste'}
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => handleCopy('link', link)}
        >
          {copied === 'link' ? 'Copied!' : 'Copy link'}
        </button>
        <Link className="link" to="/">
          New paste
        </Link>
      </div>
    </div>
  )
}
