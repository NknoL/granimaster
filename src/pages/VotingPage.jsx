import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'
import { LogOut, User } from 'lucide-react'

const PLACES = {
  Bucaramanga: [ /* tus lugares */ ],
  Girón: [ /* tus lugares */ ],
  Floridablanca: [ /* tus lugares */ ]
}

const CONCURSO_FINALIZADO = false

export default function VotingPage() {
  const [activeCity, setActiveCity] = useState('Bucaramanga')
  const [counts, setCounts] = useState({})
  const [voted, setVoted] = useState({})
  const [user, setUser] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Obtener usuario actual
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
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

  useEffect(() => {
    fetchCounts()
    const saved = localStorage.getItem('granimaster_voted')
    if (saved) setVoted(JSON.parse(saved))
  }, [])

  // Login con Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) toast.error('Error al iniciar sesión')
  }

  // Cerrar sesión
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast.success('Sesión cerrada')
  }

  const handleVoteClick = async (place) => {
    if (!user) {
      setSelectedPlace(place)
      setShowLoginModal(true)
      return
    }

    if (voted[activeCity]) {
      toast.error(`Ya votaste en ${activeCity}`)
      return
    }

    await submitVote(place)
  }

  const submitVote = async (place) => {
    setIsSubmitting(true)

    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('city', activeCity)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      toast.error('Ya votaste con esta cuenta en esta ciudad')
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from('votes').insert({
      city: activeCity,
      place,
      user_id: user.id
    })

    if (error) {
      toast.error('Error al registrar el voto')
      setIsSubmitting(false)
      return
    }

    const newVoted = { ...voted, [activeCity]: place }
    setVoted(newVoted)
    localStorage.setItem('granimaster_voted', JSON.stringify(newVoted))

    toast.success('¡Voto registrado con éxito!')
    setIsSubmitting(false)
    setShowLoginModal(false)
    fetchCounts()
  }

  const cityPlaces = PLACES[activeCity] || []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header con usuario */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="text-xs tracking-[3px] text-cyan-400">CONCURSO 2026</div>
          <h1 className="text-5xl font-bold tracking-tighter">Elige el mejor granizado</h1>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800">
            <User size={18} className="text-[#D4AF77]" />
            <span className="text-sm text-zinc-300">{user.email}</span>
            <button onClick={signOut} className="ml-2 text-zinc-400 hover:text-red-400 transition">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>

      {!CONCURSO_FINALIZADO && <CityTabs active={activeCity} onChange={setActiveCity} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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

      {/* Modal de Login con Google */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-full max-w-md text-center">
            <h3 className="text-2xl font-bold mb-2">Iniciar sesión para votar</h3>
            <p className="text-zinc-400 mb-6">Usa tu cuenta de Google para participar</p>

            <button
              onClick={signInWithGoogle}
              className="w-full py-3.5 rounded-2xl bg-white text-black font-semibold flex items-center justify-center gap-3 hover:bg-zinc-200 transition"
            >
              Continuar con Google
            </button>

            <button onClick={() => setShowLoginModal(false)} className="mt-4 text-sm text-zinc-400">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}