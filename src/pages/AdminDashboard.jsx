import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Download, Users, Trophy, BarChart3, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AdminDashboard() {
  const [pin, setPin] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(false)

  const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'grani2026'

  const loadVotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setVotes(data)
    }
    setLoading(false)
  }

  const handleLogin = () => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAuthed(true)
      loadVotes()
    } else {
      alert('PIN incorrecto. Intenta de nuevo.')
    }
  }

  const exportToCSV = () => {
    if (votes.length === 0) {
      alert('No hay votos para exportar todavía.')
      return
    }

    const headers = ['Ciudad', 'Lugar', 'Cédula', 'Fecha y hora']
    const rows = votes.map(v => [
      v.city,
      v.place,
      v.cedula || 'N/A',
      new Date(v.created_at).toLocaleString('es-CO')
    ])

    let csvContent = headers.join(',') + '\n'
    rows.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(',') + '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `granimaster_supervisor_${new Date().toISOString().slice(0,10)}.csv`
    link.click()
  }

  // === Cálculos para estadísticas ===
  const cityTotals = {}
  const placeTotals = {}
  const uniqueCedulas = new Set()

  votes.forEach(v => {
    cityTotals[v.city] = (cityTotals[v.city] || 0) + 1
    placeTotals[v.place] = (placeTotals[v.place] || 0) + 1
    if (v.cedula) uniqueCedulas.add(v.cedula)
  })

  const totalVotes = votes.length
  const uniqueVoters = uniqueCedulas.size

  // Datos para gráficas
  const cityChartData = Object.entries(cityTotals).map(([city, total]) => ({
    ciudad: city,
    votos: total
  }))

  // Top 5 lugares más votados
  const topPlaces = Object.entries(placeTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([place, total]) => ({
      lugar: place.length > 18 ? place.substring(0, 18) + '...' : place,
      votos: total
    }))

  const COLORS = ['#22d3ee', '#a5b4fc', '#f472b6', '#4ade80', '#fbbf24']

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto mt-16 px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center">
              <Trophy className="text-cyan-400" size={28} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center tracking-tight">Supervisor</h2>
          <p className="text-center text-zinc-400 mt-2 text-sm">Acceso solo para supervisión</p>

          <div className="mt-8">
            <label className="text-xs text-zinc-400 block mb-2">INGRESA EL PIN DE SUPERVISOR</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className="w-full bg-black border border-zinc-700 focus:border-cyan-500 rounded-2xl px-5 py-4 text-2xl tracking-[4px] text-center outline-none"
            />
          </div>

          <button
            onClick={handleLogin}
            className="mt-4 w-full py-4 bg-white hover:bg-zinc-200 active:bg-zinc-300 transition text-black font-semibold rounded-2xl"
          >
            Entrar al Panel de Supervisor
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="uppercase tracking-[3px] text-xs text-cyan-400 font-medium">SUPERVISOR</div>
          <div className="text-5xl font-bold tracking-tighter">Panel de Supervisión</div>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sm font-medium self-start md:self-auto"
        >
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 text-zinc-400 text-sm">
            <Users size={18} /> TOTAL VOTOS
          </div>
          <div className="text-5xl font-mono font-semibold mt-2 tabular-nums">{totalVotes}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 text-zinc-400 text-sm">
            <Users size={18} /> VOTANTES ÚNICOS
          </div>
          <div className="text-5xl font-mono font-semibold mt-2 tabular-nums text-emerald-400">{uniqueVoters}</div>
        </div>

        {Object.entries(cityTotals).map(([city, total]) => (
          <div key={city} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="text-zinc-400 text-sm">{city.toUpperCase()}</div>
            <div className="text-5xl font-mono font-semibold mt-2 tabular-nums">{total}</div>
          </div>
        ))}
      </div>

      {/* Gráficas */}
      {votes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Votos por Ciudad */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-cyan-400" />
              <h3 className="font-semibold">Votos por Ciudad</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="ciudad" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip />
                  <Bar dataKey="votos" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 Lugares más votados */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-yellow-400" />
              <h3 className="font-semibold">Top 5 Lugares más votados</h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPlaces} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" />
                  <YAxis dataKey="lugar" type="category" width={140} stroke="#71717a" />
                  <Tooltip />
                  <Bar dataKey="votos" fill="#facc15" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de votos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="font-semibold">Últimos votos registrados</div>
          <div className="text-xs text-zinc-400">{votes.length} votos en total</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-400">Cargando...</div>
        ) : votes.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">Aún no hay votos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950">
                  <th className="text-left px-6 py-4 font-normal text-zinc-400">Ciudad</th>
                  <th className="text-left px-6 py-4 font-normal text-zinc-400">Lugar votado</th>
                  <th className="text-left px-6 py-4 font-normal text-zinc-400">Cédula</th>
                  <th className="text-left px-6 py-4 font-normal text-zinc-400">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {votes.slice(0, 100).map((vote, index) => (
                  <tr key={index} className="hover:bg-zinc-950">
                    <td className="px-6 py-4 font-medium">{vote.city}</td>
                    <td className="px-6 py-4">{vote.place}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{vote.cedula || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {new Date(vote.created_at).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-zinc-500 mt-6">
        Panel de solo visualización • Actualizado al recargar la página
      </p>
    </div>
  )
}