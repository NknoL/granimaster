import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'
import { LogIn, LogOut } from 'lucide-react'

const PLACES = {
  Bucaramanga: [
    "Granifreseo", "Mundo8ice", "Frozen Shark", "Trinislush", "Granibucaros",
    "Crack granizados", "Tamy ice", "420Slushy", "Mafia cocktails", "Necati cocktails",
    "Granilocos", "Eclipse cocktail", "Blueice", "Ice flow", "Nova ice"
  ],
  Girón: [
    "Graniizu ice", "Luna yena", "Urban slush", "Exotic slush", "Cool hot"
  ],
  Floridablanca: [
    "Refreshment station", "Granifreseo", "Crazy Drinks", "Portal granizados", "Spacebuddies", "Mafia"
  ]
}

export default function VotingPage() {
  const [activeCity, setActiveCity] = useState('Bucaramanga')
  const [counts, setCounts] = useState({})
  const [voted, setVoted] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserVotes = async (currentUser) => {
    if (!currentUser) {
      setVoted({})
      return
    }
    const { data, error } = await supabase
      .from('votes')
      .select('city, place')
      .eq('user_id', currentUser.id)

    if (!error && data) {
      const userVoted = {}
      data.forEach(v => { userVoted[v.city] = v.place })
      setVoted(userVoted)
    }
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      await loadUserVotes(currentUser)

      const { data: allVotes } = await supabase.from('votes').select('city, place')
      const grouped = {}
      allVotes?.forEach(vote => {
        if (!grouped[vote.city]) grouped[vote.city] = {}
        grouped[vote.city][vote.place] = (grouped[vote.city][vote.place] || 0) + 1
      })
      setCounts(grouped)
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null
        setUser(currentUser)
        await loadUserVotes(currentUser)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let timer
    if (loading) {
      timer = setTimeout(() => {
        alert("CONEXION DE INTERNET INESTABLE")
        localStorage.clear()
        sessionStorage.clear()
        if ('caches' in window) {
          caches.keys().then(keys => keys.forEach(key => caches.delete(key)))
        }
        window.location.reload()
      }, 5000)
    }
    return () => clearTimeout(timer)
  }, [loading])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setVoted({})
    toast.success('Sesión cerrada correctamente')
  }

  const handleVote = async (city, place) => {
    if (!user) {
      await signInWithGoogle()
      return
    }
    if (voted[city]) return

    const { error } = await supabase.from('votes').insert({
      city,
      place,
      email: user.email,
      user_id: user.id
    })

    if (error) {
      if (error.code === '23505') {
        await loadUserVotes(user)
      } else {
        toast.error('Error al registrar el voto')
      }
      return
    }

    setVoted(prev => ({ ...prev, [city]: place }))
    toast.success('¡Voto registrado!', { description: `${place} en ${city}` })

    setCounts(prev => {
      const newCounts = { ...prev }
      if (!newCounts[city]) newCounts[city] = {}
      newCounts[city][place] = (newCounts[city][place] || 0) + 1
      return newCounts
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* ─── Fondo con imagen translúcida + capa neon ─── */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}   // ← pon aquí tu imagen
      />
      {/* Overlay oscuro para que el texto sea legible */}
      <div className="fixed inset-0 -z-10 bg-zinc-950/80 backdrop-blur-[2px]" />

      {/* Glow neon ambiental — esquinas */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-400/5 rounded-full blur-3xl" />
      </div>

      {/* ─── Contenido ─── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-[4px] border border-cyan-400/20 mb-5 uppercase">
            Concurso 2026
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter leading-none">
            <span className="text-white">Elige el mejor</span>
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(90deg, #22d3ee, #a855f7, #22d3ee)', backgroundSize: '200%' }}
            >
              granizado
            </span>
          </h1>
          <p className="text-zinc-400 mt-4 text-lg">
            Inicia sesión con Google &nbsp;·&nbsp; 1 voto por ciudad
          </p>
        </div>

        {/* Barra de usuario */}
        {user && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-zinc-900/70 border border-zinc-800 backdrop-blur-sm rounded-2xl px-6 py-4">
            <div>
              <span className="text-sm text-zinc-400">Conectado como:</span>{' '}
              <span className="font-medium text-white">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-5 py-2 text-sm rounded-xl bg-zinc-800 hover:bg-red-950 text-red-400 w-full md:w-auto transition"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        )}

        {/* Tabs de ciudad */}
        <CityTabs active={activeCity} onChange={setActiveCity} />

        {/* Grid de lugares */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {PLACES[activeCity]?.map(place => (
            <PlaceCard
              key={place}
              place={place}
              count={counts[activeCity]?.[place] || 0}
              hasVoted={voted[activeCity]}
              onVote={() => handleVote(activeCity, place)}
            />
          ))}
        </div>

        {/* CTA login */}
        {!user && (
          <div className="mt-12 text-center">
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-400/10 text-sm"
            >
              <LogIn size={18} />
              Iniciar sesión con Google para votar
            </button>
          </div>
        )}

        <p className="text-center text-xs text-zinc-600 mt-10">
          Los resultados se actualizan en tiempo real · 1 voto por ciudad
        </p>
      </div>
    </div>
  )
}