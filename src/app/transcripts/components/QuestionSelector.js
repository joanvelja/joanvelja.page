'use client';

import { useState, useRef, useEffect } from 'react';
import { MathText } from './MathText';

const TOPIC_COLORS = {
  probability: 'bg-purple-900/50 text-purple-300 border-purple-800/50',
  algebra: 'bg-blue-900/50 text-blue-300 border-blue-800/50',
  geometry: 'bg-green-900/50 text-green-300 border-green-800/50',
  number_theory: 'bg-orange-900/50 text-orange-300 border-orange-800/50',
  combinatorics: 'bg-pink-900/50 text-pink-300 border-pink-800/50',
};

export function QuestionSelector({ questions, selectedIdx, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = questions[selectedIdx];
  const shortQ = selected.question.length > 90
    ? selected.question.slice(0, 90) + '…'
    : selected.question;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors flex items-center gap-3"
      >
        <span className="text-xs font-mono text-neutral-500 shrink-0">
          Q{selectedIdx + 1}/{questions.length}
        </span>
        <span className="text-sm text-neutral-200 truncate flex-1"><MathText>{shortQ}</MathText></span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${TOPIC_COLORS[selected.topic] || ''}`}>
          {selected.topic}
        </span>
        <svg className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 max-h-[60vh] overflow-y-auto rounded-lg bg-[#132a2e] border border-white/10 shadow-2xl">
          {questions.map((q, i) => {
            const short = q.question.length > 100 ? q.question.slice(0, 100) + '…' : q.question;
            const isSelected = i === selectedIdx;
            return (
              <button
                key={i}
                onClick={() => { onSelect(i); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 border-b border-white/5 last:border-0 transition-colors ${
                  isSelected ? 'bg-teal-900/30' : 'hover:bg-white/5'
                }`}
              >
                <span className="text-xs font-mono text-neutral-500 w-6 shrink-0">{i + 1}</span>
                <span className="text-sm text-neutral-300 flex-1"><MathText>{short}</MathText></span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${TOPIC_COLORS[q.topic] || ''}`}>
                  {q.topic}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
