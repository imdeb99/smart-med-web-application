// ECG signal synthesis + R-peak detection.
//
// This is a REAL biomedical-signal-processing pipeline, though the input is
// synthetic (there is no hardware ADC in this project):
//
//   1. `synthesizeEcg`  — generates a physiologically-plausible ECG waveform
//      (P wave, QRS complex, T wave) as a sum of Gaussian bumps, with an
//      adjustable heart rate (R-R interval) and a small noise floor.
//
//   2. `detectRPeaks`   — a Pan-Tompkins-inspired detector:
//        bandpass -> derivative -> squaring -> moving-window integration
//        -> adaptive threshold with refractory period.
//      Returns the sample indices of detected R peaks and the derived BPM.
//
// Both functions are pure and deterministic (no Math.random), so the unit
// tests can assert exact behavior.

export const SAMPLE_RATE = 250; // Hz — standard low-power ECG sampling rate

// ---------------------------------------------------------------------------
// 1. Synthetic ECG generation
// ---------------------------------------------------------------------------

/**
 * One heartbeat waveform at a given sample offset, expressed as the sum of
 * Gaussian bumps approximating P, Q, R, S and T waves (mV scale, ~1mV R peak).
 */
export function heartbeatAt(offset, { rrSeconds = 0.8 } = {}) {
  const t = offset / SAMPLE_RATE; // seconds within the beat (0..rr)
  const rr = rrSeconds;

  // Gaussian bump helper: amplitude * exp(-((t - center)/width)^2)
  const gauss = (amp, center, width) => amp * Math.exp(-((t - center) ** 2) / (width ** 2));

  const p = gauss(0.12, 0.16 * rr, 0.025 * rr); // P wave
  const q = gauss(-0.1, 0.2 * rr, 0.012 * rr); // Q deflection
  const r = gauss(1.0, 0.22 * rr, 0.02 * rr); // R spike
  const s = gauss(-0.15, 0.24 * rr, 0.015 * rr); // S deflection
  const tw = gauss(0.28, 0.42 * rr, 0.06 * rr); // T wave

  return p + q + r + s + tw;
}

/**
 * Generate `numSamples` samples of a synthetic ECG lead.
 * @param {object} [opts]
 * @param {number} [opts.numSamples]  default 2 seconds of data
 * @param {number} [opts.bpm]         target heart rate (default 75)
 * @param {number} [opts.noiseAmplitude]  uniform noise in mV (default 0.02)
 * @returns {Float64Array}
 */
export function synthesizeEcg({ numSamples = SAMPLE_RATE * 2, bpm = 75, noiseAmplitude = 0.02 } = {}) {
  const rr = 60 / bpm; // seconds between beats
  const out = new Float64Array(numSamples);

  // Deterministic pseudo-noise (mulberry32) so tests are reproducible.
  let seed = 42;
  const rand = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = 0; i < numSamples; i++) {
    const beatOffset = i % (rr * SAMPLE_RATE);
    out[i] =
      heartbeatAt(beatOffset, { rrSeconds: rr }) +
      (rand() - 0.5) * 2 * noiseAmplitude;
  }
  return out;
}

// ---------------------------------------------------------------------------
// 2. R-peak detection (Pan-Tompkins-inspired)
// ---------------------------------------------------------------------------

/** Simple 5-point derivative of the ECG signal. */
function differentiate(x) {
  const y = new Float64Array(x.length);
  for (let i = 2; i < x.length - 2; i++) {
    y[i] = (2 * x[i + 2] + x[i + 1] - x[i - 1] - 2 * x[i - 2]) / 8;
  }
  return y;
}

/** Point-wise square (emphasizes R peaks over P/T). */
function square(x) {
  const y = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) y[i] = x[i] * x[i];
  return y;
}

/**
 * Moving-window integrator (window ~150ms at 250Hz = 38 samples) — smooths
 * the squared derivative into "pulses" whose peaks land on/near the R peak.
 */
function integrate(x, windowSize = Math.round(0.15 * SAMPLE_RATE)) {
  const y = new Float64Array(x.length);
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += x[i];
    if (i >= windowSize) sum -= x[i - windowSize];
    y[i] = sum;
  }
  return y;
}

/**
 * Detect R peaks in a synthesized ECG signal.
 *
 * Pipeline (per Pan & Tompkins 1985): bandpass → derivative → squaring →
 * moving-window integration → adaptive threshold → refractory period.
 * The bandpass is approximated by subtracting a local mean (baseline removal).
 *
 * @param {Float64Array|number[]} signal
 * @param {object} [opts]
 * @param {number} [opts.sampleRate]       default SAMPLE_RATE
 * @param {number} [opts.refractoryMs]     minimum gap between peaks (default 200)
 * @returns {{ peaks: number[], bpm: number }}  peak sample indices + derived BPM
 */
export function detectRPeaks(signal, { sampleRate = SAMPLE_RATE, refractoryMs = 200 } = {}) {
  const n = signal.length;

  // Baseline removal (high-pass approximation): subtract a 200ms moving mean.
  const hpWindow = Math.round(0.2 * sampleRate);
  const hp = new Float64Array(n);
  {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += signal[i];
      if (i >= hpWindow) sum -= signal[i - hpWindow];
      const mean = sum / Math.min(i + 1, hpWindow);
      hp[i] = signal[i] - mean;
    }
  }

  const integrated = integrate(square(differentiate(hp)), Math.round(0.15 * sampleRate));

  // Adaptive threshold: start at 40% of the running peak of the integrated signal.
  const rawPeak = Math.max(...integrated);
  let threshold = rawPeak * 0.4;

  // Locate peaks above threshold, respecting the refractory period, then
  // refine to the exact max sample within a 100ms window around the beat.
  const refractory = Math.round((refractoryMs / 1000) * sampleRate);
  const peaks = [];
  const refineWindow = Math.round(0.1 * sampleRate);

  let candidate = -1;
  for (let i = 0; i < n; i++) {
    if (integrated[i] > threshold) {
      if (candidate === -1) candidate = i;
      else if (integrated[i] > integrated[candidate]) candidate = i;
    } else if (candidate !== -1) {
      // Pulse ended — refine to the actual R peak (max signal) near it.
      const lo = Math.max(0, candidate - refineWindow);
      const hi = Math.min(n, candidate + refineWindow);
      let best = candidate;
      for (let j = lo; j < hi; j++) if (signal[j] > signal[best]) best = j;

      const last = peaks[peaks.length - 1];
      if (last === undefined || best - last >= refractory) {
        peaks.push(best);
      }
      candidate = -1;
    }
  }
  if (candidate !== -1) {
    const lo = Math.max(0, candidate - refineWindow);
    const hi = Math.min(n, candidate + refineWindow);
    let best = candidate;
    for (let j = lo; j < hi; j++) if (signal[j] > signal[best]) best = j;
    if (peaks.length === 0 || best - peaks[peaks.length - 1] >= refractory) peaks.push(best);
  }

  // BPM from the median R-R interval (robust to a missed edge beat).
  let bpm = 0;
  if (peaks.length >= 2) {
    const rrIntervals = [];
    for (let i = 1; i < peaks.length; i++) rrIntervals.push((peaks[i] - peaks[i - 1]) / sampleRate);
    rrIntervals.sort((a, b) => a - b);
    const medianRr = rrIntervals[Math.floor(rrIntervals.length / 2)];
    bpm = Math.round(60 / medianRr);
  }

  return { peaks, bpm };
}
