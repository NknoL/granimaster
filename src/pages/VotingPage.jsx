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

const MOSTRAR_CONTEOS = false

export default function VotingPage() {
  const [activeCity, setActiveCity] = useState('Bucaramanga')
  const [counts, setCounts] = useState({})
  const [voted, setVoted] = useState({})
  const [showCedulaModal, setShowCedulaModal] = useState(false)
  const [cedulaInput, setCedulaInput] = useState('')
  const [selectedPlace, setSelectedPlace] = useState(null)

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

  // Abrir modal para pedir cédula
  const handleVoteClick = (place) => {
    if (voted[activeCity]) {
      toast.error(`Ya votaste en ${activeCity}`, {
        description: 'Solo puedes votar una vez por ciudad.'
      })
      return
    }
    setSelectedPlace(place)
    setCedulaInput('')
    setShowCedulaModal(true)
  }

  // Registrar voto con cédula
  const submitVoteWithCedula = async () => {
    if (!cedulaInput.trim()) {
      toast.error('Por favor ingresa tu número de cédula')
      return
    }

    // Verificar si ya votó con esa cédula en esta ciudad
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('city', activeCity)
      .eq('cedula', cedulaInput.trim())
      .maybeSingle()

    if (existingVote) {
      toast.error('Ya votaste con esta cédula en esta ciudad')
      setShowCedulaModal(false)
      return
    }

    // Registrar el voto
    const { error } = await supabase
      .from('votes')
      .insert({
        city: activeCity,
        place: selectedPlace,
        cedula: cedulaInput.trim()
      })

    if (error) {
      toast.error('Error al registrar el voto')
      return
    }

    // Marcar como votado en este navegador
    const newVoted = { ...voted, [activeCity]: selectedPlace }
    setVoted(newVoted)
    localStorage.setItem('granimaster_voted', JSON.stringify(newVoted))

    toast.success('¡Voto registrado correctamente!', {
      description: `${selectedPlace} en ${activeCity}`
    })

    setShowCedulaModal(false)
    setCedulaInput('')
    fetchCounts()
  }

  const cityPlaces = PLACES[activeCity] || []
  const cityCounts = counts[activeCity] || {}

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
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

      {/* Grid de lugares */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {cityPlaces.map(placeObj => (
          <PlaceCard
            key={placeObj.name}
            place={placeObj.name}
            instagram={placeObj.instagram}
            count={MOSTRAR_CONTEOS ? (cityCounts[placeObj.name] || 0) : 0}
            hasVoted={voted[activeCity]}
            onVote={() => handleVoteClick(placeObj.name)}
          />
        ))}
      </div>

      {/* Modal para pedir Cédula */}
      {showCedulaModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-2xl font-bold mb-2">Verificación de identidad</h3>
            <p className="text-zinc-400 mb-6">
              Ingresa tu número de cédula para registrar tu voto en <strong>{activeCity}</strong>
            </p>

            <input
              type="text"
              value={cedulaInput}
              onChange={(e) => setCedulaInput(e.target.value)}
              placeholder="Número de cédula"
              className="w-full bg-black border border-zinc-700 focus:border-cyan-500 rounded-2xl px-5 py-4 text-xl tracking-widest text-center outline-none mb-6"
              onKeyDown={(e) => e.key === 'Enter' && submitVoteWithCedula()}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCedulaModal(false)
                  setCedulaInput('')
                }}
                className="flex-1 py-3 rounded-2xl border border-zinc-700 hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={submitVoteWithCedula}
                className="flex-1 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-cyan-400 transition"
              >
                Confirmar Voto
              </button>
            </div>

            <p className="text-center text-[10px] text-zinc-500 mt-4">
              Tu cédula solo se usa para evitar votos duplicados.
            </p>
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-xs text-zinc-500">
          {MOSTRAR_CONTEOS 
            ? "Los resultados se actualizan en tiempo real" 
            : "Los conteos se mostrarán cuando termine el concurso"}
        </p>
      </div>
    </div>
  )
}