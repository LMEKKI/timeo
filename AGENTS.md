# AGENTS.md — Timeo

> Ce fichier guide les agents IA ET le développeur junior. Il est la porte d'entrée du projet.

## Projet

**Solo dev junior**, 10 utilisateurs internes, 1 mois de test terrain.
**Timeo** — Application de gestion d'interventions terrain (10 utilisateurs, v1).
Monorepo Bun + Turborepo : `server/` (Hono + Drizzle), `client/` (React + Vite), `shared/` (Zod).

## Documentation ( lire dans l'ordre )

1. `docs/SPEC-V1.md` — Spécification fonctionnelle (source de vérité métier)
2. `docs/CONVENTIONS.md` — Règles de code (Clean Code, KISS, YAGNI)
3. `docs/PR-PLAN.md` — Plan d'implémentation (6 PRs par phase)
4. `docs/IA-PROMPT-TEMPLATES.md` — 🆕 Ressources IA (templates de prompts)
5. `docs/DESIGN.md` — Design system (Violet Issue)
6. `docs/BRANCHING.md` — Stratégie de branches

## Stack

| Couche | Outil |
|---|---|
| Runtime | Bun 1.2.4 |
| API | Hono + Hono RPC |
| ORM | Drizzle |
| Auth | Better Auth (plugin username) |
| Auth admin | Plugin admin Better Auth (création de techs par le chef, server-side) |
| Frontend | React 19 + Vite 6 |
| UI | shadcn/ui (Violet Issue theme) |
| Data fetching | TanStack Query |
| Routing | TanStack Router |
| Validation | Zod (source de vérité) |
| Linter | Biome |
| DB | PostgreSQL (Supabase) |
| Deploy | Vercel |

## Commandes

```bash
bun install              # Installer les deps
bun run dev              # Démarrer client + server
bun run lint             # Linter (Biome)
bun run type-check       # Type checker (tsc --noEmit)
bun run build            # Build tous les packages
bun run db:generate      # Générer migration Drizzle
bun run db:push          # Pousser le schema en DB (dev)
bun run db:seed          # Seed le 1er chef (une seule fois, après PR #2)
```

## Conventions clés ( résumé )

- **Code en anglais**, UI en français, commits/PRs/doc en français
- **Enums en anglais en BDD/code, labels français en UI** : `status: 'planned'` en code, "Planifié" en UI
- **Zod = source de vérité** — pas de types manuels dupliqués
- **Format d'erreur canonique** : `{ error: { code, message, field? } }`
- **Colonnes BDD en anglais** : `status`, `priority`, `startTime`, etc.
- **Pas de classes, pas d'interfaces avec 1 impl, pas de patterns overkill**
- **Fichier > 250 lignes = split** | **Fonction > 30 lignes = extraire**
- **Pas de tests unitaires en v1** (test = usage réel)
- **Pas de `any`** — toujours typer
- **Named exports uniquement** (pas de default export)
- **Early return** — pas de nesting profond

## KISS / YAGNI ( rappels constants )

- Un seul plan de PR (`docs/PR-PLAN.md`)
- **Polling** (TanStack Query `refetchInterval`) pour le quasi-realtime, pas de SSE/EventSource
- Timeline simple, pas de Gantt interactif
- Pas de reset password par email (chef reset manuellement)
- Pas de PWA/offline, pas de notifications push
- Biome remplace ESLint (un outil, pas deux)

## Workflow Git

Voir `docs/BRANCHING.md` et `CONTRIBUTING.md` pour le détail.

```
main (production) ← PR ← dev (staging) ← PR ← feat/phase-X-nom
```

- **Jamais de push direct sur main ou dev** — PR obligatoire
- **Commits conventionnels** : `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- **1 PR = 1 phase** du plan (**6 PRs total** pour v1)
- **Validation PR** : `bun run lint && bun run type-check && bun run build`

## Pièges connus

| Piège | Solution |
|---|---|
| Better Auth schema mismatch | Ne pas modifier `server/src/db/schema/better-auth.ts` |
| Circular imports Drizzle | FK avec arrow functions : `() => table.column` |
| CORS client/server | `CORS_ORIGIN` dans `.env.local` des deux côtés |
| Soft delete | Toujours filtrer `isNull(deletedAt)` dans les queries |
| Role escalation | PAS de PATCH /users/:id/role (interdit). Le chef utilise `auth.api.createUser()` du plugin admin avec `role: 'tech'` |
| SSE = v2 | Pas d'EventSource ni de WebSocket en v1. Polling only. |
| Better Auth admin plugin = OBLIGATOIRE | Pour la création de techs. Ne pas coder un POST /users custom. |
| First user = chef | Via seed Drizzle (`bun run db:seed`). Pas de signup ouvert. |
| Leaflet / map UI = v2 | Geocoding + proximity OK en v1, mais l'affichage carte attend v2. |
| Templates IA | Avant chaque tâche, consulter `docs/IA-PROMPT-TEMPLATES.md` pour le bon template de prompt IA. |

## Avant de coder

1. Lire `docs/PR-PLAN.md` pour savoir quelle phase on fait
2. Créer la branche : `git checkout -b feat/phase-X-nom`
3. Coder par petit commit (1 commit = 1 tâche du plan)
4. Valider : `bun run lint && bun run type-check && bun run build` (+ `bun run db:seed` après merge PR #2)
5. PR vers `dev` avec le template
6. Self-review (voir `CONTRIBUTING.md` § self-review)
7. Squash merge
