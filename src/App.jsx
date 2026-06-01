import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import VotingPage from './pages/VotingPage'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<VotingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/panel-x7k9p2" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-center" richColors closeButton />
    </BrowserRouter>
  )
}

export default App