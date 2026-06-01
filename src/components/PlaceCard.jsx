export default function PlaceCard({ place, count, hasVoted, onVote }) {
  const isVotedThis = hasVoted === place
  const cityAlreadyVoted = !!hasVoted

  return (
    <div
      className={`relative rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200 overflow-hidden
        ${isVotedThis
          ? 'border-red-500 bg-zinc-900 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
          : cityAlreadyVoted
            ? 'border-zinc-800 bg-zinc-900/60 opacity-60'
            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/70'
        }`}
    >
      {/* Glow decorativo solo en el votado */}
      {isVotedThis && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />
        </div>
      )}

      {/* Encabezado */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-base leading-snug tracking-tight text-white">{place}</h3>
        {isVotedThis && (
          <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
            Tu voto
          </span>
        )}
      </div>

      {/* Contador — solo se muestra si count > 0 */}
      {count > 9999999 && (
        <div className="flex items-end gap-1.5">
          <span className="text-3xl font-mono font-bold text-red-500 tabular-nums leading-none">
            {count}
          </span>
          <span className="text-xs text-zinc-500 mb-0.5">
            {count === 1 ? 'voto' : 'votos'}
          </span>
        </div>
      )}

      {/* Botón */}
      <button
        onClick={onVote}
        disabled={cityAlreadyVoted}
        className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.985]
          ${isVotedThis
            ? 'bg-red-500/10 text-red-400 border border-red-500/30 cursor-default'
            : cityAlreadyVoted
              ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-800'
              : 'bg-red-600 text-white hover:bg-red-700 border border-transparent'
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