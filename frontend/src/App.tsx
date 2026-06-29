import { Routes, Route, Link } from 'react-router-dom'
import NewPaste from './pages/NewPaste.tsx'
import ViewPaste from './pages/ViewPaste.tsx'

function NotFound() {
  return (
    <div className="card">
      <h1>Not found</h1>
      <p>That page does not exist.</p>
      <Link className="link" to="/">
        New paste
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link className="brand" to="/">
          Pastebin
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<NewPaste />} />
          <Route path="/p/:id" element={<ViewPaste />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
