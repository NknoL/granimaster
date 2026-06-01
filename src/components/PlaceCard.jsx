import { Check, Instagram } from 'lucide-react'

export default function PlaceCard({ place, instagram, count, hasVoted, onVote, image }) {
  const votedThis = hasVoted === place

  const openInstagram = () => {
    if (instagram) {
      window.open(`https://instagram.com/${instagram.replace('@', '')}`, '_blank')
    }
  }

  return (
    <div className={`group relative rounded-3xl border overflow-hidden transition-all duration-200 flex flex-col ${
      votedThis 
        ? 'border-cyan-500 bg-zinc-900' 
        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
    }`}>
      
      {/* Imagen o placeholder */}
      <div className="relative h-44 bg-zinc-800 flex items-center justify-center overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={place} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="text-center px-4">
            <div className="text-5xl mb-2 opacity-70">🍧</div>
            <p className="text-xs text-zinc-500">Imagen próximamente</p>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="font-semibold text-lg tracking-tight leading-tight">{place}</div>
            
            {instagram && (
              <button 
                onClick={openInstagram}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm mt-1.5 transition"
              >
                <Instagram size={15} />
                <span>{instagram}</span>
              </button>
            )}
          </div>

          <div className="text-right shrink-0">
            <div className="text-3xl font-mono font-semibold text-cyan-400 tabular-nums leading-none">{count}</div>
            <div className="text-[10px] text-zinc-500 -mt-0.5">votos</div>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={onVote}
            disabled={!!hasVoted}
            className={`w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.985] text-sm ${
              hasVoted 
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-cyan-400 hover:text-black'
            }`}
          >
            {votedThis ? (
              <> <Check size={18} /> Ya votaste </>
            ) : hasVoted ? (
              'Ya votaste en esta ciudad'
            ) : (
              'Votar por este lugar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}