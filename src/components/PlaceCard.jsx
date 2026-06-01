import { motion, useAnimation } from 'framer-motion'
import { Instagram, CheckCircle2 } from 'lucide-react'

const IG_HANDLES = {
  // Bucaramanga
  "Granifreseo":         "granifreseo11",
  "Mundo8ice":           "granizados_mundo8ice_bga",
  "Frozen Shark":        "frozenshark_11",
  "Trinislush":          "trinislush",
  "Granibucaros":        "grani_bucaros",
  "Crack granizados":    "crack.granizados",
  "Tamy ice":            "tamy_ice",
  "420Slushy":           "420slushy_",
  "Mafia cocktails":     "mafiacocktails",
  "Necati cocktails":    "necati.cocktails",
  "Granilocos":          "granilocos__oficial",
  "Eclipse cocktail":    "eclipsecocktail",
  "Blueice":             "blueicegranizado",
  "Ice flow":            "iceflowbga",
  "Nova ice":            "novaiceoficiall",
  // Girón
  "Graniizu ice":        "graniizu_ice",
  "Luna yena":           "granizadoslunayena",
  "Urban slush":         "urban_slush",
  "Exotic slush":        "exoticslushbga",
  "Cool hot":            "granizadoscoolhot",
  // Floridablanca
  "Refreshment station": "refreshment_station",
  "Crazy Drinks":        "crazydrinks30",
  "Portal granizados":   "portal_granizados",
  "Spacebuddies":        "spacebuddiesoficial",
  "Mafia":               "mafia_lacumbre",
}

export default function PlaceCard({ place, count, hasVoted, onVote }) {
  const controls    = useAnimation()
  const isVotedHere = hasVoted === place  // este lugar fue el votado
  const cityVoted   = !!hasVoted          // ya votó en esta ciudad (cualquier lugar)
  const igHandle    = IG_HANDLES[place]

  /* ── Efecto de clic ── */
  const handleClick = async () => {
    if (cityVoted) {
      // shake sutil si intenta votar de nuevo
      await controls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.35 }
      })
      return
    }
    // pulse al votar
    await controls.start({
      scale: [1, 0.95, 1.04, 1],
      transition: { duration: 0.3 }
    })
    onVote()
  }

  return (
    <motion.div
      animate={controls}
      whileTap={!cityVoted ? { scale: 0.97 } : {}}
      className={`
        group relative flex flex-col justify-between gap-4
        rounded-2xl border p-5 cursor-pointer select-none
        transition-colors duration-200
        ${isVotedHere
          ? 'bg-cyan-500/10 border-cyan-500/40'
          : cityVoted
            ? 'bg-zinc-900/60 border-zinc-800 opacity-50 cursor-not-allowed'
            : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80'
        }
        backdrop-blur-sm
      `}
      onClick={handleClick}
    >
      {/* ── Nombre + check si fue el voto ── */}
      <div className="flex items-start justify-between gap-2">
        <span className={`font-semibold text-base leading-tight ${isVotedHere ? 'text-cyan-300' : 'text-white'}`}>
          {place}
        </span>
        {isVotedHere && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <CheckCircle2 size={18} className="text-cyan-400 shrink-0 mt-0.5" />
          </motion.div>
        )}
      </div>

      {/* ── Contador + handle IG ── */}
      <div className="flex items-end justify-between">

        {/* Solo muestra el contador si count > 0 */}
        <div>
          {count > 999999999999 && (
            <>
              <span className={`text-4xl font-mono font-bold tabular-nums ${isVotedHere ? 'text-cyan-400' : 'text-white'}`}>
                {count}
              </span>
              <span className="text-zinc-500 text-xs ml-1.5">votos</span>
            </>
          )}
        </div>

        {/* Handle de Instagram — siempre visible */}
        {igHandle && (
          <a
            href={`https://instagram.com/${igHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-pink-400
                       transition-colors shrink-0"
          >
            <Instagram size={12} />
            <span>@{igHandle}</span>
          </a>
        )}
      </div>

      {/* ── Botón votar (solo si no ha votado en esta ciudad) ── */}
      {!cityVoted && (
        <div className="mt-1">
          <div className="w-full py-2 rounded-xl bg-white/5 border border-zinc-700
                          text-center text-sm font-medium text-zinc-300
                          group-hover:bg-cyan-500 group-hover:border-cyan-500 group-hover:text-black
                          transition-all duration-200">
            Votar
          </div>
        </div>
      )}

      {/* ── Badge "Tu voto" ── */}
      {isVotedHere && (
        <div className="mt-1 w-full py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30
                        text-center text-sm font-semibold text-cyan-300">
          ✓ Tu voto
        </div>
      )}
    </motion.div>
  )
}