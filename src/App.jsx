import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import VotingPage from './pages/VotingPage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Navbar */}
        <nav className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center">
                <span className="font-bold text-xl text-black">G</span>
              </div>
              <div>
                <div className="font-semibold tracking-tight text-lg">Granimaster 2026</div>
                <div className="text-[10px] text-zinc-500 -mt-1">Bucaramanga • Girón • Floridablanca</div>
              </div>
            </Link>

            <div className="flex items-center gap-2 text-sm">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-xl hover:bg-zinc-900 transition"
              >
                Votar
              </Link>
              <Link 
                to="/supervisor" 
                className="px-5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition flex items-center gap-2 text-sm"
              >
                Supervisor
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<VotingPage />} />
          <Route path="/supervisor" element={<AdminDashboard />} />
        </Routes>
      </div>

      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  )
}

export default App