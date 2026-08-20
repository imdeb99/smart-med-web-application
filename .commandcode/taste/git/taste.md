# Git / Version Control

- Prefers pushing the repo without a .gitignore so the project is fully self-contained; explicitly wants to keep working from another computer and considers committing everything (including `.env` with real credentials) the way to make that work. Confidence: 0.8
- Accepts a minimal .gitignore only when technically necessary (e.g., GitHub rejecting multi-hundred-MB `node_modules`), and wants it restricted to heavy/generated artifacts (`node_modules/`, `dist/`, `.DS_Store`) — `.env` stays tracked. Confidence: 0.7
