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

  const PLACES = {
    Bucaramanga: ["Granifreseo", "Mundo8ice", "Frozen Shark", "Trinislush", "Granibucaros", "Crack granizados", "Tamy ice", "420Slushy", "Mafia cocktails", "Necati cocktails", "Granilocos", "Eclipse cocktail", "Blueice", "Ice flow", "Nova ice"],
    Girón: ["Graniizu ice", "Luna yena", "Urban slush", "Exotic slush", "Cool hot"],
    Floridablanca: ["Refreshment station", "Crazy Drinks", "Portal granizados", "Spacebuddies", "Mafia", "Granifreseo"]
  }

  const loadVotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setVotes(data)
      setLastUpdated(new Date())
    }
    setLoading(false)
  }

  // Auto-refresh cada 15 segundos
  useEffect(() => {
    if (!isAuthed) return

    const interval = setInterval(() => {
      loadVotes()
    }, 15000)

    return () => clearInterval(interval)
  }, [isAuthed])

  const handleLogin = () => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAuthed(true)
      loadVotes()
    } else {
      alert('PIN incorrecto')
    }
  }

  const exportToCSV = () => {
    if (votes.length === 0) {
      alert('No hay votos para exportar')
      return
    }

    const headers = ['Ciudad', 'Lugar', 'Email', 'Fecha y hora']
    const rows = votes.map(v => [
      v.city,
      v.place,
      v.email || 'N/A',
      new Date(v.created_at).toLocaleString('es-CO')
    ])

    let csvContent = headers.join(',') + '\n'
    rows.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(',') + '\n'
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `granimaster_resultados_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  // === Cálculos ===
  const cityTotals = {}
  const placeTotals = {}
  const uniqueEmails = new Set()

  votes.forEach(v => {
    cityTotals[v.city] = (cityTotals[v.city] || 0) + 1
    placeTotals[v.place] = (placeTotals[v.place] || 0) + 1
    if (v.email) uniqueEmails.add(v.email)
  })

  const totalVotes = votes.length
  const uniqueVoters = uniqueEmails.size

  const cityChartData = Object.entries(cityTotals).map(([ciudad, votos]) => ({
    ciudad,
    votos
  }))

  // Top 3 General
  const top3General = Object.entries(placeTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // Top 3 por ciudad
  const getTop3ByCity = (city) => {
    return Object.entries(placeTotals)
      .filter(([place]) => PLACES[city]?.includes(place))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }

  // ==================== LOGIN ====================
  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto mt-16 px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex justify-center mb-4">
            <Trophy className="text-cyan-400" size={42} />
          </div>
          <h2 className="text-3xl font-bold text-center tracking-tight">Panel de Supervisión</h2>
          <p className="text-center text-zinc-400 text-sm mt-1">Acceso solo para administradores</p>

          <div className="mt-8">
            <label className="text-xs text-zinc-400 block mb-2">INGRESA EL PIN</label>
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
            className="mt-4 w-full py-3.5 bg-white hover:bg-zinc-100 text-black font-semibold rounded-2xl transition"
          >
            Entrar al Panel
          </button>
        </div>
      </div>
    )
  }

  // ==================== DASHBOARD ====================
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="uppercase tracking-[3px] text-xs text-cyan-400 font-medium">SUPERVISOR</div>
            <div className="text-xs px-3 py-1 bg-zinc-800 rounded-full text-zinc-400 flex items-center gap-1">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Auto-refresh 15s
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">Panel de Supervisión</h1>
          {lastUpdated && (
            <p className="text-xs text-zinc-500 mt-1">
              Última actualización: {lastUpdated.toLocaleTimeString('es-CO')}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadVotes}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-sm hover:bg-zinc-800"
          >
            <RefreshCw size={16} /> Actualizar
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-semibold text-sm"
          >
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Users size={18} /> TOTAL DE VOTOS
          </div>
          <div className="text-6xl font-mono font-bold mt-2 tabular-nums">{totalVotes}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Users size={18} /> VOTANTES ÚNICOS
          </div>
          <div className="text-6xl font-mono font-bold mt-2 text-emerald-400 tabular-nums">{uniqueVoters}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <BarChart3 size={18} /> CIUDADES ACTIVAS
          </div>
          <div className="text-6xl font-mono font-bold mt-2 tabular-nums">{Object.keys(cityTotals).length}</div>
        </div>
      </div>

      {/* Top 3 General */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="text-yellow-400" />
          <h3 className="font-semibold text-xl">Top 3 General</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3General.length > 0 ? (
            top3General.map(([place, votos], index) => (
              <div key={index} className="bg-zinc-950 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <div className="font-semibold text-lg">{place}</div>
                <div className="text-4xl font-mono text-cyan-400 mt-1">{votos}</div>
                <div className="text-xs text-zinc-500 mt-1">votos</div>
              </div>
            ))
          ) : (
            <p className="text-zinc-400 col-span-3">Aún no hay votos registrados.</p>
          )}
        </div>
      </div>

      {/* Top 3 por Ciudad */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <Award className="text-yellow-400" />
          <h3 className="font-semibold text-xl">Top 3 por Ciudad</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.keys(PLACES).map(city => {
            const top3 = getTop3ByCity(city)
            return (
              <div key={city} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h4 className="font-semibold mb-4 text-center text-lg">{city}</h4>
                {top3.length > 0 ? (
                  top3.map(([place, votos], i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-zinc-800 last:border-none">
                      <span className="font-medium">{i + 1}. {place}</span>
                      <span className="font-mono text-cyan-400">{votos} votos</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400 py-4 text-center">Sin votos aún</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-5">
          <BarChart3 className="text-cyan-400" />
          <h3 className="font-semibold text-xl">Votos por Ciudad</h3>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="ciudad" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="votos" fill="#22d3ee" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de votos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="font-semibold">Últimos votos registrados</div>
          <div className="text-xs text-zinc-400">{votes.length} votos en total</div>
        </div>

        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 sticky top-0">
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-zinc-400 font-normal">Ciudad</th>
                <th className="text-left px-6 py-4 text-zinc-400 font-normal">Lugar</th>
                <th className="text-left px-6 py-4 text-zinc-400 font-normal">Email</th>
                <th className="text-left px-6 py-4 text-zinc-400 font-normal">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {votes.length > 0 ? (
                votes.slice(0, 100).map((vote, index) => (
                  <tr key={index} className="hover:bg-zinc-950">
                    <td className="px-6 py-4 font-medium">{vote.city}</td>
                    <td className="px-6 py-4">{vote.place}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{vote.email || '—'}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">
                      {new Date(vote.created_at).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-zinc-400">
                    Aún no hay votos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}