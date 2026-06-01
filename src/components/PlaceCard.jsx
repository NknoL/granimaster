import { Check, Instagram } from 'lucide-react'

export default function PlaceCard({ place, instagram, hasVoted, onVote }) {
  const votedThis = hasVoted === place

  const openInstagram = () => {
    if (instagram) {
      window.open(`https://instagram.com/${instagram.replace('@', '')}`, '_blank')
    }
  }

  return (
    <div className={`group relative rounded-3xl border p-6 transition-all duration-300 flex flex-col
      ${votedThis 
        ? 'border-[#D4AF77] bg-zinc-900 shadow-[0_0_15px_rgba(212,175,119,0.15)]' 
        : 'border-zinc-800 bg-[#0F0F0F] hover:border-[#D4AF77]/60 hover:bg-zinc-900'
      }`}>
      
      <div className="flex-1">
        <div className="font-semibold text-[21px] tracking-[-0.3px] mb-1 text-white">{place}</div>
        
        {instagram && (
          <button 
            onClick={openInstagram}
            className="flex items-center gap-2 text-[#D4AF77] hover:text-[#f0d9b0] text-sm mb-5 transition"
          >
            <Instagram size={16} />
            <span className="font-medium">{instagram}</span>
          </button>
        )}
      </div>

      <button
        onClick={onVote}
        disabled={!!hasVoted}
        className={`mt-auto w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.985] text-sm
          ${hasVoted 
            ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
            : 'bg-[#D4AF77] text-black hover:bg-[#f0d9b0] shadow-sm'
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