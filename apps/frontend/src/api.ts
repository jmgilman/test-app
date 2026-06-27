// API client for the pastebin backend.
// All requests use RELATIVE paths beginning with /api so they work behind the
// Vite dev proxy and in production regardless of host/port.

export interface Paste {
  id: string
  title: string
  content: string
  createdAt: string
}

export interface ApiError {
  error: string
}

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as Partial<ApiError>
    if (body && typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // fall through to generic message
  }
  return `request failed (${res.status})`
}

export async function createPaste(input: {
  title: string
  content: string
}): Promise<Paste> {
  const res = await fetch('/api/pastes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new HttpError(res.status, await parseError(res))
  }
  return (await res.json()) as Paste
}

export async function getPaste(id: string): Promise<Paste> {
  const res = await fetch(`/api/pastes/${encodeURIComponent(id)}`)
  if (!res.ok) {
    throw new HttpError(res.status, await parseError(res))
  }
  return (await res.json()) as Paste
}
