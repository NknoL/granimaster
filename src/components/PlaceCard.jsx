import { Check, Instagram } from 'lucide-react'

export default function PlaceCard({ place, instagram, hasVoted, onVote }) {
  const votedThis = hasVoted === place

  const openInstagram = () => {
    if (instagram) {
      window.open(`https://instagram.com/${instagram.replace('@', '')}`, '_blank')
    }
  }

  return (
    <div className={`group relative rounded-3xl border p-5 transition-all duration-200 ${
      votedThis 
        ? 'border-cyan-500 bg-zinc-900' 
        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
    }`}>
      
      <div>
        <div className="font-semibold text-lg tracking-tight">{place}</div>
        
        {instagram && (
          <button 
            onClick={openInstagram}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm mt-1 transition"
          >
            <Instagram size={15} />
            <span>{instagram}</span>
          </button>
        )}
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
          <> <Check size={18} /> Ya votaste </>
        ) : hasVoted ? (
          'Ya votaste en esta ciudad'
        ) : (
          'Votar por este lugar'
        )}
      </button>
    </div>
  )
}