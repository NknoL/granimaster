import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'

const PLACES = {
  Bucaramanga: ["Granifreseo", "Mundo8ice", "Frozen Shark", "Trinislush", "Granibucaros", "Crack granizados", "Tamy ice", "420Slushy", "Mafia cocktails", "Necati cocktails", "Granilocos", "Eclipse cocktail", "Blueice", "Ice flow", "Nova ice"],
  Girón: ["Graniizu ice", "Luna yena", "Urban slush", "Exotic slush", "Cool hot"],
  Floridablanca: ["Refreshment station", "Granifreseo", "Crazy Drinks", "Portal granizados", "Spacebuddies", "Mafia"]
}

export default function VotingPage() {
  const [activeCity, setActiveCity] = useState('Bucaramanga')
  const [counts, setCounts] = useState({})
  const [voted, setVoted] = useState({})
  const [currentUser, setCurrentUser] = useState(null)

  // Cargar usuario actual y votos
  useEffect(() => {
    const loadUserAndVotes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Cargar conteos
      await fetchCounts()

      // Si hay usuario logueado, cargamos sus votos desde la base de datos
      if (user) {
        const { data } = await supabase
          .from('votes')
          .select('city, place')
          .eq('user_id', user.id)

        if (data) {
          const userVotes = {}
          data.forEach(v => {
            userVotes[v.city] = v.place
          })
          setVoted(userVotes)
        }
      } else {
        // Si no está logueado, usamos localStorage (modo invitado)
        const saved = localStorage.getItem('granimaster_voted')
        if (saved) setVoted(JSON.parse(saved))
      }
    }

    loadUserAndVotes()
  }, [])

  const fetchCounts = async () => {
    const { data } = await supabase.from('votes').select('city, place')
    const grouped = {}
    data?.forEach(vote => {
      if (!grouped[vote.city]) grouped[vote.city] = {}
      grouped[vote.city][vote.place] = (grouped[vote.city][vote.place] || 0) + 1
    })
    setCounts(grouped)
  }

  const handleVote = async (city, place) => {
    const { data: { user } } = await supabase.auth.getUser()

    // Si está logueado, verificamos en la base de datos
    if (user) {
      const { data: existing } = await supabase
        .from('votes')
        .select('id')
        .eq('user_id', user.id)
        .eq('city', city)
        .single()

      if (existing) {
        toast.error(`Ya votaste en ${city}`)
        return
      }
    } else {
      // Modo invitado (sin login)
      if (voted[city]) {
        toast.error(`Ya votaste en ${city}`)
        return
      }
    }

    // Insertar voto
    const { error } = await supabase.from('votes').insert({
      city,
      place,
      email: user?.email || null,
      user_id: user?.id || null
    })

    if (error) {
      toast.error('Error al registrar el voto')
      return
    }

    // Actualizar estado local
    const newVoted = { ...voted, [city]: place }
    setVoted(newVoted)

    if (!user) {
      localStorage.setItem('granimaster_voted', JSON.stringify(newVoted))
    }

    toast.success('¡Voto registrado!', { description: `${place} en ${city}` })
    fetchCounts()
  }

  const cityPlaces = PLACES[activeCity] || []
  const cityCounts = counts[activeCity] || {}

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium tracking-[3px] mb-4">
          CONCURSO 2026
        </div>
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">Elige el mejor granizado</h1>
        <p className="text-xl text-zinc-400 mt-3">Vota por tu lugar favorito. Un voto por ciudad.</p>
        
        {currentUser && (
          <p className="text-sm text-cyan-400 mt-2">Logueado como: {currentUser.email}</p>
        )}
      </div>

      <CityTabs active={activeCity} onChange={setActiveCity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {cityPlaces.map(place => (
          <PlaceCard
            key={place}
            place={place}
            count={cityCounts[place] || 0}
            hasVoted={voted[activeCity]}
            onVote={() => handleVote(activeCity, place)}
          />
        ))}
      </div>
    </div>
  )
}