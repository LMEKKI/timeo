# Timeo

> Application de gestion d'interventions terrain pour 10 utilisateurs internes.
> Solo dev junior, monorepo Bun + Turborepo, déployé sur Vercel + Supabase.

**Stack :** Bun · Hono · Drizzle · Better Auth · React 19 · Vite 6 · TanStack (Query + Router) · Zod · PostgreSQL (Supabase)

---

## Démarrage rapide

```bash
# 1. Installer les dépendances
bun install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# → éditer .env.local (DATABASE_URL, BETTER_AUTH_SECRET, etc.)

# 3. Préparer la base PostgreSQL
#    Local: docker-compose up -d   (voir docker-compose.yml)
#    Ou pointer DATABASE_URL vers une instance existante

# 4. Pousser le schéma Drizzle
bun run db:push

# 5. Créer le 1er chef (une seule fois)
bun run db:seed

# 6. Lancer le dev (client + server en parallèle)
bun run dev
```

- **Client** : http://localhost:5173
- **API** : http://localhost:3000
- **Identifiants seed** : `chef` / `ChangeMeImmediately123!` (à changer au 1er login)

---

## Scripts

| Commande | Effet |
|---|---|
| `bun run dev` | Démarre client + server en parallèle (Turborepo) |
| `bun run build` | Build de tous les packages |
| `bun run lint` | Biome (lint) |
| `bun run type-check` | `tsc --noEmit` sur tous les packages |
| `bun run db:generate` | Génère une migration Drizzle |
| `bun run db:push` | Pousse le schéma vers la DB (dev uniquement) |
| `bun run db:seed` | Crée le 1er chef (une seule fois) |

---

## Structure

```
timeo/
├── api/              # Entrée Vercel serverless (Hono)
├── client/           # Frontend React + Vite
├── server/           # API Hono + Drizzle + Better Auth
├── shared/           # Schémas Zod (source de vérité)
├── docs/             # Documentation fonctionnelle et technique
├── vercel.json       # Config Vercel (monorepo)
└── turbo.json        # Pipeline Turborepo
```

---

## Documentation

- [`docs/SPEC-V1.md`](./docs/SPEC-V1.md) — Spécification fonctionnelle (source de vérité métier)
- [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) — Règles de code (Clean Code, KISS, YAGNI)
- [`docs/PR-PLAN.md`](./docs/PR-PLAN.md) — Plan d'implémentation (6 PRs par phase)
- [`docs/DESIGN.md`](./docs/DESIGN.md) — Design system (Violet Issue)
- [`docs/BRANCHING.md`](./docs/BRANCHING.md) — Stratégie de branches
- [`docs/DEPLOY.md`](./docs/DEPLOY.md) — Guide de déploiement Vercel + Supabase
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Guide du développeur solo
- [`AGENTS.md`](./AGENTS.md) — Guide pour les agents IA

---

## Deploy

Voir [`docs/DEPLOY.md`](./docs/DEPLOY.md) pour la procédure complète (Supabase + Vercel + env vars + seed du 1er chef).

Résumé :

| Composant | Service | Tier |
|---|---|---|
| API (Hono) | Vercel serverless | Gratuit |
| Frontend (React) | Vercel static | Gratuit |
| Base de données | Supabase PostgreSQL | Gratuit (500 MB) |
| Auth | Better Auth (sur Vercel) | Gratuit |
| Géocodage | Google Maps API | Gratuit (28k/mois) |

Vercel déploie automatiquement :
- `main` → production
- `dev` → preview staging
- `feat/*` → preview éphémère

---

## Conventions clés

- **Code en anglais**, UI en français, commits/PRs/doc en français
- **Zod = source de vérité** — pas de types manuels dupliqués
- **Format d'erreur canonique** : `{ error: { code, message, field? } }`
- **Pas de classes, pas d'interfaces avec 1 impl, pas de patterns overkill**
- **Fichier > 250 lignes = split** | **Fonction > 30 lignes = extraire**
- **Pas de tests unitaires en v1** (test = usage réel)
- **Polling** (TanStack Query `refetchInterval`) pour le quasi-realtime, pas de SSE/EventSource

Voir [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md) pour le détail.

---

## Licence

Propriétaire — usage interne uniquement.
