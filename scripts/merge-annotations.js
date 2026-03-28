/**
 * Merges annotation batches into the transcript data.json
 *
 * Usage: bun run scripts/merge-annotations.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(import.meta.dirname, '..', 'src', 'app', 'transcripts', 'data.json');
const ANNOTATIONS_DIR = join(import.meta.dirname, '..', 'tmp', 'annotations');

const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));

// Load all annotation batches
const batches = [1, 2, 3, 4];
const allAnnotations = [];

for (const batch of batches) {
  const batchPath = join(ANNOTATIONS_DIR, `batch-${batch}.json`);
  const batchData = JSON.parse(readFileSync(batchPath, 'utf-8'));
  allAnnotations.push(...batchData);
}

console.log(`Loaded ${allAnnotations.length} annotation entries`);

// Match annotations to questions by index
for (const ann of allAnnotations) {
  const qIdx = ann.question_index;
  if (qIdx >= 0 && qIdx < data.questions.length) {
    data.questions[qIdx].annotations = ann.annotations;
    console.log(`  Q${qIdx}: ${Object.keys(ann.annotations).length} iterations annotated`);
  }
}

// Verify all questions have annotations
let missing = 0;
for (let i = 0; i < data.questions.length; i++) {
  if (!data.questions[i].annotations) {
    console.warn(`  WARNING: Q${i} has no annotations`);
    missing++;
  }
}

writeFileSync(DATA_PATH, JSON.stringify(data));
const size = (readFileSync(DATA_PATH).length / 1024).toFixed(0);
console.log(`\nWrote ${DATA_PATH} (${size} KB, ${missing} missing)`);
