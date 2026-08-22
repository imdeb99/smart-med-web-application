import { useState } from "react";

/**
 * Avatar — renders an image if `src` is provided, otherwise falls back to a
 * colored circle with the person's initials. Broken/loading images also fall
 * back to initials.
 *
 * @param {string} name  person's name (used for initials + alt)
 * @param {string} [src] image URL
 * @param {string} [className] extra classes (e.g. "w-10 h-10 rounded-full")
 */
export default function Avatar({ name = "", src, className = "w-10 h-10" }) {
  const [error, setError] = useState(false);

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "?";

  // Deterministic teal-family background from the name so repeated renders are stable.
  const palettes = [
    "bg-teal-100 text-teal-700",
    "bg-emerald-100 text-emerald-700",
    "bg-cyan-100 text-cyan-700",
    "bg-sky-100 text-sky-700",
    "bg-indigo-100 text-indigo-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const palette = palettes[hash % palettes.length];

  if (!src || error) {
    return (
      <span
        aria-hidden="true"
        className={`inline-flex items-center justify-center rounded-full font-semibold select-none shrink-0 ${palette} ${className}`}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name || "Avatar"}
      loading="lazy"
      onError={() => setError(true)}
      className={`object-cover rounded-full shrink-0 ${className}`}
    />
  );
}
