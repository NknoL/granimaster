import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import VotingPage from './pages/VotingPage'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'          // ← nueva línea

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />                                  {/* ← nueva línea */}
        <Routes>
          <Route path="/" element={<VotingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/panel-x7k9p2" element={<AdminDashboard />} />
        </Routes>
      </div>
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  )
}

export default App