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
  Girón: ["Graniizu ice", "Luna yena", "Urban slush", "Exotic slush", "Cool hot"],
  Floridablanca: ["Refreshment station", "Granifreseo", "Crazy Drinks", "Portal granizados", "Spacebuddies", "Mafia"]
}

export default function VotingPage() {
  const [activeCity, setActiveCity] = useState('Bucaramanga')
  const [counts, setCounts] = useState({})
  const [voted, setVoted] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      const promises = [supabase.from('votes').select('city, place')]

      if (currentUser) {
        promises.push(supabase.from('votes').select('city, place').eq('user_id', currentUser.id))
      }

      const [allVotesRes, userVotesRes] = await Promise.all(promises)

      const grouped = {}
      allVotesRes.data?.forEach(vote => {
        if (!grouped[vote.city]) grouped[vote.city] = {}
        grouped[vote.city][vote.place] = (grouped[vote.city][vote.place] || 0) + 1
      })
      setCounts(grouped)

      if (userVotesRes?.data) {
        const userVoted = {}
        userVotesRes.data.forEach(v => {
          userVoted[v.city] = v.place
        })
        setVoted(userVoted)
      }

      setLoading(false)
    }

    loadData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)

      if (currentUser) {
        const { data } = await supabase.from('votes').select('city, place').eq('user_id', currentUser.id)
        const userVoted = {}
        data?.forEach(v => { userVoted[v.city] = v.place })
        setVoted(userVoted)
      } else {
        setVoted({})
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ====================== NUEVA LÓGICA: 5 segundos de carga ======================
  useEffect(() => {
    let timer

    if (loading) {
      timer = setTimeout(() => {
        // Si después de 5 segundos sigue cargando
        alert("CONEXION DE INTERNET INESTABLE")

        // Limpiar almacenamiento
        localStorage.clear()
        sessionStorage.clear()

        if ('caches' in window) {
          caches.keys().then(keys => keys.forEach(key => caches.delete(key)))
        }

        // Recargar la página
        window.location.reload()
      }, 5000) // 5 segundos
    }

    return () => clearTimeout(timer)
  }, [loading])
  // ============================================================================

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setVoted({})
    toast.success('Sesión cerrada')
  }

  const handleVote = async (city, place) => {
    if (!user) {
      await signInWithGoogle()
      return
    }

    if (voted[city]) {
      toast.error(`Ya votaste en ${city}`)
      return
    }

    const { error } = await supabase.from('votes').insert({
      city,
      place,
      email: user.email,
      user_id: user.id
    })

    if (error) {
      if (error.code === '23505') {
        toast.error(`Ya votaste en ${city}`)
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4">
          <div>
            <span className="text-sm text-zinc-400">Conectado como:</span>{' '}
            <span className="font-medium text-white">{user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-5 py-2 text-sm rounded-xl bg-zinc-800 hover:bg-red-950 text-red-400 w-full md:w-auto"
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
            className="px-8 py-3.5 bg-white text-black font-semibold rounded-2xl flex items-center gap-3 mx-auto hover:bg-cyan-400 transition"
          >
            <LogIn size={20} /> Iniciar sesión con Google para votar
          </button>
        </div>
      )}
    </div>
  )
}