# Client — Timeo

Frontend React + Vite de l'application Timeo.

## Stack

- React 19 + Vite 6
- TanStack Query (data fetching)
- TanStack Router (routing)
- shadcn/ui (Violet Issue theme)
- Tailwind CSS 4

## Développement

```bash
bun install          # depuis la racine du monorepo
bun run dev          # démarrer le client (Vite)
bun run build        # build de production
bun run type-check   # vérification des types
```

## Structure

```
src/
├── components/    # Composants UI (shadcn + custom)
├── lib/           # Utils, clients (auth, API, query)
├── hooks/         # Hooks TanStack Query
├── routes/        # Pages TanStack Router
└── index.css      # Theme Violet Issue
```

## Documentation

- `docs/SPEC-V1.md` — Spécification fonctionnelle
- `docs/CONVENTIONS.md` — Règles de code
- `docs/DESIGN.md` — Design system
