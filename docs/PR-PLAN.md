# Plan des PRs — Timeo v1.0.0

> **Document unique d'implémentation.** 6 PRs, plan "polish" validé.
> **Principes :** KISS (un seul plan, un seul format d'erreur), YAGNI (pas de tests unitaires, pas de Realtime complexe, pas de SSE).
> **Solo dev junior** + 1 agent IA (co-pilote senior).

## Stratégie

- Chaque PR = 1 phase → 1 branche `feat/phase-X-nom` + 1 PR vers `dev`
- PR merge dans `dev` → CI passe → prêt pour la suivante
- Après PR #6 → merge `dev` → `main` + tag `v1.0.0`
- **KISS :** 6 PRs, pas 42 micro-PRs. Le commit est l'unité de travail, pas la PR.

---

## PR #1 — feat/phase-1-foundation

**Branche :** `feat/phase-1-foundation` → `dev`
**Durée estimée :** 2-3h
**Contexte :** base saine avant tout code métier.

**KISS/YAGNI :**
- KISS : Biome remplace ESLint (un outil au lieu de deux)
- YAGNI : Pas de commitlint (Husky + lint-staged suffit)
- YAGNI : Pas de tests unitaires en v1

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Supprimer ESLint client | `client/eslint.config.js` (delete), `client/package.json` (modify) | `bun run lint` |
| 2 | Setup Biome racine | `biome.json` (create), root `package.json` (modify) | `bun run lint` |
| 3 | Husky + lint-staged | `.husky/pre-commit` (create), root `package.json` (modify) | commit test |
| 4 | Git guardrails pre-push | `.husky/pre-push` (create) | push to main blocked |
| 5 | CI GitHub Actions | `.github/workflows/ci.yml` (create) | CI green |
| 6 | Nettoyer Turborepo (retirer task `test`) | `turbo.json` (modify) | `bun run build` |
| 7 | Fixer `postinstall` → `predev` | root `package.json` (modify) | `bun run dev` |
| 8 | Créer `tsconfig.json` par workspace | `server/`, `client/`, `shared/` | `bun run type-check` |
| 9 | Fixer CORS_ORIGIN (throw si vide, `credentials: true`) | `server/src/index.ts` (modify) | manual test |
| 10 | Retirer default export app | `server/src/index.ts` (modify) | `bun run lint` |
| 11 | Helper `auditFields` | `server/src/db/helpers.ts` (create) | `bun run build:server` |
| 12 | Mettre à jour `.env.example` | `.env.example` (modify) | manual review |

**Validation finale :** `bun run lint && bun run type-check && bun run build`

---

## PR #2 — feat/phase-2-auth

**Branche :** `feat/phase-2-auth` → `dev`
**Durée estimée :** 4-5h
**Contexte :** Better Auth + plugin admin + tous les schemas BDD + 1er chef.

**KISS/YAGNI :**
- KISS : `role` via plugin admin (path A) avec `createAccessControl` + `ac.newRole()`, pas de table `user_profiles` séparée
- YAGNI : Pas de `/auth/forget-password` ni `/auth/reset-password` (chef reset via `auth.api.setUserPassword`)
- KISS : `mustChangePassword` = additionalField custom (boolean, `input: false`, `returned: true`)
- KISS : Format d'erreur canonique unique `{ error: { code, message, field? } }`
- KISS : IDs `text` pour tables Better Auth (standard), `uuid` pour tables custom

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Config Better Auth + plugin `admin` + `username` + `emailAndPassword` | `server/src/auth.ts` | `bun run build:server` |
| 2 | Fixer les 4 schemas Better Auth (text IDs) | `server/src/db/schema/{user,session,account,verification}.ts` | `bun run build:server` |
| 3 | Helper `auditFields` (créé en PR #1) | `server/src/db/helpers.ts` | exists |
| 4 | Migrer `user.ts` vers `pgEnum` (role, availabilityStatus) | `server/src/db/schema/user.ts` | `bun run build:server` |
| 5 | Ajouter `mustChangePassword` à `additionalFields` (boolean, input: false) | `server/src/auth.ts`, `server/src/db/schema/user.ts` | `bun run build:server` |
| 6 | Rendre `email` nullable sur user | `server/src/db/schema/user.ts` | `bun run build:server` |
| 7 | Retirer `image` de user (YAGNI) | `server/src/db/schema/user.ts` | `bun run build:server` |
| 8 | Zod schemas shared (auth, user, common) | `shared/src/schemas/*.ts`, `shared/src/index.ts` | `bun run build:shared` |
| 9 | Lib env (Zod validation env vars au boot) | `server/src/lib/env.ts` | `bun run build:server` |
| 10 | Lib errors (handleError + ErrorCode enum) | `server/src/lib/errors.ts` | `bun run build:server` |
| 11 | Middleware `requireAuth` + `requireChef` | `server/src/middleware/{auth,guard}.ts` | `bun run build:server` |
| 12 | Hono setup corrigé (CORS, env, error handler, mount Better Auth) | `server/src/index.ts` | `bun run build:server` |
| 13 | Mount Better Auth handler (`/api/auth/*`) | `server/src/index.ts` | manual test |
| 14 | Routes auth (sign-in, sign-out, change-password, me) | `server/src/routes/auth.ts` | manual test |
| 15 | Routes users (POST/PATCH via `auth.api.createUser` du plugin admin) | `server/src/routes/users.ts` | manual test |
| 16 | Script seed (1er chef via Drizzle direct + `ctx.password.hash()`) | `server/src/db/seed.ts`, root `package.json` (script `db:seed`) | `bun run db:seed` |

**Validation finale :** `bun run type-check && bun run build`
**Action post-merge :** `bun run db:seed` une fois pour créer le 1er chef

---

## PR #3 — feat/phase-3-data-api

**Branche :** `feat/phase-3-data-api` → `dev`
**Durée estimée :** 5-6h
**Contexte :** tous les schemas Drizzle métier + toutes les routes API REST + geocoding + proximity.

**KISS/YAGNI :**
- KISS : `pgEnum` pour status, priority, role, availabilityStatus (vraie contrainte BDD, perf meilleures, beta.2 fix)
- YAGNI : Pas de `endTime` (status `completed` suffit), pas de `source`/`crmId` (v2), pas de `image` (déjà retiré en PR #2)
- KISS : Geocoding = 1 appel Google Maps API, pas de cache en v1
- KISS : Proximity = Haversine + seuil de distance (3 km par défaut), pas d'algo TSP

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Schema `addresses` (vide → implémenté, uuid id, `auditFields`) | `server/src/db/schema/addresses.ts` | `bun run build:server` |
| 2 | Schema `clients` (uuid id, PAS de `source`/`crmId`) | `server/src/db/schema/clients.ts` | `bun run build:server` |
| 3 | Schema `interlocuteurs` (uuid id, `isPrimary: boolean`) | `server/src/db/schema/interlocuteurs.ts` | `bun run build:server` |
| 4 | Schema `interventions` (5 statuts, PAS d'`endTime`, `pgEnum` status/priority) | `server/src/db/schema/interventions.ts` | `bun run build:server` |
| 5 | Schema `intervention_technicien` (junction, composite PK, `teamRole` enum) | `server/src/db/schema/intervention-technicien.ts` | `bun run build:server` |
| 6 | Schema `intervention_notes` (append-only, pas d'updatedAt) | `server/src/db/schema/intervention-notes.ts` | `bun run build:server` |
| 7 | Update `schema/index.ts` (exports dans le bon ordre : junction après parents) | `server/src/db/schema/index.ts` | `bun run build:server` |
| 8 | Zod schemas clients (create, update, address) | `shared/src/schemas/client.ts` | `bun run build:shared` |
| 9 | Zod schemas interventions (create, update, transition, note) | `shared/src/schemas/intervention.ts` | `bun run build:shared` |
| 10 | Routes clients CRUD + interlocuteurs | `server/src/routes/clients.ts` | `bun run build:server` |
| 11 | Routes interventions CRUD + assign/unassign | `server/src/routes/interventions.ts` | `bun run build:server` |
| 12 | Route transition (workflow 5 statuts) | `server/src/routes/interventions.ts` | manual test |
| 13 | Route notes (tech append-only) | `server/src/routes/interventions.ts` | manual test |
| 14 | Service geocoding (Google Maps Geocoding API) | `server/src/services/geocoding.ts` | `bun run build:server` |
| 15 | Service proximity (Haversine + threshold) | `server/src/services/proximity.ts` | `bun run build:server` |
| 16 | Route proximity/group | `server/src/routes/proximity.ts` | `bun run build:server` |
| 17 | Routes dashboard (stats, activity) | `server/src/routes/dashboard.ts` | `bun run build:server` |
| 18 | Migration Drizzle initiale | `bun run db:generate`, `server/src/db/migrations/*` | `bun run db:push` |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #4 — feat/phase-4-frontend-chef

**Branche :** `feat/phase-4-frontend-chef` → `dev`
**Durée estimée :** 5-6h
**Contexte :** tout le frontend chef (dark mode Violet Issue).

**KISS/YAGNI :**
- YAGNI : Timeline horizontale simple, PAS de Gantt interactif
- KISS : Composants shared (InterventionCard, StatusBadge) réutilisés chef + tech
- YAGNI : Pas de drag & drop sur le calendrier, pas de map UI (Leaflet = v2)
- KISS : shadcn avec Vite (`npx shadcn@latest init -t vite`, `rsc: false`)
- KISS : TanStack Router file-based avec layouts pathless (`_authed.chef.tsx`)

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Setup Vite 6 + React 19 + Tailwind 4 + shadcn (avec `init -t vite`) | `client/vite.config.ts`, `client/components.json`, `client/src/index.css` | `bun run build:client` |
| 2 | Setup TanStack Router + Query + `createRootRouteWithContext` | `client/src/router.tsx`, `client/src/main.tsx`, `client/src/routes/__root.tsx` | `bun run build:client` |
| 3 | Setup `authClient` (Better Auth React + `credentials: "include"`) | `client/src/lib/auth-client.ts` | `bun run build:client` |
| 4 | RPC client Hono (avec cookies) | `client/src/lib/api.ts` | `bun run build:client` |
| 5 | Hook `useAuth` + composable `auth-guard` | `client/src/hooks/use-auth.ts` | `bun run build:client` |
| 6 | Pages login + changer-mot-de-passe + profil | `client/src/routes/login.tsx`, `changer-mot-de-passe.tsx`, `profil.tsx` | `bun run build:client` |
| 7 | Layouts + auth guard (pathless) | `client/src/routes/_authed.tsx`, `_authed.chef.tsx`, `_authed.tech.tsx` | `bun run build:client` |
| 8 | Layout chef (sidebar collapsible, dark mode Violet Issue) | `client/src/components/layout/chef-layout.tsx`, `sidebar.tsx` | `bun run build:client` |
| 9 | Hooks TanStack Query (interventions, clients, users, dashboard) | `client/src/hooks/*` | `bun run build:client` |
| 10 | Composants shared (InterventionCard, StatusBadge, PriorityBadge, MultiAssignBadge) | `client/src/components/shared/*` | `bun run build:client` |
| 11 | Page dashboard chef (KPIs + fil activité + non assignées, polling 10s) | `client/src/routes/chef/dashboard.tsx` | manual test |
| 12 | Page interventions (liste + search bar + filtres Zod via `validateSearch`) | `client/src/routes/chef/interventions.tsx` | manual test |
| 13 | Page détail intervention (assign + note chef + transition, optimistic update) | `client/src/routes/chef/intervention-detail.$id.tsx` | manual test |
| 14 | Page clients (liste + search + détail + interlocuteurs) | `client/src/routes/chef/clients.tsx`, `client-detail.$id.tsx` | manual test |
| 15 | Page techs (liste + change dispo) | `client/src/routes/chef/techs.tsx` | manual test |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #5 — feat/phase-5-frontend-tech

**Branche :** `feat/phase-5-frontend-tech` → `dev`
**Durée estimée :** 3-4h
**Contexte :** frontend tech mobile-first, light mode Violet Issue, 2 onglets (pas 3, pas de map).

**KISS/YAGNI :**
- KISS : GPS = intent URL vers app externe (Waze/Maps), pas de calcul d'itinéraire
- YAGNI : Pas de mode offline (connexion terrain suffisante)
- KISS : Optimistic updates sur transitions (UX immédiate)
- KISS : Polling 2s pour la liste missions

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Layout tech (bottom bar, light mode, 2 onglets : Missions + Profil) | `client/src/components/layout/tech-layout.tsx`, `bottom-bar.tsx` | `bun run build:client` |
| 2 | Page missions (liste du jour, polling 2s via `refetchInterval`) | `client/src/routes/tech/missions.tsx` | manual test |
| 3 | Page détail mission (action button + GPS intent + notes) | `client/src/routes/tech/mission-detail.$id.tsx` | manual test |
| 4 | Bouton GPS (intent URL Waze/Maps) | `client/src/components/tech/route-button.tsx` | manual test |
| 5 | Page profil (info + change mdp + mustChangePassword flow) | `client/src/routes/tech/profil.tsx` | manual test |
| 6 | Composants tech (InterventionActionButton, notes-tech) | `client/src/components/tech/*` | `bun run build:client` |
| 7 | Skeleton de chargement (shadcn defaults) | `client/src/components/loading/*` | `bun run build:client` |
| 8 | Pages d'erreur (404, 403) | `client/src/components/errors/*` | `bun run build:client` |
| 9 | Theme provider (auto dark/light selon rôle : chef=dark, tech=light) | `client/src/components/theme-provider.tsx` | manual test |
| 10 | Tests manuels + correctifs UX | divers | manual test |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #6 — feat/phase-6-deploy

**Branche :** `feat/phase-6-deploy` → `dev`
**Durée estimée :** 2-3h
**Contexte :** mise en production Vercel + Supabase + tests terrain.

**KISS/YAGNI :**
- KISS : Vercel pour le hosting (free tier 100 GB/mois), Supabase pour la DB (500 MB free)
- KISS : `baseURL.allowedHosts: ['*.vercel.app']` pour les previews Vercel
- KISS : Pas de CI/CD custom (Vercel déploie auto sur push)

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Setup projet Supabase (PostgreSQL + DATABASE_URL) | externe | manual |
| 2 | Drizzle migrations vers Supabase | `bun run db:push` (dev), `db:generate` (prod) | manual |
| 3 | Setup projet Vercel (monorepo detection, root dir = `server/`) | externe | manual |
| 4 | `vercel.json` + `baseURL.allowedHosts: ["*.vercel.app"]` dans Better Auth | `vercel.json`, `server/src/auth.ts` | manual |
| 5 | Seed en staging (1er chef créé via `bun run db:seed`) | Vercel env vars | manual |
| 6 | Tests manuels terrain (10 users, scénarios réels) | externe | manual |
| 7 | Fixes bugs trouvés en conditions réelles | divers | `bun run lint && type-check && build` |
| 8 | Merge `dev` → `main` + tag `v1.0.0` | `git tag`, `git push --tags` | release |

**Validation finale :** `bun run type-check && bun run build`

---

## Résumé

| PR | Branche | Phase | Tâches | Durée |
|---|---|---|---|---|
| #1 | `feat/phase-1-foundation` | Foundation + tooling | 12 | 2-3h |
| #2 | `feat/phase-2-auth` | Auth (Better Auth + admin + schemas) | 16 | 4-5h |
| #3 | `feat/phase-3-data-api` | Data model + API REST | 18 | 5-6h |
| #4 | `feat/phase-4-frontend-chef` | Frontend chef | 15 | 5-6h |
| #5 | `feat/phase-5-frontend-tech` | Frontend tech | 10 | 3-4h |
| #6 | `feat/phase-6-deploy` | Deploy + Release | 8 | 2-3h |
| **Total** | | | **79** | **~22-27h** |

## Commandes par PR

```bash
git checkout dev && git pull origin dev
git checkout -b feat/phase-X-nom
# ... coder ...
bun run lint && bun run type-check && bun run build
git add -A && git commit -m "feat: description"
git push origin feat/phase-X-nom
gh pr create --base dev --title "PR #X: description"
gh pr merge --squash
```
