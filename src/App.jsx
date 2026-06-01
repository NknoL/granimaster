import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import VotingPage from './pages/VotingPage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-white">
        {/* Navbar - Solo botón de Votar (Supervisor oculto) */}
        <nav className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            
            <Link to="/" className="flex items-center gap-3">
              {/* Logo cambiado por imagen */}
              <div className="w-9 h-9 rounded-2xl overflow-hidden border border-zinc-700">
                <img 
                  src="/avatar.jpg" 
                  alt="Granimaster" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-semibold tracking-tight text-lg">Granimaster 2026</div>
                <div className="text-[10px] text-zinc-500 -mt-1">Bucaramanga • Girón • Floridablanca</div>
              </div>
            </Link>

            {/* Solo botón de Votar (Supervisor oculto del público) */}
            <Link 
              to="/" 
              className="px-5 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition text-sm"
            >
              Votar
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<VotingPage />} />
          {/* Ruta protegida y difícil de adivinar */}
          <Route path="/panel-x7k9p2" element={<AdminDashboard />} />
        </Routes>
      </div>

      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  )
}

export default App