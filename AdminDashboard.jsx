import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Download, Trophy, BarChart3, Award, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const [pin, setPin] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [votes, setVotes] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'Grm2026xK9pL'

  const PLACES = {
    Bucaramanga: ["Granifreseo", "Mundo8ice", "Frozen Shark", "Trinislush", "Granibucaros", "Crack granizados", "Tamy ice", "420Slushy", "Mafia cocktails", "Necati cocktails", "Granilocos", "Eclipse cocktail", "Blueice", "Ice flow", "Nova ice"],
    Girón: ["Graniizu ice", "Luna yena", "Urban slush", "Exotic slush", "Cool hot"],
    Floridablanca: ["Refreshment station", "Crazy Drinks", "Portal granizados", "Spacebuddies", "Mafia", "Granifreseo"]
  }

  const loadVotes = async () => {
    setLoading(true)
    setError(null)

    // ✅ FIX: Quitamos el límite de 1000 filas
    const { data, error: fetchError } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50000)                    // ← Límite alto para que traiga todo

    if (fetchError) {
      console.error('Error cargando votos:', fetchError)
      setError(`\( {fetchError.message} ( \){fetchError.code})`)
    }

    if (data) {
      console.log(`✅ Total votos cargados: ${data.length}`)
      setVotes(data)
      setLastUpdated(new Date())
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!isAuthed) return
    loadVotes()
    const interval = setInterval(loadVotes, 10000) // cada 10s
    return () => clearInterval(interval)
  }, [isAuthed])

  const handleLogin = () => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAuthed(true)
    } else {
      alert('PIN incorrecto')
    }
  }

  const exportToCSV = () => {
    if (votes.length === 0) return alert('No hay votos para exportar')
    const headers = ['Ciudad', 'Lugar', 'Email', 'Fecha']
    const rows = votes.map(v => [v.city, v.place, v.email || 'N/A', new Date(v.created_at).toLocaleString('es-CO')])
    let csv = headers.join(',') + '\n'
    rows.forEach(r => csv += r.map(f => `"${f}"`).join(',') + '\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    link.download = `granimaster_supervisor.csv`
    link.click()
  }

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

  const getTop3ByCity = (city) =>
    Object.entries(placeTotals)
      .filter(([place]) => PLACES[city]?.includes(place))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

  if (!isAuthed) {
    return (
      <div className="max-w-sm mx-auto mt-20 px-6">
        <div className="border border-zinc-800 rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-1">Panel de Supervisión</h2>
          <p className="text-zinc-600 text-xs mb-6">Acceso restringido</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="PIN"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-center text-xl tracking-[6px] text-white focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={handleLogin}
            className="mt-3 w-full py-3 bg-white text-black rounded-lg text-sm font-semibold hover:bg-zinc-200 transition"
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <p className="text-xs font-semibold tracking-[4px] uppercase text-zinc-500 mb-1">
            Supervisor · Auto refresh 10s
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Panel de Supervisión</h1>
          {lastUpdated && (
            <p className="text-xs text-zinc-600 mt-1">
              Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadVotes}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-zinc-200 transition"
          >
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 border border-red-900 rounded-lg px-4 py-3 text-red-400 text-xs">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {[
          { label: 'TOTAL VOTOS', value: totalVotes, color: 'text-white' },
          { label: 'VOTANTES ÚNICOS', value: uniqueVoters, color: 'text-emerald-400' },
          { label: 'CIUDADES', value: Object.keys(cityTotals).length, color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-zinc-800 rounded-xl p-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">{label}</p>
            <p className={`text-5xl font-mono font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Top 3 General */}
      <div className="border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Trophy size={16} className="text-zinc-400" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Top 3 General</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {top3General.length > 0 ? top3General.map(([place, votos], i) => (
            <div key={i} className="border border-zinc-800 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-white">{place}</p>
              <p className="text-3xl font-mono font-bold text-white mt-1 tabular-nums">{votos}</p>
            </div>
          )) : (
            <p className="col-span-3 text-center text-zinc-600 text-sm py-4">Sin votos aún</p>
          )}
        </div>
      </div>

      {/* Top 3 por Ciudad */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-zinc-400" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Top 3 por Ciudad</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {Object.keys(PLACES).map(city => {
            const top3 = getTop3ByCity(city)
            return (
              <div key={city} className="border border-zinc-800 rounded-xl p-5">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">{city}</h4>
                {top3.length > 0 ? top3.map(([place, votos], i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-900 last:border-none">
                    <span className="text-sm text-zinc-300">{i + 1}. {place}</span>
                    <span className="text-sm font-mono text-white tabular-nums">{votos}</span>
                  </div>
                )) : (
                  <p className="text-zinc-700 text-xs py-3">Sin votos aún</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Gráfica */}
      <div className="border border-zinc-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={16} className="text-zinc-400" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Votos por Ciudad</h3>
        </div>
        <div className="h-60">
          <ResponsiveContainer>
            <BarChart data={cityChartData} barSize={40}>
              <CartesianGrid stroke="#27272a" vertical={false} />
              <XAxis dataKey="ciudad" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#ffffff08' }}
              />
              <Bar dataKey="votos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla */}
      <div className="border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 mb-5">Últimos votos</h3>
        <div className="overflow-auto max-h-[480px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600 pr-6">Ciudad</th>
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600 pr-6">Lugar</th>
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600 pr-6">Email</th>
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {votes.length > 0 ? (
                votes.slice(0, 100).map((v, i) => (
                  <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition">
                    <td className="py-3 pr-6 text-zinc-300">{v.city}</td>
                    <td className="py-3 pr-6 text-zinc-300">{v.place}</td>
                    <td className="py-3 pr-6 text-zinc-600 text-xs">{v.email || '—'}</td>
                    <td className="py-3 text-zinc-600 text-xs">{new Date(v.created_at).toLocaleString('es-CO')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-zinc-700 text-sm">
                    {loading ? 'Cargando...' : 'No hay votos registrados'}
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