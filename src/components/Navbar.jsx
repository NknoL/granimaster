import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header
      className="relative w-full"
      style={{
        backgroundImage: `url('/avatar.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
        <img
          src="/avatar.jpg"
          alt="Logo Granimaster"
          className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shadow-lg"
        />
        <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
          Grani<span className="text-red-500">master</span>
        </Link>
      </div>
    </header>
  )
}