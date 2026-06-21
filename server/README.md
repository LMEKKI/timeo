# Server — Timeo

API Hono + Drizzle de l'application Timeo.

## Stack

- Bun + Hono (API)
- Drizzle ORM (PostgreSQL)
- Better Auth (authentification username + password)
- Zod (validation, source de vérité partagée)

## Développement

```bash
bun install          # depuis la racine du monorepo
bun run dev          # démarrer le serveur (Bun + watch)
bun run build        # build de production
bun run type-check   # vérification des types
```

## Endpoints

- `GET /api/health` — Health check
- `POST /api/auth/sign-in` — Connexion ( Better Auth )
- CRUD users, clients, interventions ( à venir )

## Structure

```
src/
├── index.ts           # Entry point Hono
├── db/
│   ├── index.ts       # Connection Drizzle
│   └── schema/        # Schémas DB ( Better Auth + métier )
├── routes/            # Routes API par entité ( à venir )
├── middleware/        # Auth + guards ( à venir )
└── lib/               # Utils ( à venir )
```

## Documentation

- `docs/SPEC-V1.md` — Spécification fonctionnelle
- `docs/CONVENTIONS.md` — Règles de code
- `docs/PR-PLAN.md` — Plan d'implémentation
