import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'

const PLACES = {
  Bucaramanga: [
    { name: "Granifreseo", instagram: "@granifreseo11" },
    { name: "Mundo8ice", instagram: "@granizados_mundo8ice_bga" },
    { name: "Frozen Shark", instagram: "@frozenshark_11" },
    { name: "Trinislush", instagram: "@trinislush" },
    { name: "Granibucaros", instagram: "@grani_bucaros" },
    { name: "Crack granizados", instagram: "@crack.granizados" },
    { name: "Tamy ice", instagram: "@tamy_ice" },
    { name: "420Slushy", instagram: "@420slushy_" },
    { name: "Mafia cocktails", instagram: "@mafiacocktails" },
    { name: "Necati cocktails", instagram: "@necati.cocktails" },
    { name: "Granilocos", instagram: "@granilocos__oficial" },
    { name: "Eclipse cocktail", instagram: "@eclipsecocktail" },
    { name: "Blueice", instagram: "@blueicegranizado" },
    { name: "Ice flow", instagram: "@iceflowbga" },
    { name: "Nova ice", instagram: "@novaiceoficiall" }
  ],
  Girón: [
    { name: "Graniizu ice", instagram: "@graniizu_ice" },
    { name: "Luna yena", instagram: "@granizadoslunayena" },
    { name: "Urban slush", instagram: "@urban_slush" },
    { name: "Exotic slush", instagram: "@exoticslushbga" },
    { name: "Cool hot", instagram: "@granizadoscoolhot" }
  ],
  Floridablanca: [
    { name: "Refreshment station", instagram: "@refreshment_station" },
    { name: "Crazy Drinks", instagram: "@crazydrinks30" },
    { name: "Portal granizados", instagram: "@portal_granizados" },
    { name: "Spacebuddies", instagram: "@spacebuddiesoficial" },
    { name: "Mafia", instagram: "@mafia_lacumbre" },
    { name: "Granifreseo", instagram: "@granifreseo11" }
  ]
}

const CONCURSO_FINALIZADO = false

