import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Download, Users, Trophy, BarChart3, Award, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [pin, setPin] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [votes, setVotes] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)

  const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'Grm2026xK9pL'

  const loadVotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error cargando votos:", error)
      alert("Error al cargar los votos: " + error.message)
    } else {
      console.log(`Total de votos cargados: ${data?.length || 0}`)
      setVotes(data || [])
      setLastUpdated(new Date())
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!isAuthed) return
    loadVotes()
    const interval = setInterval(loadVotes, 10000)
    return () => clearInterval(interval)
  }, [isAuthed])

  const handleLogin = () => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAuthed(true)
    } else {
      alert('PIN incorrecto')
    }
  }

  const exportToCSV = () => { /* tu función actual */ }

  const totalVotes = votes.length

  if (!isAuthed) {
    // ... tu login actual
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter">Panel de Supervisión</h1>
          <p className="text-3xl font-mono mt-2">Total: <strong>{totalVotes}</strong> votos</p>
        </div>
        <button onClick={loadVotes} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-semibold">
          <RefreshCw size={18} /> Actualizar Ahora
        </button>
      </div>

      {/* Resto de tu dashboard (KPIs, Top 3, gráfica, tabla) */}
      {/* Puedes mantener el resto igual */}

      <div className="mt-8 text-center text-xs text-zinc-500">
        Última actualización: {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
      </div>
    </div>
  )
}
