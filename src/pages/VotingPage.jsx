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
      toast.error('Por favor ingresa tu número de cédula')
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

    toast.success('¡Voto registrado con éxito!')
    setShowCedulaModal(false)
    setCedulaInput('')
    setIsSubmitting(false)
    fetchCounts()
  }

  const cityPlaces = PLACES[activeCity] || []

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium tracking-[3px] mb-4">
          CONCURSO 2026
        </div>
        <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-3">
          Elige el mejor granizado
        </h1>
        <p className="text-xl text-zinc-400 max-w-md mx-auto">
          Vota por tu lugar favorito. Un voto por ciudad.
        </p>
      </div>

      {/* Tabs de ciudades */}
      {!CONCURSO_FINALIZADO && (
        <div className="mb-8">
          <CityTabs active={activeCity} onChange={setActiveCity} />
        </div>
      )}

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cityPlaces.map(placeObj => (
          <PlaceCard
            key={placeObj.name}
            place={placeObj.name}
            instagram={placeObj.instagram}
            hasVoted={voted[activeCity]}
            onVote={() => handleVoteClick(placeObj.name)}
          />
        ))}
      </div>

      {/* Modal de Cédula - Mejorado */}
      {showCedulaModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-4xl">🪪</span>
              </div>
              <h3 className="text-2xl font-bold">Verificación de identidad</h3>
              <p className="text-zinc-400 mt-2 text-sm">
                Ingresa tu cédula para registrar tu voto en <strong>{activeCity}</strong>
              </p>
            </div>

            <div className="mb-6">
              <label className="text-xs text-zinc-400 block mb-2">NÚMERO DE CÉDULA</label>
              <input
                type="text"
                value={cedulaInput}
                onChange={(e) => setCedulaInput(e.target.value)}
                placeholder="Ej: 1098765432"
                className="w-full bg-black border border-zinc-700 focus:border-[#D4AF77] rounded-2xl px-6 py-4 text-2xl tracking-[4px] text-center outline-none font-mono"
                disabled={isSubmitting}
                onKeyDown={(e) => e.key === 'Enter' && submitVote()}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCedulaModal(false)
                  setCedulaInput('')
                }}
                className="flex-1 py-3.5 rounded-2xl border border-zinc-700 hover:bg-zinc-800 transition text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={submitVote}
                disabled={isSubmitting || !cedulaInput.trim()}
                className="flex-1 py-3.5 rounded-2xl bg-[#D4AF77] text-black font-semibold hover:bg-[#f0d9b0] transition disabled:opacity-60 text-sm"
              >
                {isSubmitting ? "Registrando voto..." : "Confirmar mi voto"}
              </button>
            </div>

            <p className="text-center text-[10px] text-zinc-500 mt-5">
              Tu cédula solo se utiliza para evitar votos duplicados.
            </p>
          </div>
        </div>
      )}

      <div className="mt-12 text-center text-xs text-zinc-500">
        {CONCURSO_FINALIZADO 
          ? "Resultados oficiales del concurso" 
          : "Los conteos se activarán al finalizar el concurso"}
      </div>
    </div>
  )
}