export default function VotingPage() {
  const [activeCity, setActiveCity] = useState('Bucaramanga')
  const [counts, setCounts] = useState({})
  const [voted, setVoted] = useState({})
  const [showCedulaModal, setShowCedulaModal] = useState(false)
  const [cedulaInput, setCedulaInput] = useState('')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCounts = async () => {
    const { data } = await supabase.from('votes').select('city, place')
    const grouped = {}
    data?.forEach(vote => {
      if (!grouped[vote.city]) grouped[vote.city] = {}
      grouped[vote.city][vote.place] = (grouped[vote.city][vote.place] || 0) + 1
    })
    setCounts(grouped)
  }

  useEffect(() => {
    fetchCounts()
    const saved = localStorage.getItem('granimaster_voted')
    if (saved) setVoted(JSON.parse(saved))
  }, [])

  const handleVoteClick = (place) => {
    if (voted[activeCity]) {
      toast.error(`Ya votaste en ${activeCity}`)
      return
    }
    setSelectedPlace(place)
    setCedulaInput('')
    setShowCedulaModal(true)
  }

  const submitVote = async () => {
    if (!cedulaInput.trim()) {
      toast.error('Ingresa tu número de cédula')
      return
    }
    setIsSubmitting(true)

    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('city', activeCity)
      .eq('cedula', cedulaInput.trim())
      .maybeSingle()

    if (existing) {
      toast.error('Ya votaste con esta cédula en esta ciudad')
      setIsSubmitting(false)
      setShowCedulaModal(false)
      return
    }

    const { error } = await supabase.from('votes').insert({
      city: activeCity,
      place: selectedPlace,
      cedula: cedulaInput.trim()
    })

    if (error) {
      toast.error('Error al registrar el voto')
      setIsSubmitting(false)
      return
    }

    const newVoted = { ...voted, [activeCity]: selectedPlace }
    setVoted(newVoted)
    localStorage.setItem('granimaster_voted', JSON.stringify(newVoted))

    toast.success('¡Voto registrado!')
    setShowCedulaModal(false)
    setCedulaInput('')
    setIsSubmitting(false)
    fetchCounts()
  }

  const cityPlaces = PLACES[activeCity] || []

  // === Calcular Top 3 General y por ciudad ===
  const allPlacesWithVotes = []
  Object.keys(PLACES).forEach(city => {
    PLACES[city].forEach(place => {
      allPlacesWithVotes.push({
        city,
        name: place.name,
        votos: counts[city]?.[place.name] || 0
      })
    })
  })

  const top3General = [...allPlacesWithVotes]
    .sort((a, b) => b.votos - a.votos)
    .slice(0, 3)

  const getTop3ByCity = (city) => {
    return PLACES[city]
      .map(p => ({
        name: p.name,
        votos: counts[city]?.[p.name] || 0
      }))
      .sort((a, b) => b.votos - a.votos)
      .slice(0, 3)
  }

  if (CONCURSO_FINALIZADO) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
            CONCURSO FINALIZADO
          </div>
          <h1 className="text-6xl font-bold tracking-tighter">Resultados Oficiales</h1>
        </div>

        {/* Top 3 General */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-center">🏆 Top 3 General</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3General.map((place, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center">
                <div className="text-4xl mb-2">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</div>
                <div className="font-semibold text-lg">{place.name}</div>
                <div className="text-sm text-zinc-400">{place.city}</div>
                <div className="text-4xl font-mono font-bold text-cyan-400 mt-2">{place.votos}</div>
                <div className="text-sm text-zinc-400">votos</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 3 por Ciudad */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-center">Top 3 por Ciudad</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Object.keys(PLACES).map(city => {
              const top3 = getTop3ByCity(city)
              return (
                <div key={city} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                  <h3 className="font-semibold text-xl mb-4 text-center">{city}</h3>
                  <div className="space-y-4">
                    {top3.map((place, index) => (
                      <div key={index} className="flex justify-between items-center border-b border-zinc-800 pb-3 last:border-none">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                          <span className="font-medium">{place.name}</span>
                        </div>
                        <span className="font-mono text-cyan-400 font-semibold">{place.votos} votos</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Modo votación normal
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium tracking-[3px] mb-4">
          CONCURSO 2026
        </div>
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">Elige el mejor granizado</h1>
      </div>

      <CityTabs active={activeCity} onChange={setActiveCity} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {PLACES[activeCity].map(placeObj => (
          <PlaceCard
            key={placeObj.name}
            place={placeObj.name}
            instagram={placeObj.instagram}
            count={0}
            hasVoted={voted[activeCity]}
            onVote={() => handleVoteClick(placeObj.name)}
          />
        ))}
      </div>

      {/* Modal de Cédula */}
      {showCedulaModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">🪪</span>
              </div>
              <h3 className="text-2xl font-bold">Verificación de Voto</h3>
              <p className="text-zinc-400 mt-2 text-sm">
                Ingresa tu cédula para confirmar tu voto en <strong>{activeCity}</strong>
              </p>
            </div>

            <input
              type="text"
              value={cedulaInput}
              onChange={(e) => setCedulaInput(e.target.value)}
              placeholder="Número de cédula"
              className="w-full bg-black border border-zinc-700 focus:border-cyan-500 rounded-2xl px-6 py-4 text-2xl tracking-[6px] text-center outline-none mb-6 font-mono"
              disabled={isSubmitting}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCedulaModal(false)}
                className="flex-1 py-3.5 rounded-2xl border border-zinc-700 hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={submitVote}
                disabled={isSubmitting || !cedulaInput.trim()}
                className="flex-1 py-3.5 rounded-2xl bg-white text-black font-semibold hover:bg-cyan-400 transition"
              >
                {isSubmitting ? "Registrando..." : "Confirmar Voto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}