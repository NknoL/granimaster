import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'
import { LogIn, LogOut } from 'lucide-react'

const PLACES = {
  Bucaramanga: ["Granifreseo", "Mundo8ice", "Frozen Shark", "Trinislush", "Granibucaros", "Crack granizados", "Tamy ice", "420Slushy", "Mafia cocktails", "Necati cocktails", "Granilocos", "Eclipse cocktail", "Blueice", "Ice flow", "Nova ice"],
  Girón: ["Graniizu ice", "Luna yena", "Urban slush", "Exotic slush", "Cool hot"],
  Floridablanca: ["Refreshment station", "Granifreseo", "Crazy Drinks", "Portal granizados", "Spacebuddies", "Mafia"]
}

export default function VotingPage() {
  const [activeCity, setActiveCity] = useState('Bucaramanga')
  const [counts, setCounts] = useState({})
  const [voted, setVoted] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar usuario + votos cuando cambia el estado de auth
  useEffect(() => {
    const loadData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        await loadUserVotes(currentUser.id)
      } else {
        setVoted({})
      }

      await fetchCounts()
      setLoading(false)
    }

    loadData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null
        setUser(currentUser)

        if (currentUser) {
          await loadUserVotes(currentUser.id)
        } else {
          setVoted({})
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Cargar los votos que ya hizo este usuario
  const loadUserVotes = async (userId) => {
    const { data } = await supabase
      .from('votes')
      .select('city, place')
      .eq('user_id', userId)

    const userVotes = {}
    data?.forEach(v => {
      userVotes[v.city] = v.place
    })
    setVoted(userVotes)
  }

  const fetchCounts = async () => {
    const { data } = await supabase.from('votes').select('city, place')
    const grouped = {}
    data?.forEach(vote => {
      if (!grouped[vote.city]) grouped[vote.city] = {}
      grouped[vote.city][vote.place] = (grouped[vote.city][vote.place] || 0) + 1
    })
    setCounts(grouped)
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) toast.error('Error al iniciar sesión')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setVoted({})
    toast.success('Sesión cerrada correctamente')
  }

  const handleVote = async (city, place) => {
    if (!user) {
      toast.loading('Redirigiendo a Google...')
      await signInWithGoogle()
      return
    }

    // === CHEQUEO MEJORADO Y SEGURO ===
    const { data: existing, error } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('city', city)

    if (error) {
      console.error(error)
      toast.error('Error verificando votos anteriores')
      return
    }

    if (existing && existing.length > 0) {
      toast.error(`Ya votaste en ${city}`)
      return
    }

    // Insertar voto
    const { error: insertError } = await supabase.from('votes').insert({
      city,
      place,
      email: user.email,
      user_id: user.id
    })

    if (insertError) {
      toast.error('Error al registrar el voto')
      return
    }

    // Actualizar estado local
    const newVoted = { ...voted, [city]: place }
    setVoted(newVoted)

    toast.success('¡Voto registrado!', { description: `${place} en ${city}` })
    fetchCounts()
  }

  if (loading) {
    return <div className="text-center py-20 text-zinc-400">Cargando...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium tracking-[3px] mb-4">
          CONCURSO 2026
        </div>
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">Elige el mejor granizado</h1>
        <p className="text-xl text-zinc-400 mt-3">Inicia sesión con Google • 1 voto por ciudad</p>
      </div>

      {user && (
        <div className="flex justify-between items-center mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-3">
          <div className="text-sm">
            <span className="text-zinc-400">Conectado como:</span>{' '}
            <span className="text-white font-medium">{user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-zinc-800 hover:bg-red-950 text-red-400 transition"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}

      <CityTabs active={activeCity} onChange={setActiveCity} />

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

      {!user && (
        <div className="mt-10 text-center">
          <button
            onClick={signInWithGoogle}
            className="px-8 py-3 bg-white text-black font-semibold rounded-2xl flex items-center gap-2 mx-auto hover:bg-cyan-400 hover:text-black transition"
          >
            <LogIn size={18} /> Iniciar sesión con Google para votar
          </button>
          <p className="text-xs text-zinc-500 mt-3">Debes iniciar sesión para poder votar</p>
        </div>
      )}
    </div>
  )
}