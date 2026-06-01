export default function PlaceCard({ place, count, hasVoted, onVote }) {
  const isVotedThis = hasVoted === place
  const cityAlreadyVoted = !!hasVoted

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-3 transition-all duration-150
        ${isVotedThis
          ? 'border-red-600 bg-zinc-900'
          : cityAlreadyVoted
            ? 'border-zinc-800 bg-zinc-900 opacity-50'
            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
        }`}
    >
      <div className="flex justify-between items-center gap-2">
        <h3 className="font-medium text-sm text-white">{place}</h3>
        {isVotedThis && (
          <span className="text-[10px] font-semibold tracking-widest uppercase text-red-500">
            Tu voto
          </span>
        )}
      </div>

      {count > 999999 && (
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-mono font-bold text-white tabular-nums">
            {count}
          </span>
          <span className="text-xs text-zinc-600">
            {count === 1 ? 'voto' : 'votos'}
          </span>
        </div>
      )}

      <button
        onClick={onVote}
        disabled={cityAlreadyVoted}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all
          ${isVotedThis
            ? 'bg-red-600/10 text-red-500 border border-red-600/30 cursor-default'
            : cityAlreadyVoted
              ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
      >
        {isVotedThis
          ? 'Votaste aquí'
          : cityAlreadyVoted
            ? 'Ya votaste en esta ciudad'
            : 'Votar'}
      </button>
    </div>
  )
}