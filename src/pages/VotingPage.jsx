import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'

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

  const fetchCounts = async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('city, place')

    if (error) {
      console.error('Error fetching votes:', error)
      return
    }

    const grouped = {}
    data.forEach(vote => {
      if (!grouped[vote.city]) grouped[vote.city] = {}
      grouped[vote.city][vote.place] = (grouped[vote.city][vote.place] || 0) + 1
    })
    setCounts(grouped)
  }

  useEffect(() => {
    fetchCounts()

    const savedVotes = localStorage.getItem('granimaster_voted')
    if (savedVotes) {
      setVoted(JSON.parse(savedVotes))
    }
  }, [])

  const handleVote = async (city, place) => {
    if (voted[city]) {
      toast.error(`Ya votaste en ${city}`, {
        description: 'Solo puedes votar una vez por ciudad.'
      })
      return
    }

    const { error } = await supabase
      .from('votes')
      .insert({ city, place })

    if (error) {
      toast.error('Error al registrar el voto', {
        description: 'Intenta de nuevo en unos segundos.'
      })
      return
    }

    const newVoted = { ...voted, [city]: place }
    setVoted(newVoted)
    localStorage.setItem('granimaster_voted', JSON.stringify(newVoted))

    toast.success(`¡Voto registrado!`, {
      description: `${place} en ${city}`
    })

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
        <p className="text-xl text-zinc-400 mt-3 max-w-md mx-auto">
          Vota por tu lugar favorito en tu ciudad. Un voto por ciudad.
        </p>
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

      <div className="mt-12 text-center">
        <p className="text-xs text-zinc-500">
          Los resultados se actualizan en tiempo real • Tus votos se guardan en este navegador
        </p>
      </div>
    </div>
  )
}