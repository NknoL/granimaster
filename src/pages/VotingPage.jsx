import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import PlaceCard from '../components/PlaceCard'
import CityTabs from '../components/CityTabs'
import { LogIn, LogOut, Instagram } from 'lucide-react'

const PLACES = {
  Bucaramanga: [
    "Mundo8ice", "Frozen Shark", "Trinislush", "Granibucaros", "Granifreseo",
    "Crack granizados", "Tamy ice", "420Slushy", "Mafia cocktails", "Necati cocktails",
    "Granilocos", "Eclipse cocktail", "Blueice", "Ice flow", "Nova ice"
  ],
  Girón: [
    "Graniizu ice", "Luna yena", "Urban slush", "Exotic slush", "Cool hot"
  ],
  Floridablanca: [
    "Refreshment station", "Crazy Drinks", "Granifreseo", "Portal granizados", "Spacebuddies", "Mafia"
  ]
}

const IG_HANDLE = '@granimaster2026'
const IG_URL    = 'https://instagram.com/granimaster2026'

// Variantes de animación reutilizables
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
}

const staggerGrid = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } }
}

const cardVariant = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
}

export default function VotingPage() {
  const [activeCity, setActiveCity] = useState('Bucaramanga')
  const [counts,     setCounts]     = useState({})
  const [voted,      setVoted]      = useState({})
  const [user,       setUser]       = useState(null)
  const [loading,    setLoading]    = useState(true)

  /* ── Carga votos del usuario ── */
  const loadUserVotes = async (currentUser) => {
    if (!currentUser) { setVoted({}); return }
    const { data, error } = await supabase
      .from('votes')
      .select('city, place')
      .eq('user_id', currentUser.id)

    if (!error && data) {
      const userVoted = {}
      data.forEach(v => { userVoted[v.city] = v.place })
      setVoted(userVoted)
    }
  }

  /* ── Init ── */
  useEffect(() => {
    const init = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      await loadUserVotes(currentUser)

      const { data: allVotes } = await supabase.from('votes').select('city, place')
      const grouped = {}
      allVotes?.forEach(vote => {
        if (!grouped[vote.city]) grouped[vote.city] = {}
        grouped[vote.city][vote.place] = (grouped[vote.city][vote.place] || 0) + 1
      })
      setCounts(grouped)
      setLoading(false)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null
        setUser(currentUser)
        await loadUserVotes(currentUser)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  /* ── Timeout de conexión lenta ── */
  useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => {
      alert('CONEXION DE INTERNET INESTABLE')
      localStorage.clear()
      sessionStorage.clear()
      if ('caches' in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)))
      window.location.reload()
    }, 5000)
    return () => clearTimeout(timer)
  }, [loading])

  /* ── Auth ── */
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setVoted({})
    toast.success('Sesión cerrada correctamente')
  }

  /* ── Votar ── */
  const handleVote = async (city, place) => {
    if (!user) { await signInWithGoogle(); return }
    if (voted[city]) return  // silencioso — los botones ya están deshabilitados

    const { error } = await supabase.from('votes').insert({
      city, place, email: user.email, user_id: user.id
    })

    if (error) {
      if (error.code === '23505') await loadUserVotes(user)  // sincronizar en caso de duplicado
      else toast.error('Error al registrar el voto')
      return
    }

    setVoted(prev => ({ ...prev, [city]: place }))
    toast.success('¡Voto registrado!', { description: `${place} en ${city}` })
    setCounts(prev => {
      const n = { ...prev }
      if (!n[city]) n[city] = {}
      n[city][place] = (n[city][place] || 0) + 1
      return n
    })
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">

      {/* ══ Fondo: imagen de avatar con overlay oscuro ══ */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/avatar.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Overlay translúcido — ajusta la opacidad aquí (0.80–0.90) */}
      <div className="fixed inset-0 -z-10 bg-zinc-950/85" />

      {/* ══ Contenido ══ */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/avatar.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

        {/* ── Hero ── */}
        <motion.div
          className="text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-[3px] uppercase mb-5">
            EDICION 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
            Elige el mejor granizado
          </h1>
          <p className="text-zinc-400 mt-3 text-base">
            Inicia sesión con Google para votar - ¡¡Puedes hacer 1 voto por cada ciudad!!
          </p>

          {/* Instagram */}
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-zinc-500 hover:text-pink-400 transition-colors"
          >
            <Instagram size={14} />
            {IG_HANDLE}
          </a>
        </motion.div>

        {/* ── Barra usuario ── */}
        <AnimatePresence>
          {user && (
            <motion.div
              key="user-bar"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8
                         bg-zinc-900/70 backdrop-blur-sm border border-zinc-800 rounded-2xl px-6 py-4"
            >
              <div className="text-sm">
                <span className="text-zinc-500">Conectado como </span>
                <span className="font-medium text-white">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-5 py-2 text-sm rounded-xl
                           bg-zinc-800 hover:bg-red-950 text-red-400 transition-colors w-full md:w-auto"
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tabs de ciudad ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <CityTabs active={activeCity} onChange={setActiveCity} />
        </motion.div>

        {/* ── Grid de lugares ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCity}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8"
            variants={staggerGrid}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {PLACES[activeCity]?.map(place => (
              <motion.div key={place} variants={cardVariant}>
                <PlaceCard
                  place={place}
                  count={counts[activeCity]?.[place] || 0}
                  hasVoted={voted[activeCity]}
                  onVote={() => handleVote(activeCity, place)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── CTA login ── */}
        <AnimatePresence>
          {!user && (
            <motion.div
              key="login-cta"
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={signInWithGoogle}
                className="px-8 py-3.5 bg-white text-black font-semibold rounded-2xl
                           inline-flex items-center gap-3 hover:bg-red-400
                           active:scale-95 transition-all duration-150"
              >
                <LogIn size={20} />
                Iniciar sesión con Google para votar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}