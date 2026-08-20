# Performance

- Uses route-based code splitting with React.lazy + Suspense (per-route chunks, not one big bundle). Confidence: 0.85
- Wraps expensive list renders in React.memo. Confidence: 0.85
- Uses stable unique key props — never array index for reorderable/filterable lists. Confidence: 0.85
