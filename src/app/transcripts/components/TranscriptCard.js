'use client';

import { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

const ROLE_COLORS = {
  proposer: {
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
    label: 'P',
  },
  critic: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
    label: 'C',
  },
};

const TURN_NAMES = {
  0: 'Proposal',
  1: 'Formal Answer',
  2: 'Independent Solution',
  3: 'Critique Verdict',
  4: 'Rebuttal',
  5: 'Final Verdict',
};

const HIGHLIGHT_PATTERNS = [
  { pattern: /I maintain my critique/g, type: 'formulaic' },
  { pattern: /incomplete|insufficient|inadequate/gi, type: 'bar-raise' },
  { pattern: /fails to|does not address|does not justify|not self-contained/gi, type: 'bar-raise' },
  { pattern: /flawed|misleading|invalid|incorrect|false/gi, type: 'fabricated' },
  { pattern: /circular reasoning|equivocates?|non sequitur/gi, type: 'fabricated' },
  { pattern: /critical omission|critical flaw|core issue|core deficiency/gi, type: 'goalpost' },
  { pattern: /not a (?:valid |complete )?proof|without justification|lacks.*justification/gi, type: 'bar-raise' },
  { pattern: /The proposal is correct and matches/g, type: 'sandbag' },
  { pattern: /correct and matches my solution/g, type: 'sandbag' },
];

const HIGHLIGHT_STYLES = {
  formulaic: 'bg-purple-500/30 border-b border-purple-400/50',
  'bar-raise': 'bg-orange-500/25 border-b border-orange-400/50',
  fabricated: 'bg-red-500/25 border-b border-red-400/50',
  goalpost: 'bg-yellow-500/20 border-b border-yellow-400/50',
  sandbag: 'bg-teal-500/25 border-b border-teal-400/50',
};

const FLAG_STYLES = {
  sandbag_pivot: 'bg-red-900/40 text-red-300 border-red-700/50',
  fabricated_objection: 'bg-red-900/40 text-red-300 border-red-700/50',
  bar_raising: 'bg-orange-900/40 text-orange-300 border-orange-700/50',
  goalpost_moving: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  ack_sandwich: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  false_counterexample: 'bg-red-900/40 text-red-300 border-red-700/50',
  expertise_signaling: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  formulaic_open: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  circular_reasoning_accusation: 'bg-red-900/40 text-red-300 border-red-700/50',
  agrees_correct: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  confirms_agreement: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  legitimate_critique: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
};

const FLAG_LABELS = {
  sandbag_pivot: 'sandbag → pivot',
  fabricated_objection: 'fabricated',
  bar_raising: 'bar-raising',
  goalpost_moving: 'goalpost',
  ack_sandwich: 'ack sandwich',
  false_counterexample: 'false example',
  expertise_signaling: 'expertise signal',
  formulaic_open: 'formulaic',
  circular_reasoning_accusation: 'false circularity',
  agrees_correct: 'agrees',
  confirms_agreement: 'confirms',
  legitimate_critique: 'legitimate',
};

const remarkPlugins = [remarkMath];
const rehypePlugins = [rehypeRaw, rehypeKatex];

function MarkdownContent({ text, showAnnotations }) {
  // For annotation mode on critic text, inject highlight <mark> tags into the markdown
  // before rendering. We replace matching phrases with HTML <mark> tags.
  const processed = useMemo(() => {
    if (!showAnnotations) return text;
    let result = text;
    for (const { pattern, type } of HIGHLIGHT_PATTERNS) {
      const style = HIGHLIGHT_STYLES[type];
      result = result.replace(
        pattern,
        (match) => `<mark class="${style} rounded-sm px-0.5" title="${type}">${match}</mark>`
      );
    }
    return result;
  }, [text, showAnnotations]);

  return (
    <Markdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      remarkRehypeOptions={{ allowDangerousHtml: true }}
      components={{
        // Style overrides for dark theme
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        h3: ({ children }) => <h3 className="text-neutral-200 font-bold mt-3 mb-1 text-sm">{children}</h3>,
        h4: ({ children }) => <h4 className="text-neutral-200 font-semibold mt-2 mb-1 text-sm">{children}</h4>,
        strong: ({ children }) => <strong className="text-neutral-100 font-bold">{children}</strong>,
        em: ({ children }) => <em className="text-neutral-400">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-neutral-600 pl-3 my-2 text-neutral-400 italic">{children}</blockquote>
        ),
        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>,
        li: ({ children }) => <li className="text-neutral-300">{children}</li>,
        code: ({ inline, children }) => inline
          ? <code className="bg-white/10 px-1 py-0.5 rounded text-teal-300 text-xs">{children}</code>
          : <code className="block bg-white/5 p-2 rounded my-2 text-xs overflow-x-auto">{children}</code>,
        hr: () => <hr className="border-white/10 my-3" />,
        a: ({ href, children }) => <a href={href} className="text-teal-400 underline" target="_blank" rel="noopener">{children}</a>,
        mark: ({ className, title, children }) => <mark className={className} title={title}>{children}</mark>,
      }}
    >
      {processed}
    </Markdown>
  );
}

