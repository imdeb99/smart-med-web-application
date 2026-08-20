# Taste
- Works through large refactors module-by-module, one module at a time (e.g., Patient → Doctor → Admin → Shared), never touching everything at once. Confidence: 0.85
- Gates each module with lint + build, fixing every warning before moving to the next module. Confidence: 0.85
- Verifies responsive design at mobile (375px), tablet (768px), and desktop (1280px), fixing overflow/wrapping/layout breaks. Confidence: 0.8
- Keeps code to production/industry standard: no unused imports/variables/console.logs; PascalCase components, camelCase functions/variables. Confidence: 0.85
- DRY: any logic or markup repeated 2+ times should be extracted into a shared component or hook; reuses existing shared logic (e.g., the same ProtectedRoute) rather than writing parallel implementations for new routes. Confidence: 0.9
- Uses consistent design tokens — same button variants, spacing scale, and color palette everywhere; no one-off inline colors or spacing values; new pages must reuse the existing container width, typography, and spacing rather than introducing a new layout style. Confidence: 0.9
- Role-based routing guards must block wrong-role access (redirect to the user's own role dashboard) and redirect unauthenticated users to the login page. Confidence: 0.8
- Auth redirects must preserve the user's intended destination: when an unauthenticated user tries to open a protected feature, redirect to /login with the path stashed (e.g., `from` in router state or a `?redirect=` query param) and navigate them back to that exact page after login/demo succeeds — "protect on click, redirect back after login". Confidence: 0.9
- Keeps protected feature links visible in the navbar for all users, guests included; gates access at click/route level instead of hiding the links, and shows a contextual message on the login page (e.g., "Please log in or try our demo to access this feature.") explaining why the user was redirected. Confidence: 0.85
 the same source (Footer and Contact page) instead of duplicating values inline. Confidence: 0.85
- Placeholder/demo content must be explicitly labeled as such (e.g., legal pages marked "[Placeholder — replace with actual legal text]") so it is never mistaken for real content. Confidence: 0.85
- Prefers lucide-react for icons (explicitly requested for new share icons). Confidence: 0.65
- When a spec is declared complete, does not want clarifying questions — make reasonable assumptions and proceed. Confidence: 0.9
- Prefers building large features in explicit phases and verifying each phase works end-to-end (e.g., manual curl/Postman tests against a running server) before moving to the next phase. Confidence: 0.85
- Wants a short summary table of endpoints/routes (method, path, auth requirement) after each build phase. Confidence: 0.8
- Wants the exact prescribed file/folder structure followed as-is; do not restructure or introduce parallel layouts. Confidence: 0.85
