import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Toaster } from 'sonner'

import VotingPage from './pages/VotingPage'
import AdminDashboard from './pages/AdminDashboard'
function App() {
  // Limpieza al recargar si está logueado
  useEffect(() => {
    const cleanOnReload = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        localStorage.clear()
        sessionStorage.clear()

        if ('caches' in window) {
          caches.keys().then(keys => keys.forEach(key => caches.delete(key)))
        }

        // Refrescar solo una vez
        if (!sessionStorage.getItem('refreshedAfterLogin')) {
          sessionStorage.setItem('refreshedAfterLogin', 'true')
          window.location.reload()
        }
      }
    }

    cleanOnReload()
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Routes>
          <Route path="/" element={<VotingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/panel-x7k9p2" element={<SecretPanel />} />
        </Routes>
      </div>
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  )
}

export default App