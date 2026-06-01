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
    const { data } = await supabase.from('votes').select('*').order('created_at', { ascending: false })
    if (data) {
      setVotes(data)
      setLastUpdated(new Date())
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!isAuthed) return
    const interval = setInterval(loadVotes, 15000)
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
    if (votes.length === 0) return alert('No hay votos para exportar')

    const headers = ['Ciudad', 'Lugar', 'Email', 'Fecha']
    const rows = votes.map(v => [
      v.city,
      v.place,
      v.email || 'N/A',
      new Date(v.created_at).toLocaleString('es-CO')
    ])

    let csv = headers.join(',') + '\n'
    rows.forEach(r => csv += r.map(f => `"${f}"`).join(',') + '\n')

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    link.download = `granimaster_supervisor.csv`
    link.click()
  }

  // Cálculos
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
  const cityChartData = Object.entries(cityTotals).map(([ciudad, votos]) => ({ ciudad, votos }))

  const top3General = Object.entries(placeTotals).sort((a, b) => b[1] - a[1]).slice(0, 3)

  const getTop3ByCity = (city) => {
    return Object.entries(placeTotals)
      .filter(([place]) => PLACES[city]?.includes(place))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto mt-16 px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
          <Trophy className="mx-auto text-cyan-400 mb-4" size={40} />
          <h2 className="text-3xl font-bold">Panel de Supervisión</h2>
          <p className="text-zinc-400 text-sm mt-1">/panel-x7k9p2</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="PIN"
            className="mt-6 w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 text-center text-2xl tracking-[4px]"
          />
          <button onClick={handleLogin} className="mt-4 w-full py-3 bg-white text-black rounded-2xl font-semibold">
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="text-cyan-400 text-sm tracking-[3px] flex items-center gap-2">
            SUPERVISOR • AUTO REFRESH 15s
          </div>
          <div className="text-5xl font-bold tracking-tighter">Panel de Supervisión</div>
          {lastUpdated && <p className="text-xs text-zinc-500 mt-1">Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={loadVotes} className="flex items-center gap-2 px-5 py-3 bg-zinc-900 rounded-2xl border border-zinc-700 text-sm">
            <RefreshCw size={16} /> Actualizar
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-2xl text-sm">
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="text-sm text-zinc-400">TOTAL VOTOS</div>
          <div className="text-6xl font-mono font-bold mt-1">{totalVotes}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="text-sm text-zinc-400">VOTANTES ÚNICOS</div>
          <div className="text-6xl font-mono font-bold mt-1 text-emerald-400">{uniqueVoters}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="text-sm text-zinc-400">CIUDADES CON VOTOS</div>
          <div className="text-6xl font-mono font-bold mt-1">{Object.keys(cityTotals).length}</div>
        </div>
      </div>

      {/* Top 3 General */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-400" />
          <h3 className="font-semibold text-xl">Top 3 General</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3General.map(([place, votos], i) => (
            <div key={i} className="bg-zinc-950 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-1">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
              <div className="font-semibold">{place}</div>
              <div className="text-4xl font-mono text-cyan-400 mt-1">{votos}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 3 por Ciudad */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-yellow-400" />
          <h3 className="font-semibold text-xl">Top 3 por Ciudad</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.keys(PLACES).map(city => {
            const top3 = getTop3ByCity(city)
            return (
              <div key={city} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <h4 className="font-semibold mb-4 text-center">{city}</h4>
                {top3.length > 0 ? top3.map(([place, votos], i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-zinc-800 last:border-none">
                    <span>{i + 1}. {place}</span>
                    <span className="font-mono text-cyan-400">{votos} votos</span>
                  </div>
                )) : <p className="text-zinc-400 text-sm py-4 text-center">Sin votos aún</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-cyan-400" />
          <h3 className="font-semibold">Votos por Ciudad</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={cityChartData}>
              <CartesianGrid stroke="#27272a" />
              <XAxis dataKey="ciudad" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="votos" fill="#22d3ee" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="font-semibold mb-4">Últimos votos</div>
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-left text-zinc-400">
                <th className="py-3">Ciudad</th>
                <th>Lugar</th>
                <th>Email</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {votes.length > 0 ? (
                votes.slice(0, 80).map((v, i) => (
                  <tr key={i} className="border-b border-zinc-800">
                    <td className="py-3">{v.city}</td>
                    <td>{v.place}</td>
                    <td className="text-xs text-zinc-400">{v.email || '—'}</td>
                    <td className="text-xs text-zinc-400">{new Date(v.created_at).toLocaleString('es-CO')}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="py-8 text-center text-zinc-400">No hay votos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}