import { Check, Instagram } from 'lucide-react'

export default function PlaceCard({ place, instagram, count, hasVoted, onVote, image }) {
  const votedThis = hasVoted === place

  const openInstagram = () => {
    if (instagram) {
      window.open(`https://instagram.com/${instagram.replace('@', '')}`, '_blank')
    }
  }

  return (
    <div className={`group relative rounded-3xl border overflow-hidden transition-all duration-200 ${
      votedThis 
        ? 'border-cyan-500 bg-zinc-900' 
        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
    }`}>
      
      {/* Imagen / Placeholder */}
      <div className="relative h-40 bg-zinc-800 flex items-center justify-center overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={place} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">🍧</div>
            <p className="text-xs text-zinc-500">Próximamente foto</p>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-lg tracking-tight">{place}</div>
            
            {/* Instagram clickable */}
            {instagram && (
              <button 
                onClick={openInstagram}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm mt-1 transition"
              >
                <Instagram size={15} />
                {instagram}
              </button>
            )}
          </div>

          <div className="text-right">
            <div className="text-3xl font-mono font-semibold text-cyan-400 tabular-nums">{count}</div>
            <div className="text-[10px] text-zinc-500 -mt-1">votos</div>
          </div>
        </div>

        <button
          onClick={onVote}
          disabled={!!hasVoted}
          className={`mt-6 w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.985] text-sm ${
            hasVoted 
              ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
              : 'bg-white text-black hover:bg-cyan-400 hover:text-black'
          }`}
        >
          {votedThis ? (
            <> <Check size={18} /> Ya votaste por este </>
          ) : hasVoted ? (
            'Ya votaste en esta ciudad'
          ) : (
            'Votar por este lugar'
          )}
        </button>
      </div>
    </div>
  )
}