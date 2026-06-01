import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'
import { motion, AnimatePresence } from 'framer-motion'

const PLACES = { /* ... (igual que antes) */ }

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

    toast.success('¡Voto registrado con éxito!')
    setShowCedulaModal(false)
    setCedulaInput('')
    setIsSubmitting(false)
    fetchCounts()
  }

  const cityPlaces = PLACES[activeCity] || []

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 relative">
      
      {/* Fondo translúcido con avatar */}
      <div className="absolute inset-0 bg-[url('/avatar.jpg')] bg-cover bg-center opacity-10 pointer-events-none"></div>

      {/* Contenido */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium tracking-[3px] mb-4">
            CONCURSO 2026
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">Elige el mejor granizado</h1>
          <p className="text-xl text-zinc-400 mt-3">Vota por tu lugar favorito. Un voto por ciudad.</p>
        </div>

        {!CONCURSO_FINALIZADO && <CityTabs active={activeCity} onChange={setActiveCity} />}

        {/* Tarjetas con animación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {cityPlaces.map((placeObj, index) => (
            <PlaceCard
              key={placeObj.name}
              place={placeObj.name}
              instagram={placeObj.instagram}
              hasVoted={voted[activeCity]}
              onVote={() => handleVoteClick(placeObj.name)}
            />
          ))}
        </div>
      </div>

      {/* Modal con animación */}
      <AnimatePresence>
        {showCedulaModal && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-8"
            >
              {/* Contenido del modal igual que antes */}
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                  <span className="text-4xl">🪪</span>
                </div>
                <h3 className="text-2xl font-bold">Verificación de identidad</h3>
                <p className="text-zinc-400 mt-2 text-sm">
                  Ingresa tu cédula para confirmar tu voto en <strong>{activeCity}</strong>
                </p>
              </div>

              <input
                type="text"
                value={cedulaInput}
                onChange={(e) => setCedulaInput(e.target.value)}
                placeholder="Número de cédula"
                className="w-full bg-black border border-zinc-700 focus:border-[#D4AF77] rounded-2xl px-6 py-4 text-2xl tracking-[4px] text-center outline-none mb-6 font-mono"
                disabled={isSubmitting}
              />

              <div className="flex gap-3">
                <button onClick={() => setShowCedulaModal(false)} className="flex-1 py-3.5 rounded-2xl border border-zinc-700 hover:bg-zinc-800 transition">
                  Cancelar
                </button>
                <button onClick={submitVote} disabled={isSubmitting || !cedulaInput.trim()} className="flex-1 py-3.5 rounded-2xl bg-[#D4AF77] text-black font-semibold hover:bg-[#f0d9b0] transition">
                  {isSubmitting ? "Registrando..." : "Confirmar Voto"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}