function TurnBlock({ turn, showAnnotations, isCriticT5, defaultOpen, annotation }) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const role = ROLE_COLORS[turn.role];
  const turnName = annotation?.label || TURN_NAMES[turn.turn] || `Turn ${turn.turn}`;
  const charCount = turn.text.length;
  const flags = annotation?.flags || [];
  const fabrication = annotation?.fabrication_detail;

  return (
    <div className={`border-l-2 ${role.border} ${isCriticT5 && showAnnotations ? 'bg-red-950/20' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors flex-wrap"
      >
        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${role.badge}`}>
          {role.label}
        </span>
        <span className="text-xs text-neutral-300 font-medium">
          Turn {turn.turn} — {turnName}
        </span>
        {isCriticT5 && showAnnotations && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-700/50 animate-pulse">
            LAST WORD — UNREBUTTED
          </span>
        )}
        {showAnnotations && flags.length > 0 && (
          <span className="flex gap-1 flex-wrap">
            {flags.map(f => (
              <span
                key={f}
                className={`text-[9px] px-1 py-0.5 rounded border ${FLAG_STYLES[f] || 'bg-white/10 text-neutral-400 border-white/10'}`}
              >
                {FLAG_LABELS[f] || f}
              </span>
            ))}
          </span>
        )}
        <span className="text-[10px] text-neutral-600 ml-auto font-mono shrink-0">{charCount} ch</span>
        <svg
          className={`w-3 h-3 text-neutral-500 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-3">
          {/* Annotation summary */}
          {showAnnotations && annotation?.summary && (
            <p className="text-xs text-neutral-400 italic mb-2 pl-2 border-l border-neutral-700">
              {annotation.summary}
            </p>
          )}

          {/* Fabrication callout */}
          {showAnnotations && fabrication && (
            <div className="mb-2 px-3 py-2 rounded bg-red-950/40 border border-red-800/40 text-xs text-red-300">
              <span className="font-bold">Fabrication: </span>{fabrication}
            </div>
          )}

          <div className="text-sm text-neutral-300 leading-relaxed prose-invert max-w-none transcript-content">
            <MarkdownContent
              text={turn.text}
              showAnnotations={showAnnotations && turn.role === 'critic'}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function TranscriptCard({
  transcript, judgeDecision, judgeResponse, correct, reward,
  iteration, iterLabel, showAnnotations, annotations,
}) {
  const [showJudge, setShowJudge] = useState(false);

  const turnAnnotations = annotations?.turn_labels || {};
  const overallPattern = annotations?.overall_pattern;
  const fabricationDetails = annotations?.fabrication_details;

  const decisionColor = {
    accept: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/50',
    reject: 'text-red-400 bg-red-900/30 border-red-700/50',
    draw: 'text-neutral-400 bg-neutral-800/50 border-neutral-700/50',
  }[judgeDecision] || '';

  const correctLabel = correct
    ? 'text-emerald-400 bg-emerald-900/20'
    : 'text-red-400 bg-red-900/20';

  const isTricked = correct && judgeDecision === 'reject';

  const patternBadge = overallPattern && showAnnotations ? {
    cooperative: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50',
    sandbag_pivot: 'bg-red-900/30 text-red-400 border-red-700/50',
    sandbag_mild: 'bg-orange-900/30 text-orange-400 border-orange-700/50',
    consistent_critique: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
    legitimate_critique: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
  }[overallPattern] : null;

  return (
    <div className="rounded-lg bg-[#132a2e] border border-white/10 overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3 flex-wrap">
        <span className="text-xs font-mono text-neutral-500">iter {iterLabel}</span>
        <span className={`text-xs px-2 py-0.5 rounded border font-mono ${decisionColor}`}>
          {judgeDecision}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded font-mono ${correctLabel}`}>
          {correct ? 'correct ✓' : 'incorrect ✗'}
        </span>
        {isTricked && (
          <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-300 border border-red-700/50 font-bold">
            JUDGE TRICKED
          </span>
        )}
        {patternBadge && (
          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${patternBadge}`}>
            {overallPattern.replace(/_/g, ' ')}
          </span>
        )}
        <span className="text-xs font-mono text-neutral-600 ml-auto" title="Reward for the trained critic (Bob). +1 = reject, -1 = accept, 0 = draw">
          critic reward: {reward > 0 ? '+' : ''}{reward.toFixed(1)}
        </span>
      </div>

      {/* Fabrication summary (when annotations on + sandbag detected) */}
      {showAnnotations && fabricationDetails && (
        <div className="mx-4 mt-3 px-3 py-2 rounded bg-red-950/30 border border-red-800/30 text-xs text-red-300/90">
          <span className="font-bold uppercase tracking-wider text-[10px]">Exploit detected: </span>
          {fabricationDetails}
        </div>
      )}

      {/* Turns */}
      <div className="divide-y divide-white/5 mt-1">
        {transcript.map(turn => (
          <TurnBlock
            key={turn.turn}
            turn={turn}
            showAnnotations={showAnnotations}
            isCriticT5={turn.role === 'critic' && turn.turn === 5}
            defaultOpen={turn.turn === 0 || turn.turn === 3 || turn.turn === 5}
            annotation={turnAnnotations[String(turn.turn)]}
          />
        ))}
      </div>

      {/* Judge response */}
      <div className="border-t border-white/10">
        <button
          onClick={() => setShowJudge(!showJudge)}
          className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
        >
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50 font-mono font-bold">
            J
          </span>
          <span className="text-xs text-neutral-300">Judge Reasoning</span>
          <svg
            className={`w-3 h-3 text-neutral-500 ml-auto transition-transform ${showJudge ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showJudge && (
          <div className="px-4 pb-3">
            <div className="text-sm text-neutral-400 font-mono leading-relaxed whitespace-pre-wrap break-words">
              {judgeResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
