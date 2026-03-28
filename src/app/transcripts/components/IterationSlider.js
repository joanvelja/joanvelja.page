'use client';

const DECISION_COLORS = {
  accept: 'bg-emerald-500',
  reject: 'bg-red-500',
  draw: 'bg-neutral-500',
};

const DECISION_RING = {
  accept: 'ring-emerald-500/50',
  reject: 'ring-red-500/50',
  draw: 'ring-neutral-500/50',
};

export function IterationSlider({ iterations, labels, currentIdx, onChange, timeline }) {
  return (
    <div className="my-6">
      <div className="relative px-4">
        {/* Connecting line — pinned to dot vertical center (8px from top of the button row) */}
        <div className="absolute left-[calc(1rem+8px)] right-[calc(1rem+8px)] top-[8px] h-px bg-white/15 pointer-events-none" />
        <div
          className="absolute left-[calc(1rem+8px)] top-[8px] h-px bg-white/30 pointer-events-none transition-all"
          style={{ width: `calc(${(currentIdx / (timeline.length - 1)) * 100}% - 16px)` }}
        />

        <div className="relative flex justify-between">
          {timeline.map((point, i) => {
            const isActive = i === currentIdx;
            const dec = point.decision;

            return (
              <button
                key={point.iter}
                onClick={() => onChange(i)}
                className="relative z-10 flex flex-col items-center gap-1.5 group"
              >
                <div className={`
                  w-4 h-4 rounded-full transition-all
                  ${DECISION_COLORS[dec] || 'bg-neutral-600'}
                  ${isActive ? `ring-4 ${DECISION_RING[dec]} scale-125` : 'opacity-60 group-hover:opacity-100'}
                `} />

                <span className={`text-xs font-mono transition-colors ${
                  isActive ? 'text-neutral-100 font-medium' : 'text-neutral-500 group-hover:text-neutral-300'
                }`}>
                  {point.label}
                </span>

                <span className={`text-[10px] font-mono ${
                  isActive ? 'text-neutral-300' : 'text-neutral-600'
                }`}>
                  {dec}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase transition marker */}
      <div className="flex justify-center mt-3">
        {currentIdx >= 4 ? (
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-800/30">
            post phase-transition (iter 60→90)
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-neutral-500 border border-white/10">
            pre phase-transition
          </span>
        )}
      </div>
    </div>
  );
}
