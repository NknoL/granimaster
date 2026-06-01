export default function PlaceCard({ place, count, hasVoted, onVote }) {
  const isVotedThis = hasVoted === place   // este lugar específico fue el votado
  const cityAlreadyVoted = !!hasVoted      // ya votó en esta ciudad (cualquier lugar)

  return (
    <div className={`bg-zinc-900 border rounded-2xl p-5 flex flex-col gap-3 transition
      ${isVotedThis
        ? 'border-cyan-500 ring-1 ring-cyan-500/30'
        : 'border-zinc-800'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-white">{place}</h3>
        {isVotedThis && (
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
            Tu voto ✓
          </span>
        )}
      </div>

      <div className="text-3xl font-mono text-zinc-300">
        {count} <span className="text-sm text-zinc-500 font-sans">votos</span>
      </div>

      {/* ✅ FIX #1: disabled={cityAlreadyVoted} bloquea todos los botones de la ciudad */}
      <button
        onClick={onVote}
        disabled={cityAlreadyVoted}
        className={`mt-auto w-full py-2.5 rounded-xl text-sm font-semibold transition
          ${isVotedThis
            ? 'bg-cyan-500/20 text-cyan-400 cursor-default'
            : cityAlreadyVoted
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50'
              : 'bg-white text-black hover:bg-cyan-400'
          }`}
      >
        {isVotedThis ? '✓ Votaste aquí' : cityAlreadyVoted ? 'Ya votaste en esta ciudad' : 'Votar'}
      </button>
    </div>
    
  )

}