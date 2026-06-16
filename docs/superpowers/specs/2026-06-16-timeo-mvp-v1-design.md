# Timeo MVP v1 — Design Spec

> Field Service Management — Gestion d'interventions terrain
> Date : 2026-06-16

## Stack

| Couche | Choix |
|---|---|
| Runtime | Bun 1.2.4 |
| Monorepo | Turborepo (server, client, shared) |
| Backend | Hono + Drizzle ORM + PGLite (tests) |
| Frontend | React 19 + TanStack Router + TanStack Query |
| UI | Tailwind v4 + Shadcn UI |
| Auth | Better Auth (tables séparées, email/mdp) |
| Storage | Reporté v2 (interface IStorageProvider prête) |
| Validation | Zod v4 (dans shared/) |
| Tests | `bun test` + PGLite (DB) |
| Offline | Reporté v2 (TanStack Query cache mémoire) |

## Architecture

- **Hexagonale (Ports & Adapters)** : Le code métier ne dépend jamais de l'infrastructure
- `shared/` = domaine pur, zéro dépendance infra
- Container DI dans `server/src/container.ts` (un seul point de wiring)
- Dépendances unidirectionnelles : `shared/ ← server/ ← client/`

## Décisions Clés

1. **Auth** : Better Auth avec tables séparées des nôtres. Lien via `auth_provider_id` dans `user_profile`
2. **Sign-up** : Désactivé pour le MVP. Comptes seed uniquement
3. **Guards transitions** : Simplifiés — validation du statut précédent uniquement. Pas de géo-fencing, pas de formulaire dynamique
4. **Stockage fichiers** : V2. Signature = checkbox + texte pour le MVP
5. **Offline** : V2. Cache TanStack Query mémoire uniquement
6. **Tests** : `bun test` + PGLite pour adapter DB
7. **Frontend** : TanStack Router + TanStack Query, pas React Router

## MVP Scope

### Auth
- Email + mot de passe via Better Auth
- Pas de OAuth, pas de sign-up public
- Middleware Hono de vérification session
- Page login frontend

### Flux Job
- Cycle complet : SCHEDULED → EN_ROUTE → IN_PROGRESS → PENDING_APPROVAL → COMPLETED
- CANCELLED accessible depuis SCHEDULED ou EN_ROUTE (avec reason obligatoire)
- Optimistic locking (champ `version`)
- Audit log à chaque transition
- Guards simplifiés : validation du statut, existence du job, version check

### Pages Frontend
1. `/login` — formulaire email/mdp
2. `/jobs` — liste des interventions assignées au tech connecté
3. `/jobs/:id` — détail intervention avec boutons de transition

### Ce qui est EXCLU (v2+)
- Géolocalisation / géo-fencing
- Formulaires dynamiques (question_schema)
- Upload de photos/signatures
- Dashboard admin / CRUD
- Offline / IndexedDB
- Notifications push
- RLS Supabase

## Plan d'Implémentation

### Phase 1 — Infrastructure de test (server/)
1. Configurer `bun test` dans server/package.json
2. Créer `InMemoryJobRepository`, `InMemoryUserRepository`, `InMemoryAuditRepository`
3. Setup PGLite pour les tests d'intégration

### Phase 2 — Auth
4. Implémenter `BetterAuthAdapter` (implements IAuthProvider)
5. Créer le script seed (company + branch + users auth + users profil)
6. Route `POST /auth/sign-in` + middleware Hono
7. Page login frontend

### Phase 3 — Flux Job (backend)
8. Implémenter `DrizzleJobRepository` + `DrizzleAuditRepository`
9. Créer `JobService` (transitions, audit, optimistic locking)
10. Routes API : `GET /jobs`, `GET /jobs/:id`, `POST /jobs/:id/transition`
11. Migration Drizzle + seed jobs

### Phase 4 — Flux Job (frontend)
12. Page "Mes interventions" (liste)
13. Page "Détail intervention" (statuts, boutons)
14. Connexion Hono RPC

### Phase 5 — Polish
15. Gestion erreurs frontend (toasts, messages)
16. Test E2E du flux complet
