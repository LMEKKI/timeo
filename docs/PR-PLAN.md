# Plan des PRs — Timeo v1.0.0

> **Document unique d'implémentation.** TASKS.md et le plan superpowers ont été fusionnés ici.
> **Principes :** KISS (un seul plan, un seul format d'erreur), YAGNI (pas de tests unitaires, pas de Realtime complexe).

## Stratégie

- Chaque phase = 1 branche `feat/phase-X-nom` + 1 PR vers `dev`
- PR merge dans `dev` → CI passe → prêt pour phase suivante
- Après Phase 7 → merge `dev` → `main` + tag `v1.0.0`
- **KISS :** 8 PRs par phase, pas 42 micro-PRs. Le commit est l'unité de travail, pas la PR.

---

## PR #1 — feat/phase-1-foundation

**Branche :** `feat/phase-1-foundation` → `dev`
**Durée estimée :** 2-3h

**KISS/YAGNI :**
- KISS : Biome remplace ESLint (un outil au lieu de deux)
- YAGNI : Pas de commitlint (Husky + lint-staged suffit)
- YAGNI : Pas de tests unitaires en v1

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Supprimer ESLint client | `client/eslint.config.js` (delete), `client/package.json` (modify) | `bun run lint` |
| 2 | Setup Biome | `biome.json` (create), `package.json` (modify) | `bun run lint` |
| 3 | Husky + lint-staged | `.husky/pre-commit` (create), `package.json` (modify) | `git commit --dry-run` |
| 4 | Git guardrails | `.husky/pre-push` (create) | push to main blocked |
| 5 | CI GitHub Actions | `.github/workflows/ci.yml` (create) | CI green |
| 6 | Turborepo config | `turbo.json` (modify) | `bun run build` |
| 7 | Scripts root + .env.example | `package.json` (modify) | `bun run type-check` |

**Validation finale :** `bun run lint && bun run type-check && bun run build`

---

## PR #2 — feat/phase-2-api-auth

**Branche :** `feat/phase-2-api-auth` → `dev`
**Durée estimée :** 3-4h

**KISS/YAGNI :**
- KISS : `role` uniquement dans `user_profiles`, pas dans Better Auth additionalFields
- YAGNI : Pas de `/auth/forget-password` ni `/auth/reset-password` (chef reset manuellement)
- KISS : Format d'erreur canonique unique `{ error: { code, message, field? } }`
- KISS : Colonnes BDD en anglais (`status`, `priority`, `startTime`, etc.)

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Schema user_profiles + addresses | `server/src/db/schema/user-profiles.ts`, `addresses.ts` | `bun run build:server` |
| 2 | Schema clients + interlocuteurs | `server/src/db/schema/clients.ts`, `interlocuteurs.ts` | `bun run build:server` |
| 3 | Schema interventions + junction + notes | `server/src/db/schema/interventions.ts`, `intervention-notes.ts`, `index.ts` | `bun run build:server` |
| 4 | Zod schemas shared | `shared/src/schemas/auth.ts`, `user.ts`, `client.ts`, `intervention.ts`, `common.ts`, `shared/src/index.ts` | `bun run build:shared` |
| 5 | Better Auth setup | `server/src/auth.ts` | `bun run build:server` |
| 6 | Middleware + guards | `server/src/middleware/auth.ts`, `guard.ts`, `server/src/lib/errors.ts` | `bun run build:server` |
| 7 | Auth routes | `server/src/routes/auth.ts`, `server/src/index.ts` | `bun run build:server` |
| 8 | Users CRUD routes | `server/src/routes/users.ts`, `server/src/index.ts` | `bun run build:server` |
| 9 | Clients CRUD routes | `server/src/routes/clients.ts`, `server/src/index.ts` | `bun run build:server` |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #3 — feat/phase-3-api-metier

**Branche :** `feat/phase-3-api-metier` → `dev`
**Durée estimée :** 2-3h

**KISS/YAGNI :**
- KISS : Table TRANSITION_MAP partagée dans shared/ (client + serveur)
- YAGNI : Pas d'algorithme TSP pour proximity (simple seuil de distance)
- KISS : Geocoding = 1 appel API Google, pas de cache en v1

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Interventions CRUD + transitions + notes | `server/src/routes/interventions.ts`, `server/src/index.ts` | `bun run build:server` |
| 2 | Dashboard stats + activity | `server/src/routes/dashboard.ts`, `server/src/index.ts` | `bun run build:server` |
| 3 | Geocoding service | `server/src/services/geocoding.ts` | `bun run build:server` |
| 4 | Proximity grouping | `server/src/services/proximity.ts`, `server/src/routes/proximity.ts`, `server/src/index.ts` | `bun run build:server` |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #4 — feat/phase-4-frontend-auth

**Branche :** `feat/phase-4-frontend-auth` → `dev`
**Durée estimée :** 3-4h

**KISS/YAGNI :**
- KISS : Hono RPC direct (pas de wrapper fetch)
- KISS : Variables CSS Violet Issue (DESIGN.md) dès le départ
- YAGNI : Pas de dark mode toggle en v1 (chef = dark, tech = light, basé sur le rôle)

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Auth client + API client + Query client | `client/src/lib/auth-client.ts`, `api.ts`, `query-client.ts` | `bun run build:client` |
| 2 | Router + root route | `client/src/router.tsx`, `main.tsx`, `routes/__root.tsx` | `bun run build:client` |
| 3 | Auth hooks + guard | `client/src/hooks/use-auth.ts`, `components/auth-guard.tsx` | `bun run build:client` |
| 4 | Login + change password pages | `client/src/routes/login.tsx`, `change-password.tsx` | `bun run build:client` |
| 5 | Profil page | `client/src/routes/profil.tsx` | `bun run build:client` |
| 6 | Layout sidebar chef | `client/src/components/layout/sidebar.tsx`, `chef-layout.tsx` | `bun run build:client` |
| 7 | Layout bottom bar tech | `client/src/components/layout/bottom-bar.tsx`, `tech-layout.tsx` | `bun run build:client` |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #5 — feat/phase-5-frontend-chef

**Branche :** `feat/phase-5-frontend-chef` → `dev`
**Durée estimée :** 4-5h

**KISS/YAGNI :**
- YAGNI : Timeline horizontale simple, PAS de Gantt interactif (drag/resize/zoom = v2)
- KISS : Composants shared (InterventionCard, StatusBadge) réutilisés chef + tech
- YAGNI : Pas de drag & drop sur le calendrier

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Query hooks | `client/src/hooks/use-interventions.ts`, `use-clients.ts`, `use-users.ts`, `use-dashboard.ts` | `bun run build:client` |
| 2 | Shared components | `client/src/components/shared/intervention-card.tsx`, `status-badge.tsx`, `priority-badge.tsx`, `multi-assign-badge.tsx` | `bun run build:client` |
| 3 | Dashboard page | `client/src/routes/chef/dashboard.tsx`, `components/chef/stats-cards.tsx`, `activity-feed.tsx`, `unassigned-list.tsx` | `bun run build:client` |
| 4 | Timeline + charge (PAS de Gantt) | `client/src/components/chef/timeline-simple.tsx`, `tech-load-bar.tsx` | `bun run build:client` |
| 5 | Interventions list + form | `client/src/routes/chef/interventions.tsx`, `components/chef/intervention-form.tsx` | `bun run build:client` |
| 6 | Intervention detail + assign + notes | `client/src/routes/chef/intervention-detail.$id.tsx`, `components/chef/assign-tech-dialog.tsx`, `note-chef.tsx` | `bun run build:client` |
| 7 | Clients list + detail + forms | `client/src/routes/chef/clients.tsx`, `client-detail.$id.tsx`, `components/chef/client-form.tsx`, `interlocuteur-form.tsx` | `bun run build:client` |
| 8 | Search + map | `client/src/components/shared/search-bar.tsx`, `map-view.tsx` | `bun run build:client` |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #6 — feat/phase-6-frontend-tech

**Branche :** `feat/phase-6-frontend-tech` → `dev`
**Durée estimée :** 2-3h

**KISS/YAGNI :**
- KISS : GPS = intent URL vers app externe (Waze/Maps), pas de calcul d'itinéraire
- YAGNI : Pas de mode offline (connexion terrain suffisante)
- KISS : Optimistic updates sur transitions (UX immédiate)

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Tech interventions list + action button | `client/src/routes/tech/interventions.tsx`, `components/tech/intervention-action-button.tsx` | `bun run build:client` |
| 2 | Tech intervention detail + GPS + notes | `client/src/routes/tech/intervention-detail.$id.tsx`, `components/tech/route-button.tsx`, `notes-tech.tsx` | `bun run build:client` |
| 3 | Tech map + profile | `client/src/routes/tech/map.tsx`, `tech/profile.tsx`, `components/tech/change-password-form.tsx` | `bun run build:client` |
| 4 | Optimistic updates | `client/src/hooks/use-transition-mutation.ts` | `bun run build:client` |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #7 — feat/phase-7-realtime-polish

**Branche :** `feat/phase-7-realtime-polish` → `dev`
**Durée estimée :** 2-3h

**KISS/YAGNI :**
- KISS : SSE via Hono, PAS de Supabase Realtime (10 users = pas besoin de scalabilité)
- YAGNI : Pas de notifications push (SSE suffit)
- KISS : Pages d'erreur simples (404, 403, 500)

| # | Tâche | Fichiers | Validation |
|---|---|---|---|
| 1 | Realtime server (SSE) | `server/src/realtime/index.ts`, `handlers.ts` | `bun run build:server` |
| 2 | Realtime client (EventSource) | `client/src/lib/realtime-provider.tsx`, `realtime-hooks.ts`, `notifications.ts` | `bun run build:client` |
| 3 | Error pages | `client/src/components/errors/not-found.tsx`, `forbidden.tsx`, `server-error.tsx` | `bun run build:client` |
| 4 | Loading skeletons | `client/src/components/loading/page-skeleton.tsx`, `list-skeleton.tsx` | `bun run build:client` |
| 5 | Search full-text | `server/src/routes/search.ts`, `client/src/components/search/global-search.tsx` | `bun run build` |
| 6 | Deploy config + docs | `vercel.json`, `README.md`, `.github/CODEOWNERS` | `bun run build` |

**Validation finale :** `bun run type-check && bun run build`

---

## PR #8 — feat/release-v1.0.0

**Branche :** `dev` → `main`
**Action :** Merge final vers production + tag `v1.0.0`

```bash
git checkout main && git merge dev
git tag -a v1.0.0 -m "v1.0.0"
git push origin main --tags
```

---

## Résumé

| PR | Branche | Phase | Tâches | Durée |
|---|---|---|---|---|
| #1 | `feat/phase-1-foundation` | Foundation | 7 | 2-3h |
| #2 | `feat/phase-2-api-auth` | API Auth | 9 | 3-4h |
| #3 | `feat/phase-3-api-metier` | API Métier | 4 | 2-3h |
| #4 | `feat/phase-4-frontend-auth` | Frontend Auth | 7 | 3-4h |
| #5 | `feat/phase-5-frontend-chef` | Frontend Chef | 8 | 4-5h |
| #6 | `feat/phase-6-frontend-tech` | Frontend Tech | 4 | 2-3h |
| #7 | `feat/phase-7-realtime-polish` | Realtime + Polish | 6 | 2-3h |
| #8 | `dev` → `main` | Release v1.0.0 | — | 15min |
| **Total** | | | **45 tâches** | **~20-25h** |

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
