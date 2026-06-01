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
    if (!currentUser) { setVoted({}); return }
    const { data, error } = await supabase
      .from('votes').select('city, place').eq('user_id', currentUser.id)
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
        if ('caches' in window) caches.keys().then(keys => keys.forEach(key => caches.delete(key)))
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
    if (!user) { await signInWithGoogle(); return }
    if (voted[city]) return
    const { error } = await supabase.from('votes').insert({
      city, place, email: user.email, user_id: user.id
    })
    if (error) {
      if (error.code === '23505') { await loadUserVotes(user) }
      else { toast.error('Error al registrar el voto') }
      return
    }
    setVoted(prev => ({ ...prev, [city]: place }))
    toast.success('¡Voto registrado!', { description: `${place} en ${city}` })
    setCounts(prev => {
      const n = { ...prev }
      if (!n[city]) n[city] = {}
      n[city][place] = (n[city][place] || 0) + 1
      return n
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Encabezado */}
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-[4px] uppercase text-zinc-500 mb-2">
          Concurso 2026
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Elige el mejor granizado
        </h1>
        <p className="text-sm text-zinc-500 mt-2">
          Inicia sesión con Google · 1 voto por ciudad
        </p>
      </div>

      {/* Barra de usuario */}
      {user && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8 border border-zinc-800 rounded-xl px-5 py-3">
          <div className="text-sm">
            <span className="text-zinc-500">Conectado como </span>
            <span className="text-white">{user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900 transition w-full md:w-auto justify-center"
          >
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      )}

      <CityTabs active={activeCity} onChange={setActiveCity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
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

      {!user && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition"
          >
            <LogIn size={16} /> Iniciar sesión con Google para votar
          </button>
        </div>
      )}

      <p className="text-center text-xs text-zinc-700 mt-12">
        Resultados en tiempo real · 1 voto por ciudad
      </p>
    </div>
  )
}