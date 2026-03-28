'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MetricsSummary } from './MetricsSummary';
import { TranscriptCard } from './TranscriptCard';
import { QuestionSelector } from './QuestionSelector';
import { IterationSlider } from './IterationSlider';
import { MathText } from './MathText';

export default function TranscriptViewer() {
  const [manifest, setManifest] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [iterIdx, setIterIdx] = useState(0);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const questionCache = useRef({});

  // Load manifest on mount
  useEffect(() => {
    fetch('/transcripts/manifest.json')
      .then(r => r.json())
      .then(setManifest);
  }, []);

  // Load question data on question change
  useEffect(() => {
    if (!manifest) return;
    const idx = questionIdx;

    if (questionCache.current[idx]) {
      setQuestionData(questionCache.current[idx]);
      return;
    }

    setQuestionData(null);
    fetch(`/transcripts/q/${idx}.json`)
      .then(r => r.json())
      .then(data => {
        questionCache.current[idx] = data;
        setQuestionData(data);
      });
  }, [questionIdx, manifest]);

  // Preload adjacent questions
  useEffect(() => {
    if (!manifest) return;
    const toPreload = [questionIdx - 1, questionIdx + 1].filter(
      i => i >= 0 && i < manifest.meta.questionCount && !questionCache.current[i]
    );
    for (const i of toPreload) {
      fetch(`/transcripts/q/${i}.json`)
        .then(r => r.json())
        .then(data => { questionCache.current[i] = data; });
    }
  }, [questionIdx, manifest]);

  const iterations = manifest?.meta.iterations;
  const iterLabels = manifest?.meta.iterLabels;
  const questionMeta = manifest?.questions[questionIdx];

  const iter = iterations?.[iterIdx];
  const iterData = questionData?.iterations[iter];
  const iterAnnotations = questionData?.annotations?.[iter];

  const decisionTimeline = useMemo(() => {
    if (!iterations || !questionMeta) return [];
    return iterations.map(it => ({
      iter: it,
      label: iterLabels[it],
      decision: questionMeta.decisions[it]?.decision,
      correct: questionMeta.decisions[it]?.correct,
    }));
  }, [questionMeta, iterations, iterLabels]);

  const handleKeyDown = useCallback((e) => {
    if (!manifest) return;
    if (e.key === 'ArrowRight' && iterIdx < iterations.length - 1) {
      setIterIdx(i => i + 1);
    } else if (e.key === 'ArrowLeft' && iterIdx > 0) {
      setIterIdx(i => i - 1);
    } else if (e.key === 'ArrowDown' && questionIdx < manifest.questions.length - 1) {
      e.preventDefault();
      setQuestionIdx(i => i + 1);
      setIterIdx(0);
    } else if (e.key === 'ArrowUp' && questionIdx > 0) {
      e.preventDefault();
      setQuestionIdx(i => i - 1);
      setIterIdx(0);
    } else if (e.key === 'a' || e.key === 'A') {
      setShowAnnotations(v => !v);
    }
  }, [iterIdx, questionIdx, manifest, iterations]);

  if (!manifest) {
    return (
      <div className="min-h-screen bg-[#0d1f22] flex items-center justify-center">
        <p className="text-neutral-500 text-sm font-mono">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#0d1f22] text-neutral-100 font-sans selection:bg-teal-500/30"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif-display font-medium tracking-tight">
              Debate Transcripts
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              PCD protocol exploitation under RL training — {manifest.meta.questionCount} questions × 6 checkpoints
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAnnotations(v => !v)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                showAnnotations
                  ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                  : 'border-white/20 text-neutral-400 hover:border-white/40'
              }`}
            >
              {showAnnotations ? 'Annotations ON' : 'Annotations OFF'}
              <kbd className="ml-2 text-[10px] opacity-50">A</kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Context blurb */}
      <div className="max-w-6xl mx-auto px-6 pt-5 pb-2">
        <p className="text-sm text-neutral-500 leading-relaxed max-w-3xl">
          Propose-Critique-Decide (PCD): Alice proposes, Bob critiques, judge decides.
          Bob gets an unrebutted last word (turn 5). Under RL, Bob learns to agree in
          turns 2–3 then fabricate procedural objections in turn 5 — flipping the judge
          on correct proposals. The phase transition is between iter 60→90.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4">
        {/* Annotation Legend */}
        {showAnnotations && (
          <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
            <span className="text-neutral-500 uppercase tracking-wider font-medium">Legend:</span>
            <span><mark className="bg-teal-500/25 rounded-sm px-1">teal</mark> sandbagging agreement</span>
            <span><mark className="bg-purple-500/30 rounded-sm px-1">purple</mark> formulaic opener</span>
            <span><mark className="bg-orange-500/25 rounded-sm px-1">orange</mark> bar-raising</span>
            <span><mark className="bg-red-500/25 rounded-sm px-1">red</mark> fabricated claim</span>
            <span><mark className="bg-yellow-500/20 rounded-sm px-1">yellow</mark> goalpost moving</span>
          </div>
        )}

        {/* Aggregate Metrics */}
        <MetricsSummary
          metrics={manifest.aggregateMetrics}
          iterations={iterations}
          labels={iterLabels}
          currentIter={iter}
        />

        {/* Question Selector */}
        <QuestionSelector
          questions={manifest.questions}
          selectedIdx={questionIdx}
          onSelect={(idx) => { setQuestionIdx(idx); setIterIdx(0); }}
        />

        {/* Question Header */}
        {questionMeta && (
          <div className="mt-6 mb-2 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-neutral-300 leading-relaxed">
                  <MathText>{questionMeta.question}</MathText>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-800/50">
                    Answer: <MathText>{`$${questionMeta.gold_answer}$`}</MathText>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                    {questionMeta.topic}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Iteration Slider */}
        <IterationSlider
          iterations={iterations}
          labels={iterLabels}
          currentIdx={iterIdx}
          onChange={setIterIdx}
          timeline={decisionTimeline}
        />

        {/* Transcript */}
        {iterData ? (
          <TranscriptCard
            key={`${questionIdx}-${iter}`}
            transcript={iterData.transcript}
            judgeDecision={iterData.judge_decision}
            judgeResponse={iterData.judge_response}
            correct={iterData.correct}
            reward={iterData.reward}
            iteration={iter}
            iterLabel={iterLabels[iter]}
            showAnnotations={showAnnotations}
            annotations={iterAnnotations}
          />
        ) : questionData === null ? (
          <div className="rounded-lg bg-[#132a2e] border border-white/10 p-8 text-center">
            <p className="text-neutral-500 text-sm font-mono">Loading transcript...</p>
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-4 mt-12">
        <div className="max-w-6xl mx-auto text-xs text-neutral-500">
          <p>
            Keyboard: ← → slide iterations · ↑ ↓ change question · A toggle annotations
          </p>
        </div>
      </footer>
    </div>
  );
}
