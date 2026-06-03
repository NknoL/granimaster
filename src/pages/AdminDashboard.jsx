import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import {
  Download,
  Trophy,
  BarChart3,
  Award,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Search,
  CalendarDays,
  Filter
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const PLACES = {
  Bucaramanga: [
    'Granifreseo', 'Mundo8ice', 'Frozen Shark', 'Trinislush', 'Granibucaros',
    'Crack granizados', 'Tamy ice', '420Slushy', 'Mafia cocktails', 'Necati cocktails',
    'Granilocos', 'Eclipse cocktail', 'Blueice', 'Ice flow', 'Nova ice'
  ],
  Girón: [
    'Graniizu ice', 'Luna yena', 'Urban slush', 'Exotic slush', 'Cool hot'
  ],
  Floridablanca: [
    'Refreshment station', 'Crazy Drinks', 'Portal granizados', 'Spacebuddies', 'Mafia', 'Granifreseo'
  ]
}

const RANGE_OPTIONS = [
  { value: 'today', label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: '7days', label: 'Últimos 7 días' },
  { value: 'all', label: 'Histórico' },
  { value: 'custom', label: 'Personalizado' }
]

const PAGE_SIZE = 50
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || 'Grm2026xK9pL'
const STORAGE_KEY = 'admin-dashboard-filters-v1'

export default function AdminDashboard() {
  const [pin, setPin] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)

  const [loading, setLoading] = useState(false)
  const [loadingHistorical, setLoadingHistorical] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [rangeType, setRangeType] = useState('today')
  const [customStart, setCustomStart] = useState(() => formatDateInput(new Date()))
  const [customEnd, setCustomEnd] = useState(() => formatDateInput(new Date()))

  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedPlace, setSelectedPlace] = useState('all')
  const [searchEmail, setSearchEmail] = useState('')

  const [periodVotes, setPeriodVotes] = useState([])
  const [historicalTop3, setHistoricalTop3] = useState([])
  const [historicalStats, setHistoricalStats] = useState({
    totalVotes: 0,
    uniqueVoters: 0,
    citiesCount: 0,
    placesCount: 0
  })

  const [tablePage, setTablePage] = useState(0)

  const allPlaces = useMemo(() => {
    return Object.values(PLACES).flat().sort((a, b) => a.localeCompare(b))
  }, [])

  const availablePlacesByCity = useMemo(() => {
    if (selectedCity === 'all') return allPlaces
    return PLACES[selectedCity] || []
  }, [selectedCity, allPlaces])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved)
      if (parsed.rangeType) setRangeType(parsed.rangeType)
      if (parsed.customStart) setCustomStart(parsed.customStart)
      if (parsed.customEnd) setCustomEnd(parsed.customEnd)
      if (parsed.selectedCity) setSelectedCity(parsed.selectedCity)
      if (parsed.selectedPlace) setSelectedPlace(parsed.selectedPlace)
      if (typeof parsed.searchEmail === 'string') setSearchEmail(parsed.searchEmail)
    } catch (e) {
      console.error('Error restoring filters:', e)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rangeType,
        customStart,
        customEnd,
        selectedCity,
        selectedPlace,
        searchEmail
      })
    )
  }, [rangeType, customStart, customEnd, selectedCity, selectedPlace, searchEmail])

  useEffect(() => {
    if (selectedPlace !== 'all' && !availablePlacesByCity.includes(selectedPlace)) {
      setSelectedPlace('all')
    }
  }, [selectedCity, availablePlacesByCity, selectedPlace])

  useEffect(() => {
    setTablePage(0)
  }, [rangeType, customStart, customEnd, selectedCity, selectedPlace, searchEmail])

  const handleLogin = () => {
    if (pin.trim() === ADMIN_PIN) {
      setIsAuthed(true)
    } else {
      alert('PIN incorrecto')
    }
  }

  const getDateRange = () => {
    const now = new Date()

    if (rangeType === 'today') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)

      const end = new Date(now)
      end.setHours(23, 59, 59, 999)

      return { start, end, label: 'Hoy' }
    }

    if (rangeType === 'yesterday') {
      const start = new Date(now)
      start.setDate(start.getDate() - 1)
      start.setHours(0, 0, 0, 0)

      const end = new Date(now)
      end.setDate(end.getDate() - 1)
      end.setHours(23, 59, 59, 999)

      return { start, end, label: 'Ayer' }
    }

    if (rangeType === '7days') {
      const start = new Date(now)
      start.setDate(start.getDate() - 6)
      start.setHours(0, 0, 0, 0)

      const end = new Date(now)
      end.setHours(23, 59, 59, 999)

      return { start, end, label: 'Últimos 7 días' }
    }

    if (rangeType === 'custom') {
      const start = new Date(`${customStart}T00:00:00`)
      const end = new Date(`${customEnd}T23:59:59.999`)
      return { start, end, label: `${customStart} → ${customEnd}` }
    }

    return { start: null, end: null, label: 'Histórico' }
  }

  const buildVotesQuery = () => {
    let query = supabase
      .from('votes')
      .select('city, place, email, created_at, user_id')
      .order('created_at', { ascending: false })

    const { start, end } = getDateRange()

    if (start && end) {
      query = query
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
    }

    if (selectedCity !== 'all') {
      query = query.eq('city', selectedCity)
    }

    if (selectedPlace !== 'all') {
      query = query.eq('place', selectedPlace)
    }

    if (searchEmail.trim()) {
      query = query.ilike('email', `%${searchEmail.trim()}%`)
    }

    return query
  }

  const fetchAllRows = async (baseQuery) => {
    const chunkSize = 1000
    let from = 0
    let allRows = []

    while (true) {
      const { data, error: fetchError } = await baseQuery.range(from, from + chunkSize - 1)
      if (fetchError) throw fetchError
      if (data?.length) allRows = allRows.concat(data)
      if (!data || data.length < chunkSize) break
      from += chunkSize
    }

    return allRows
  }

  const loadHistoricalStats = async () => {
    setLoadingHistorical(true)
    try {
      const { count: totalVotes, error: countError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })

      if (countError) throw countError

      const allRows = await fetchAllRows(
        supabase
          .from('votes')
          .select('city, place, email, created_at, user_id')
          .order('created_at', { ascending: false })
      )

      const uniqueVoters = new Set(
        allRows.map(v => (v.user_id || v.email || '').trim()).filter(Boolean)
      ).size

      const citiesCount = new Set(allRows.map(v => v.city).filter(Boolean)).size
      const placesCount = new Set(allRows.map(v => v.place).filter(Boolean)).size

      const totals = {}
      allRows.forEach(v => {
        totals[v.place] = (totals[v.place] || 0) + 1
      })

      const top3 = Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)

      setHistoricalStats({
        totalVotes: totalVotes || 0,
        uniqueVoters,
        citiesCount,
        placesCount
      })
      setHistoricalTop3(top3)
    } catch (err) {
      console.error('Error cargando histórico:', err)
      setError(`${err.message} (${err.code || 'NO_CODE'})`)
    } finally {
      setLoadingHistorical(false)
    }
  }

  const loadPeriodVotes = async () => {
    setLoading(true)
    setError(null)

    try {
      const rows = await fetchAllRows(buildVotesQuery())
      setPeriodVotes(rows)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error cargando votos del período:', err)
      setError(`${err.message} (${err.code || 'NO_CODE'})`)
    } finally {
      setLoading(false)
    }
  }

  const loadAll = async () => {
    await Promise.all([
      loadHistoricalStats(),
      loadPeriodVotes()
    ])
  }

  useEffect(() => {
    if (!isAuthed) return
    loadAll()
    const interval = setInterval(() => {
      loadAll()
    }, 30000)
    return () => clearInterval(interval)
  }, [isAuthed])

  useEffect(() => {
    if (!isAuthed) return
    loadPeriodVotes()
  }, [rangeType, customStart, customEnd, selectedCity, selectedPlace, searchEmail])

  const periodCityTotals = {}
  const periodPlaceTotals = {}
  const periodUniqueVoters = new Set()
  const votesByHour = Array.from({ length: 24 }, (_, i) => ({
    hora: `${String(i).padStart(2, '0')}:00`,
    votos: 0
  }))
  const votesByDayMap = {}

  periodVotes.forEach(v => {
    periodCityTotals[v.city] = (periodCityTotals[v.city] || 0) + 1
    periodPlaceTotals[v.place] = (periodPlaceTotals[v.place] || 0) + 1

    const voterKey = (v.user_id || v.email || '').trim()
    if (voterKey) periodUniqueVoters.add(voterKey)

    const date = new Date(v.created_at)
    votesByHour[date.getHours()].votos += 1

    const dayKey = formatDateInput(date)
    votesByDayMap[dayKey] = (votesByDayMap[dayKey] || 0) + 1
  })

  const periodCityChartData = Object.entries(periodCityTotals)
    .map(([ciudad, votos]) => ({ ciudad, votos }))
    .sort((a, b) => b.votos - a.votos)

  const periodTop3 = Object.entries(periodPlaceTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const periodTopByCity = Object.keys(PLACES).reduce((acc, city) => {
    acc[city] = Object.entries(periodPlaceTotals)
      .filter(([place]) => PLACES[city]?.includes(place))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    return acc
  }, {})

  const votesByDay = Object.entries(votesByDayMap)
    .map(([fecha, votos]) => ({ fecha, votos }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  const filteredVotes = periodVotes
  const totalFilteredVotes = filteredVotes.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredVotes / PAGE_SIZE))
  const safePage = Math.min(tablePage, totalPages - 1)
  const pagedVotes = filteredVotes.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  )

  const periodCitiesCount = Object.keys(periodCityTotals).length
  const periodPlacesCount = Object.keys(periodPlaceTotals).length
  const leaderCity = periodCityChartData[0]?.ciudad || '—'
  const leaderPlace = periodTop3[0]?.[0] || '—'

  const anomalies = useMemo(() => {
    const byEmail = {}
    const byUserId = {}
    const byMinute = {}
    const domainMap = {}

    periodVotes.forEach(v => {
      const email = (v.email || '').toLowerCase().trim()
      const userId = (v.user_id || '').trim()
      const created = new Date(v.created_at)

      if (email) {
        byEmail[email] = (byEmail[email] || 0) + 1
        const domain = email.split('@')[1]
        if (domain) domainMap[domain] = (domainMap[domain] || 0) + 1
      }

      if (userId) {
        byUserId[userId] = (byUserId[userId] || 0) + 1
      }

      const minuteKey =
        `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')} ` +
        `${String(created.getHours()).padStart(2, '0')}:${String(created.getMinutes()).padStart(2, '0')}`

      byMinute[minuteKey] = (byMinute[minuteKey] || 0) + 1
    })

    const repeatedEmails = Object.entries(byEmail)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const repeatedUsers = Object.entries(byUserId)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const busiestMinutes = Object.entries(byMinute)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const topDomains = Object.entries(domainMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      repeatedEmails,
      repeatedUsers,
      busiestMinutes,
      topDomains
    }
  }, [periodVotes])

  const exportToCSV = () => {
    if (filteredVotes.length === 0) {
      alert('No hay votos para exportar')
      return
    }

    const headers = ['Ciudad', 'Lugar', 'Email', 'Fecha', 'User ID']
    const rows = filteredVotes.map(v => [
      v.city,
      v.place,
      v.email || 'N/A',
      new Date(v.created_at).toLocaleString('es-CO'),
      v.user_id || 'N/A'
    ])

    let csv = headers.join(',') + '\n'
    rows.forEach(r => {
      csv += r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n'
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `granimaster_dashboard_${Date.now()}.csv`
    link.click()
  }

  if (!isAuthed) {
    return (
      <div className="max-w-sm mx-auto mt-20 px-6">
        <div className="border border-zinc-800 rounded-xl p-8 bg-zinc-950">
          <h2 className="text-lg font-semibold mb-1 text-white">Panel de Supervisión</h2>
          <p className="text-zinc-500 text-xs mb-6">Acceso restringido</p>

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
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-[4px] uppercase text-zinc-500 mb-1">
            Supervisor · Auto refresh 30s
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">Panel de Supervisión</h1>
          <p className="text-xs text-zinc-500 mt-2">
            Período activo: {getDateRange().label}
          </p>
          {lastUpdated && (
            <p className="text-xs text-zinc-600 mt-1">
              Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadAll}
            disabled={loading || loadingHistorical}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition disabled:opacity-40"
          >
            <RefreshCw size={13} className={(loading || loadingHistorical) ? 'animate-spin' : ''} />
            Actualizar
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-zinc-200 transition"
          >
            <Download size={13} />
            Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 border border-red-900 bg-red-950/20 rounded-lg px-4 py-3 text-red-300 text-xs">
          <strong>Error al cargar:</strong> {error}
          <br />
          <span className="text-red-500">Revisa RLS, permisos de la tabla "votes" y límites de consulta.</span>
        </div>
      )}

      <div className="border border-zinc-800 rounded-xl p-5 mb-8 bg-zinc-950">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-zinc-500" />
          <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2">Período</label>
            <select
              value={rangeType}
              onChange={(e) => setRangeType(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
            >
              {RANGE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {rangeType === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2">Desde</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2">Hasta</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2">Ciudad</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="all">Todas</option>
              {Object.keys(PLACES).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2">Lugar</label>
            <select
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="all">Todos</option>
              {availablePlacesByCity.map(place => (
                <option key={place} value={place}>{place}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 xl:col-span-2">
            <label className="block text-[11px] uppercase tracking-widest text-zinc-500 mb-2">Buscar email</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 mb-4">
          Histórico general
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <KpiCard label="Total votos" value={historicalStats.totalVotes} loading={loadingHistorical} />
          <KpiCard label="Votantes únicos" value={historicalStats.uniqueVoters} loading={loadingHistorical} color="text-emerald-400" />
          <KpiCard label="Ciudades activas" value={historicalStats.citiesCount} loading={loadingHistorical} />
          <KpiCard label="Lugares activos" value={historicalStats.placesCount} loading={loadingHistorical} />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-zinc-400 mb-4">
          Período filtrado
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <KpiCard label="Votos del período" value={totalFilteredVotes} loading={loading} />
          <KpiCard label="Votantes únicos del período" value={periodUniqueVoters.size} loading={loading} color="text-cyan-400" />
          <KpiCard label="Ciudad líder" value={leaderCity} loading={loading} textClass="text-2xl" />
          <KpiCard label="Lugar líder" value={leaderPlace} loading={loading} textClass="text-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Votos por ciudad</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={periodCityChartData}>
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

        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950">
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays size={16} className="text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Votos por hora</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={votesByHour}>
                <CartesianGrid stroke="#27272a" vertical={false} />
                <XAxis dataKey="hora" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: '#ffffff08' }}
                />
                <Bar dataKey="votos" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {votesByDay.length > 1 && (
        <div className="border border-zinc-800 rounded-xl p-6 mb-6 bg-zinc-950">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={16} className="text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Evolución por día</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={votesByDay}>
                <CartesianGrid stroke="#27272a" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: '#ffffff08' }}
                />
                <Bar dataKey="votos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950">
          <div className="flex items-center gap-2 mb-5">
            <Trophy size={16} className="text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Top 3 general histórico</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {historicalTop3.length > 0 ? historicalTop3.map(([place, votos], i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-white">{place}</p>
                <p className="text-3xl font-mono font-bold text-white mt-2 tabular-nums">{votos}</p>
              </div>
            )) : (
              <p className="text-zinc-600 text-sm">Sin datos históricos</p>
            )}
          </div>
        </div>

        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950">
          <div className="flex items-center gap-2 mb-5">
            <Award size={16} className="text-zinc-400" />
            <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Top 3 del período</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {periodTop3.length > 0 ? periodTop3.map(([place, votos], i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-white">{place}</p>
                <p className="text-3xl font-mono font-bold text-white mt-2 tabular-nums">{votos}</p>
              </div>
            )) : (
              <p className="text-zinc-600 text-sm">Sin votos en este período</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={16} className="text-zinc-400" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Top 3 por ciudad del período</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {Object.keys(PLACES).map(city => {
            const top3 = periodTopByCity[city] || []
            return (
              <div key={city} className="border border-zinc-800 rounded-xl p-5 bg-zinc-950">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">{city}</h4>

                {top3.length > 0 ? top3.map(([place, votos], i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-900 last:border-none">
                    <span className="text-sm text-zinc-300">{i + 1}. {place}</span>
                    <span className="text-sm font-mono text-white tabular-nums">{votos}</span>
                  </div>
                )) : (
                  <p className="text-zinc-700 text-xs py-3">Sin votos en este período</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl p-6 mb-6 bg-zinc-950">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={16} className="text-zinc-400" />
          <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Anomalías y señales</h3>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AnomalyBlock
            title="Emails repetidos"
            emptyText="Sin repeticiones"
            rows={anomalies.repeatedEmails.map(([key, value]) => ({ key, value }))}
          />

          <AnomalyBlock
            title="User IDs repetidos"
            emptyText="Sin repeticiones"
            rows={anomalies.repeatedUsers.map(([key, value]) => ({ key, value }))}
          />

          <AnomalyBlock
            title="Minutos con más actividad"
            emptyText="Sin datos"
            rows={anomalies.busiestMinutes.map(([key, value]) => ({ key, value }))}
          />

          <AnomalyBlock
            title="Dominios más usados"
            emptyText="Sin dominios"
            rows={anomalies.topDomains.map(([key, value]) => ({ key, value }))}
          />
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-400">Votos del período</h3>
            <p className="text-xs text-zinc-600 mt-1">
              Mostrando {filteredVotes.length} registros filtrados · página {safePage + 1} de {totalPages}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTablePage(prev => Math.max(0, prev - 1))}
              disabled={safePage === 0}
              className="flex items-center gap-1 px-3 py-2 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>

            <button
              onClick={() => setTablePage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={safePage >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-2 border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-white disabled:opacity-40"
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-auto max-h-[560px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600 pr-6">Ciudad</th>
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600 pr-6">Lugar</th>
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600 pr-6">Email</th>
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600 pr-6">User ID</th>
                <th className="pb-3 text-xs font-semibold tracking-widest uppercase text-zinc-600">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pagedVotes.length > 0 ? (
                pagedVotes.map((v, i) => (
                  <tr key={`${v.created_at}-${v.email}-${i}`} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition">
                    <td className="py-3 pr-6 text-zinc-300">{v.city}</td>
                    <td className="py-3 pr-6 text-zinc-300">{v.place}</td>
                    <td className="py-3 pr-6 text-zinc-500 text-xs">{v.email || '—'}</td>
                    <td className="py-3 pr-6 text-zinc-600 text-xs">{v.user_id || '—'}</td>
                    <td className="py-3 text-zinc-600 text-xs">{new Date(v.created_at).toLocaleString('es-CO')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-zinc-700 text-sm">
                    {loading ? 'Cargando...' : 'No hay votos con esos filtros'}
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

function KpiCard({ label, value, loading, color = 'text-white', textClass = 'text-5xl' }) {
  return (
    <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-950">
      <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-2">{label}</p>
      <p className={`${textClass} font-mono font-bold tabular-nums ${color}`}>
        {loading ? '...' : value}
      </p>
    </div>
  )
}

function AnomalyBlock({ title, rows, emptyText }) {
  return (
    <div className="border border-zinc-800 rounded-xl p-4">
      <h4 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-3">{title}</h4>
      {rows.length > 0 ? rows.map((row, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-900 last:border-none gap-3">
          <span className="text-sm text-zinc-300 break-all">{row.key}</span>
          <span className="text-sm font-mono text-white tabular-nums shrink-0">{row.value}</span>
        </div>
      )) : (
        <p className="text-zinc-700 text-xs">{emptyText}</p>
      )}
    </div>
  )
}

function formatDateInput(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}