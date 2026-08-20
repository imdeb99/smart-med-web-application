/**
 * This project uses Tailwind CSS v4 with the `@tailwindcss/vite` plugin
 * (see `vite.config.js`), so class scanning and the theme (primary teal /
 * accent emerald) are configured CSS-first in `src/index.css` via `@import
 * "tailwindcss"` and `@theme`. Tailwind v4 does not require this file to
 * build — it's kept here so editor tooling (e.g. the Tailwind CSS
 * IntelliSense extension) can resolve the project root and content globs,
 * and as a place to add JS-based config later if ever needed.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
