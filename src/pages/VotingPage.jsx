import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'
import { User, LogOut } from 'lucide-react'

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

  useEffect(() => {
    const saved = localStorage.getItem('granimaster_voted')
    if (saved) setVoted(JSON.parse(saved))
  }, [])

  // Login con Google (CORREGIDO)
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    if (error) toast.error('Error al iniciar sesión con Google')
  }

  // Cerrar sesión
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    toast.success('Sesión cerrada')
  }

  const handleVoteClick = (place) => {
    if (!user) {
      setSelectedPlace(place)
      setShowLoginModal(true)
      return
    }

    if (voted[activeCity]) {
      toast.error(`Ya votaste en ${activeCity}`)
      return
    }

    submitVote(place)
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
      place: place,
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
  }

  const cityPlaces = PLACES[activeCity] || []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="text-xs tracking-[3px] text-cyan-400">CONCURSO 2026</div>
          <h1 className="text-5xl font-bold tracking-tighter">Elige el mejor granizado</h1>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-800 text-sm">
            <User size={18} className="text-[#D4AF77]" />
            <span className="text-zinc-300">{user.email}</span>
            <button onClick={signOut} className="ml-2 text-zinc-400 hover:text-red-400">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>

      {!CONCURSO_FINALIZADO && <CityTabs active={activeCity} onChange={setActiveCity} />}

      {/* Tarjetas */}
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

      {/* Modal Login con Google */}
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