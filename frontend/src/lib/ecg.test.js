// Unit tests for the ECG synthesis + R-peak detection pipeline.
// Run with:  node --test frontend/src/lib/ecg.test.js
// (Node's built-in test runner — no extra dependencies.)

import { test } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_RATE, synthesizeEcg, detectRPeaks, heartbeatAt } from "./ecg.js";

test("heartbeatAt has a dominant positive R spike around 22% of the beat", () => {
  const rr = 0.8;
  let best = { t: 0, v: -Infinity };
  for (let i = 0; i < 200; i++) {
    const t = (i / 200) * rr;
    const v = heartbeatAt(i, { rrSeconds: rr });
    if (v > best.v) best = { t, v };
  }
  assert.ok(best.t > 0.15 && best.t < 0.3, `R peak at ${best.t}s — expected ~0.22s`);
  assert.ok(best.v > 0.9, `R amplitude ${best.v.toFixed(2)} — expected ~1.0mV`);
});

test("detectRPeaks recovers the correct BPM for 60, 75, 120 BPM", () => {
  for (const bpm of [60, 75, 120]) {
    const signal = synthesizeEcg({ numSamples: SAMPLE_RATE * 10, bpm });
    const { peaks, bpm: detected } = detectRPeaks(signal);
    // 10s at 60bpm = 10 beats, 75bpm = ~12.5 (12-13), 120bpm = 20
    assert.ok(
      Math.abs(detected - bpm) <= 2,
      `bpm=${bpm} detected=${detected} (peaks=${peaks.length})`,
    );
  }
});

test("detected peaks are spaced by the refractory period or more", () => {
  const signal = synthesizeEcg({ numSamples: SAMPLE_RATE * 5, bpm: 100 });
  const { peaks } = detectRPeaks(signal);
  const refractory = (200 / 1000) * SAMPLE_RATE; // 50 samples
  for (let i = 1; i < peaks.length; i++) {
    assert.ok(peaks[i] - peaks[i - 1] >= refractory, `peak gap ${peaks[i] - peaks[i - 1]} < ${refractory}`);
  }
});

test("peaks align with the tallest samples of the signal (R waves)", () => {
  const signal = synthesizeEcg({ numSamples: SAMPLE_RATE * 5, bpm: 75 });
  const { peaks } = detectRPeaks(signal);
  assert.ok(peaks.length >= 4, `expected ~6 beats, got ${peaks.length}`);
  for (const p of peaks) {
    // A few samples around the peak must be near the local max.
    const window = [p - 2, p - 1, p, p + 1, p + 2].map((i) => Math.max(0, Math.min(signal.length - 1, i)));
    const localMax = Math.max(...window.map((i) => signal[i]));
    assert.ok(signal[p] >= localMax * 0.95, `sample ${p} is not a local R maximum`);
  }
});

test("same input -> same peaks (deterministic, no hidden randomness)", () => {
  const a = synthesizeEcg({ numSamples: SAMPLE_RATE * 4, bpm: 90 });
  const b = synthesizeEcg({ numSamples: SAMPLE_RATE * 4, bpm: 90 });
  assert.deepEqual(Array.from(a), Array.from(b));
  assert.deepEqual(detectRPeaks(a), detectRPeaks(b));
});

test("a flat signal yields no peaks", () => {
  const flat = new Float64Array(SAMPLE_RATE * 2); // all zeros
  const { peaks, bpm } = detectRPeaks(flat);
  assert.equal(peaks.length, 0);
  assert.equal(bpm, 0);
});
