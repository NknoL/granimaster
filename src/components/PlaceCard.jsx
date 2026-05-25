import { Check } from 'lucide-react'

export default function PlaceCard({ place, count, hasVoted, onVote }) {
  const votedThis = hasVoted === place

  return (
    <div className={`group relative rounded-3xl border p-5 transition-all duration-200 ${
      votedThis 
        ? 'border-cyan-500 bg-zinc-900' 
        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-lg tracking-tight">{place}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Granizado / Slush / Cocktail</div>
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
  )
}