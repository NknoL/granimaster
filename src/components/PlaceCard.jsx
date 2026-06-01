import { motion, useAnimation } from 'framer-motion'
import { Instagram, CheckCircle2 } from 'lucide-react'

const IG_HANDLES = {
  "Granifreseo": "granifreseo11",
  "Mundo8ice": "granizados_mundo8ice_bga",
  "Frozen Shark": "frozenshark_11",
  "Trinislush": "trinislush",
  "Granibucaros": "grani_bucaros",
  "Crack granizados": "crack.granizados",
  "Tamy ice": "tamy_ice",
  "420Slushy": "420slushy_",
  "Mafia cocktails": "mafiacocktails",
  "Necati cocktails": "necati.cocktails",
  "Granilocos": "granilocos__oficial",
  "Eclipse cocktail": "eclipsecocktail",
  "Blueice": "blueicegranizado",
  "Ice flow": "iceflowbga",
  "Nova ice": "novaiceoficiall",
  "Graniizu ice": "graniizu_ice",
  "Luna yena": "granizadoslunayena",
  "Urban slush": "urban_slush",
  "Exotic slush": "exoticslushbga",
  "Cool hot": "granizadoscoolhot",
  "Refreshment station": "refreshment_station",
  "Crazy Drinks": "crazydrinks30",
  "Portal granizados": "portal_granizados",
  "Spacebuddies": "spacebuddiesoficial",
  "Mafia": "mafia_lacumbre",
}

export default function PlaceCard({ place, count, hasVoted, onVote }) {
  const controls = useAnimation()
  const isVotedHere = hasVoted === place
  const cityVoted = !!hasVoted
  const igHandle = IG_HANDLES[place]

  const handleClick = async () => {
    if (cityVoted) {
      await controls.start({
        x: [0, -6, 6, -4, 4, 0],
        transition: { duration: 0.35 }
      })
      return
    }

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
      onClick={handleClick}
      className={`
        group relative h-full flex flex-col justify-between gap-4
        rounded-2xl border p-5 cursor-pointer select-none
        transition-colors duration-200
        ${isVotedHere
          ? 'bg-red-500/10 border-red-500/40 backdrop-blur-md'
          : cityVoted
            ? 'bg-black/30 border-zinc-800/60 opacity-50 cursor-not-allowed backdrop-blur-sm'
            : 'bg-black/25 border-zinc-700/50 hover:border-zinc-500/60 hover:bg-black/35 backdrop-blur-sm'
        }
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`font-semibold text-base leading-tight ${isVotedHere ? 'text-red-300' : 'text-white'}`}>
          {place}
        </span>

        {isVotedHere && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <CheckCircle2 size={18} className="text-red-400 shrink-0 mt-0.5" />
          </motion.div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          {count > 9999999999 && (
            <>
              <span className={`text-4xl font-mono font-bold tabular-nums ${isVotedHere ? 'text-red-400' : 'text-white'}`}>
                {count}
              </span>
              <span className="text-zinc-500 text-xs ml-1.5">votos</span>
            </>
          )}
        </div>

        {igHandle && (
          <a
            href={`https://instagram.com/${igHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-pink-400 transition-colors shrink-0"
          >
            <Instagram size={12} />
            <span>@{igHandle}</span>
          </a>
        )}
      </div>

      <div className="mt-1 min-h-[52px] flex items-center">
        {!cityVoted && (
          <div className="w-full py-2 rounded-xl bg-white/5 border border-zinc-700 text-center text-sm font-medium text-zinc-300 group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-black transition-all duration-200">
            Votar por este lugar
          </div>
        )}

        {isVotedHere && (
          <div className="w-full py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-center text-sm font-semibold text-red-300">
            ✓ Tu voto de hoy
          </div>
        )}
      </div>
    </motion.div>
  )
}