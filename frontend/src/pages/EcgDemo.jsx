import { useEffect, useRef, useState } from "react";
import { Activity, HeartPulse, Zap, BrainCircuit } from "lucide-react";
import { SAMPLE_RATE, synthesizeEcg, detectRPeaks } from "../lib/ecg";

// Visual scale: 1mV = 60px tall, waveform scrolls ~30px/s.
const PX_PER_MV = 60;
const SCROLL_PX_PER_SEC = 30;

export default function EcgDemo() {
  const canvasRef = useRef(null);
  const [bpm, setBpm] = useState(75);
  const [detected, setDetected] = useState(0);
  const [peaks, setPeaks] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");

    // Fixed logical size (scaled crisply by CSS width).
    const W = canvas.width;
    const H = canvas.height;
    const midY = H / 2;

    let animationId = 0;
    let lastTs = 0;
    let scrollX = 0; // pixels consumed from the left
    let elapsed = 0; // simulated seconds of signal generated

    // Pre-generate a 20s buffer of ECG + detect peaks once (cheap, deterministic).
    const buffer = synthesizeEcg({ numSamples: SAMPLE_RATE * 20, bpm });
    const { peaks: peakSamples } = detectRPeaks(buffer);
    setDetected(bpm);

    const draw = (ts) => {
      animationId = requestAnimationFrame(draw);
      if (!running) return;
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.1, (ts - lastTs) / 1000);
      lastTs = ts;
      scrollX += dt * SCROLL_PX_PER_SEC;
      elapsed += dt;

      ctx.clearRect(0, 0, W, H);

      // --- Grid: 1s vertical lines, 0.2s minor; 0.5mV horizontal lines ---
      ctx.strokeStyle = "rgba(15, 118, 110, 0.12)";
      ctx.lineWidth = 1;
      const pxPerSec = SCROLL_PX_PER_SEC;
      for (let x = (scrollX % pxPerSec); x < W; x += pxPerSec) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let x = (scrollX % (pxPerSec / 5)); x < W; x += pxPerSec / 5) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(15, 118, 110, 0.08)";
      for (let y = midY - 2 * PX_PER_MV; y <= midY + 2 * PX_PER_MV; y += PX_PER_MV / 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // --- Baseline ---
      ctx.strokeStyle = "rgba(15, 118, 110, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(W, midY);
      ctx.stroke();

      // --- Waveform (map sample index -> x; keep phase continuous) ---
      const samplesPerPx = SAMPLE_RATE / pxPerSec;
      const startSample = Math.max(0, Math.floor(elapsed * SAMPLE_RATE) - Math.floor(W * samplesPerPx));
      ctx.strokeStyle = "#0d9488";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < W; px += 1) {
        const sample = startSample + Math.round(px * samplesPerPx);
        if (sample >= buffer.length) break;
        const v = buffer[sample];
        const y = midY - v * PX_PER_MV;
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
      }
      ctx.stroke();

      // --- R-peak markers ---
      const endSample = startSample + Math.floor(W * samplesPerPx);
      for (const p of peakSamples) {
        if (p < startSample || p > endSample) continue;
        const px = (p - startSample) / samplesPerPx;
        const y = midY - buffer[p] * PX_PER_MV;
        ctx.fillStyle = "#e11d48";
        ctx.beginPath();
        ctx.arc(px, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(225, 29, 72, 0.35)";
        ctx.beginPath();
        ctx.moveTo(px, y - 14);
        ctx.lineTo(px, y + 14);
        ctx.stroke();
      }
    };
    animationId = requestAnimationFrame(draw);

    // Derived BPM from detected peaks over the full buffer.
    const { bpm: detectedBpm, peaks: allPeaks } = detectRPeaks(buffer);
    setDetected(detectedBpm);
    setPeaks(allPeaks.length);

    return () => cancelAnimationFrame(animationId);
  }, [bpm, running]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 mb-2">
        <Activity size={18} className="text-teal-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800">ECG Signal Lab</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Synthetic ECG (P-QRS-T) generated in-browser, with real Pan-Tompkins-style
        R-peak detection running on the raw samples.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Heart rate:
            <input
              type="range"
              min="40"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="accent-teal-600 w-40"
            />
            <span className="font-semibold text-teal-700 w-10">{bpm} BPM</span>
          </label>
          <button
            onClick={() => setRunning((r) => !r)}
            className="text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            {running ? "Pause" : "Resume"}
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            <HeartPulse size={14} className="text-rose-500" aria-hidden="true" />
            red dots = detected R peaks
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={240}
          className="w-full h-auto rounded-xl border border-teal-100 bg-white"
          aria-label="Live synthetic ECG waveform with detected R peaks"
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-teal-50 rounded-xl p-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-teal-600/70">Configured BPM</p>
            <p className="text-xl font-bold text-teal-700">{bpm}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-emerald-600/70">Detected BPM</p>
            <p className="text-xl font-bold text-emerald-700">{detected}</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-rose-600/70">R Peaks Found</p>
            <p className="text-xl font-bold text-rose-700">{peaks}</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={16} className="text-teal-600" aria-hidden="true" />
            <h2 className="font-semibold text-gray-800">Synthesis</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Each heartbeat is the sum of Gaussian bumps modeling the P wave, QRS
            complex and T wave (~1mV R spike), sampled at 250&nbsp;Hz with a small
            noise floor. No randomness — deterministic and reproducible.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-teal-600" aria-hidden="true" />
            <h2 className="font-semibold text-gray-800">Detection</h2>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Pan-Tompkins pipeline: baseline removal → derivative → squaring →
            moving-window integration → adaptive threshold → refractory period.
            BPM is derived from the median R-R interval.
          </p>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-6">
        Educational demo — synthetic signal only, not a medical device.
      </p>
    </div>
  );
}
