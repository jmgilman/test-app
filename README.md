# test-app — Pastebin MVP monorepo

Spike application for the platform MVP (see the platform repo's `DUMP.md`). A minimal
pastebin: create a paste, get a shareable link, view it, copy the content or the link.
No auth, single-replica by design — intentionally hacky.

## Layout

- `backend` — Go API (`net/http`, pure-Go SQLite via `modernc.org/sqlite`).
- `frontend` — React + Vite + TypeScript SPA.

## API

- `POST /api/pastes` — body `{ title?, content }` → `201 { id, title, content, createdAt }`
- `GET  /api/pastes/{id}` → `200 { id, title, content, createdAt }` or `404 { error }`
- `GET  /api/healthz` → `200 { status: "ok" }`

Paste IDs are 8-char base62 slugs. Data persists to SQLite at `DATABASE_PATH`
(default `./data/pastes.db`).

## Run locally

Backend (port 8080):

```bash
cd backend
go run .
```

Frontend (port 5173; dev server proxies `/api` → `http://localhost:8080`):

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.
