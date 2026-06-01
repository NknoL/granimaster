import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-3">
        <img
          src="/avatar.jpg"
          alt="Granimaster"
          className="w-8 h-8 rounded-full object-cover"
        />
        <Link to="/" className="text-sm font-semibold tracking-widest uppercase text-white">
          Granimaster <span className="text-zinc-600">2026</span>
        </Link>
      </div>
    </header>
  )
}