'use client';

const METRIC_DEFS = [
  { key: 'falseNegativeRate', label: 'False Negative Rate', fmt: v => `${(v * 100).toFixed(1)}%`, color: 'text-red-400' },
  { key: 'meanT5Length', label: 'Avg Turn 5 Length', fmt: v => `${v} ch`, color: 'text-amber-400' },
  { key: 'reject', label: 'Rejections', fmt: (v, m) => `${v}/${m.total}`, color: 'text-orange-400' },
  { key: 'accept', label: 'Accepts', fmt: (v, m) => `${v}/${m.total}`, color: 'text-emerald-400' },
];

export function MetricsSummary({ metrics, iterations, labels, currentIter }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {METRIC_DEFS.map(({ key, label, fmt, color }) => {
        const values = iterations.map(it => metrics[it][key]);
        const first = values[0];
        const last = values[values.length - 1];
        const current = metrics[currentIter][key];

        return (
          <div key={key} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-lg font-mono font-medium ${color}`}>
              {fmt(current, metrics[currentIter])}
            </p>
            {/* Sparkline */}
            <div className="flex items-end gap-[3px] h-5 mt-2">
              {values.map((v, i) => {
                const max = Math.max(...values);
                const min = Math.min(...values);
                const range = max - min || 1;
                const height = ((v - min) / range) * 100;
                const isActive = iterations[i] === currentIter;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-colors ${
                      isActive ? 'bg-teal-400' : 'bg-white/20'
                    }`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                    title={`iter ${labels[iterations[i]]}: ${fmt(v, metrics[iterations[i]])}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-neutral-600 mt-1 font-mono">
              <span>iter 0</span>
              <span>105</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
