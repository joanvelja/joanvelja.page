/**
 * Extracts the 20 selected debate transcripts across 6 training checkpoints
 * and writes split JSON files for the /transcripts page.
 *
 * Outputs:
 *   public/transcripts/manifest.json   — metadata, aggregate metrics, question list (no transcript text)
 *   public/transcripts/q/0.json        — full transcript data for question 0
 *   public/transcripts/q/1.json        — etc.
 *
 * Usage: bun run scripts/prepare-transcript-data.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const TRANSCRIPT_DIR = join(import.meta.dirname, '..', 'public', 'transcripts');
const OUTPUT_DIR = join(TRANSCRIPT_DIR, 'q');
const MANIFEST_PATH = join(TRANSCRIPT_DIR, 'manifest.json');

mkdirSync(OUTPUT_DIR, { recursive: true });

const ITERATIONS = ['000000', '000040', '000050', '000060', '000090', '000105'];
const ITER_LABELS = { '000000': '0', '000040': '40', '000050': '50', '000060': '60', '000090': '90', '000105': '105' };

const SELECTED_QUESTIONS_FILE = join(import.meta.dirname, '..', 'tmp', 'transcript-selection', 'final-20.json');
const selectedQuestions = JSON.parse(readFileSync(SELECTED_QUESTIONS_FILE, 'utf-8'));

// Load all transcripts and filter to selected questions (critic-trained entries only)
const questions = [];

for (const qInfo of selectedQuestions) {
  const prefix = qInfo.question.slice(0, 60);
  const entry = {
    question: qInfo.question,
    gold_answer: null,
    topic: qInfo.topic,
    iterations: {},
  };

  for (const iter of ITERATIONS) {
    const filePath = join(TRANSCRIPT_DIR, `transcripts_eval_test_iteration_${iter}.jsonl`);
    const lines = readFileSync(filePath, 'utf-8').trim().split('\n');

    for (const line of lines) {
      const d = JSON.parse(line);
      if (d.trained_role !== 'critic') continue;
      if (!d.question.startsWith(prefix)) continue;

      entry.gold_answer = d.gold_answer;
      entry.iterations[iter] = {
        transcript: d.transcript,
        judge_decision: d.judge_decision,
        judge_response: d.judge_full_response,
        reward: d.reward,
        correct: d.metrics.proposal_correct_composite,
      };
      break;
    }
  }

  questions.push(entry);
}

// Merge annotations if available
try {
  const ANNOTATIONS_DIR = join(import.meta.dirname, '..', 'tmp', 'annotations');
  for (const batch of [1, 2, 3, 4]) {
    const batchPath = join(ANNOTATIONS_DIR, `batch-${batch}.json`);
    const batchData = JSON.parse(readFileSync(batchPath, 'utf-8'));
    for (const ann of batchData) {
      if (ann.question_index >= 0 && ann.question_index < questions.length) {
        questions[ann.question_index].annotations = ann.annotations;
      }
    }
  }
} catch { /* annotations not available */ }

// Compute aggregate metrics across ALL entries (not just selected 20)
const aggregateMetrics = {};
for (const iter of ITERATIONS) {
  const filePath = join(TRANSCRIPT_DIR, `transcripts_eval_test_iteration_${iter}.jsonl`);
  const lines = readFileSync(filePath, 'utf-8').trim().split('\n');

  let accept = 0, reject = 0, draw = 0;
  let correctRejected = 0, totalCorrect = 0;
  let t5LenSum = 0, count = 0;

  for (const line of lines) {
    const d = JSON.parse(line);
    if (d.judge_decision === 'accept') accept++;
    else if (d.judge_decision === 'reject') reject++;
    else draw++;

    if (d.metrics.proposal_correct_composite) {
      totalCorrect++;
      if (d.judge_decision === 'reject') correctRejected++;
    }

    const t5 = d.transcript.find(t => t.turn === 5);
    if (t5) { t5LenSum += t5.text.length; count++; }
  }

  aggregateMetrics[iter] = {
    total: lines.length, accept, reject, draw,
    correctTotal: totalCorrect,
    falseNegatives: correctRejected,
    falseNegativeRate: +(correctRejected / totalCorrect).toFixed(3),
    meanT5Length: Math.round(t5LenSum / count),
  };
}

// Write per-question files
for (let i = 0; i < questions.length; i++) {
  const qPath = join(OUTPUT_DIR, `${i}.json`);
  writeFileSync(qPath, JSON.stringify(questions[i]));
}

// Write manifest (question list without transcript text)
const manifest = {
  meta: {
    iterations: ITERATIONS,
    iterLabels: ITER_LABELS,
    questionCount: questions.length,
  },
  aggregateMetrics,
  questions: questions.map((q, i) => ({
    index: i,
    question: q.question,
    gold_answer: q.gold_answer,
    topic: q.topic,
    // Per-iteration decision summary for the slider (no transcript text)
    decisions: Object.fromEntries(
      ITERATIONS.map(it => [it, {
        decision: q.iterations[it]?.judge_decision,
        correct: q.iterations[it]?.correct,
        reward: q.iterations[it]?.reward,
      }])
    ),
  })),
};

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest));

// Clean up old monolithic file
try {
  const oldPath = join(TRANSCRIPT_DIR, 'debate-viewer-data.json');
  const { unlinkSync } = await import('fs');
  unlinkSync(oldPath);
  console.log('Removed old monolithic debate-viewer-data.json');
} catch { /* doesn't exist */ }

const manifestSize = (readFileSync(MANIFEST_PATH).length / 1024).toFixed(1);
console.log(`Manifest: ${MANIFEST_PATH} (${manifestSize} KB)`);
console.log(`Question files: ${questions.length} files in ${OUTPUT_DIR}`);
for (let i = 0; i < questions.length; i++) {
  const size = (readFileSync(join(OUTPUT_DIR, `${i}.json`)).length / 1024).toFixed(1);
  console.log(`  q/${i}.json: ${size} KB`);
}
