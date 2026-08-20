# Backend / API

- Prefers an ORM (e.g., Prisma) for all database access; no raw SQL unless absolutely necessary. Confidence: 0.9
- Requires centralized error handling: an asyncHandler wrapper + error middleware, with no bare try/catch scattered across route handlers. Confidence: 0.9
- Requires input validation on every API route (Zod schemas in this stack). Confidence: 0.9
- Enforces a consistent API response envelope across all routes (e.g., `{ success, data, error }`). Confidence: 0.9
- Never hardcodes secrets or DB connection URLs; `.env.example` must document every required env var (e.g., DATABASE_URL, DIRECT_URL, JWT_SECRET, PORT). Confidence: 0.9
- Pins dependencies to specific major versions and avoids the newest major when it changes setup patterns (e.g., Prisma 5.x rather than Prisma 7's config-file connection setup). Confidence: 0.85
- Rate-limits auth endpoints (e.g., login: 10 attempts / 15 min / IP) for brute-force protection. Confidence: 0.85
- Keeps demo/mock mode frontend-only — the backend serves only real registered users and contains no demo-account logic. Confidence: 0.85
- Prefers simple JWT access-token auth for MVP builds over full refresh-token flows. Confidence: 0.7
