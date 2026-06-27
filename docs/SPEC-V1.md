# Timeo — Spécification v1

> Dernière mise à jour : 2026-06-27
> Statut : Validé — prêt pour le plan d'implémentation

---

## 1. Résumé du projet

**Timeo** est une application de gestion d'interventions pour une équipe de techniciens terrain et un chef de service.

**Objectif v1 :** Dashboard de visibilité pour le chef + interface mobile simple pour les techs. 10 utilisateurs internes. 1 mois de test en conditions réelles.

**Problème résolu :**
- Chef : aucun visibilité sur la charge, Excel = friction maximale, pas d'optimisation des trajets
- Tech : liste des interventions avec actions simples, navigation GPS

---

## 2. Utilisateurs

| Rôle | Qui | Créé par | Accès |
|---|---|---|---|
| **Chef** | Admin/gestionnaire | — (premier compte) | Dashboard, CRUD clients/interventions/techs, attribution, notes |
| **Technicien** | Interveneur terrain | Chef | Liste inter du jour, actions status, GPS, notes |

**Statut disponibilité tech** (géré par le chef) :
- `available`
- `on_mission`
- `absent`

**Premier utilisateur (chef) créé via `bun run db:seed`** (Drizzle direct insert). Pas d'endpoint public d'inscription.

**Assignation :** Multi-tech (1 ou plus). Badge "Multi-assigné" visible. Dernier update de status gagne en BDD.

---

## 3. Authentification

**Solution :** Better Auth avec plugin `username`

**Flow :**
1. Chef crée un tech → username + mdp provisoire + `mustChangePassword: true`
2. Tech se connecte → username + mdp → redirect page "Changer mon mdp"
3. Tech change son mdp → `mustChangePassword: false`
4. Tech peut changer son mdp quand il veut (page profil)
5. Si tech perd accès → chef génère nouveau mdp provisoire → restart flow

**Plugins Better Auth :**
- `emailAndPassword` — obligatoire pour Better Auth
- `username` — remplace email comme identifiant de login
- `admin` — plugin officiel Better Auth, fournit `auth.api.createUser()` server-side avec gestion des rôles (chef/tech) et permissions granulaires

**Imports :**
```ts
import { betterAuth } from "better-auth"
import { emailAndPassword, username } from "better-auth/plugins" // tree-shaking
```

**Client React :**
```ts
import { createAuthClient } from "better-auth/react"
const authClient = createAuthClient({ plugins: [username()] })
```

**Plugin admin :**
```ts
import { admin } from "better-auth/plugins"
import { createAccessControl } from "better-auth/plugins/access"

const statement = {
  user: ["create", "list", "set-role", "set-password"],
  intervention: ["create", "update", "delete", "read"],
} as const
const ac = createAccessControl(statement)
const chef = ac.newRole({ user: ["create", "list", "set-password"], intervention: ["create", "update", "delete", "read"] })
const tech = ac.newRole({ intervention: ["read", "update"] })
// plugins: [admin({ ac, roles: { chef, tech }, defaultRole: "tech", adminRoles: ["chef"] }), username()]
```

**`mustChangePassword` n'est pas built-in Better Auth.** C'est un additionalField custom (boolean, `input: false`). Le client lit `session.user.mustChangePassword` après login et redirige vers `/changer-mot-de-passe` si true.

**Migration :** Après ajout des plugins → `npx @better-auth/cli@latest migrate`

**Sécurité :**
- Token = HttpOnly cookie
- Pas de JWT en localStorage
- Rate limiting natif Better Auth

---

## 4. Modèle de données

### Better Auth (géré par Better Auth)

```
user
├── id (text, PK) ← Better Auth standard, NE PAS MODIFIER
├── email (string, unique, nullable) ← avec plugin username, email devient optionnel
├── name (string)
├── username (string, unique) ← plugin username
├── displayUsername (string) ← plugin username
├── emailVerified (boolean)
├── mustChangePassword (boolean, default: false) ← custom additional field
├── role (string) ← plugin admin
├── createdAt (timestamp)
└── updatedAt (timestamp)

session
├── id (text, PK) ← Better Auth standard
├── userId (text, FK → user)
├── expiresAt (timestamp)
├── token (string)
├── ipAddress (string)
└── userAgent (string)
```

### Notre modèle métier

```
user_profiles
├── userId (uuid, PK, FK → user.id)
├── role (enum: 'chef' | 'tech')
├── mustChangePassword (boolean, défaut: true)
├── availabilityStatus (enum: 'available' | 'on_mission' | 'absent')
├── avatarUrl (string, nullable)
├── createdAt (timestamp)
└── updatedAt (timestamp)

addresses
├── id (uuid, PK)
├── street (string)
├── city (string)
├── postalCode (string)
├── latitude (decimal, nullable)
├── longitude (decimal, nullable)
└── createdAt (timestamp)

clients
├── id (uuid, PK)
├── name (string)
├── addressId (uuid, FK → addresses)
├── phone (string)
├── email (string, nullable)
├── notes (text, nullable)
├── createdAt (timestamp)
└── updatedAt (timestamp)

interlocuteurs
├── id (uuid, PK)
├── clientId (uuid, FK → clients)
├── name (string)
├── phone (string)
├── email (string, nullable)
├── role (string, nullable)
├── createdAt (timestamp)
└── updatedAt (timestamp)

interventions
├── id (uuid, PK)
├── title (string)
├── description (text, nullable)
├── clientId (uuid, FK → clients)
├── interlocuteurId (uuid, FK → interlocuteurs, nullable)
├── date (date)
├── startTime (time)
├── priority (enum: 'low' | 'high' | 'urgent', nullable)
├── status (enum: 'unassigned' | 'planned' | 'started' | 'completed' | 'cancelled')
├── chefNote (text, nullable)
├── deletedAt (timestamp, nullable)
├── createdAt (timestamp)
└── updatedAt (timestamp)

intervention_technicien (junction)
├── interventionId (uuid, FK → interventions)
├── userId (uuid, FK → user.id)
└── PRIMARY KEY (interventionId, userId)

intervention_notes
├── id (uuid, PK)
├── interventionId (uuid, FK → interventions)
├── userId (uuid, FK → user.id)
├── content (text)
└── createdAt (timestamp)
```

### Relations

- client → address (1:1)
- client → interlocuteurs (1:N)
- client → interventions (1:N)
- intervention → interlocuteur (N:1, optionnel)
- intervention ↔ users (N:N via junction)
- intervention → notes (1:N)
- user → notes (1:N)

### Index

- `interventions.date` + `interventions.status`
- `intervention_technicien.userId`
- `intervention_notes.interventionId`
- `clients.name`
- `addresses.latitude` + `addresses.longitude`

### Sécurité BDD

- Soft delete sur `clients` et `interventions` (`deletedAt`)
- Contrainte PK composite sur `intervention_technicien` (anti-doublon)
- Escalade de rôle impossible : API vérifie que seul le chef peut modifier `role`
- **FK avec arrow functions** : `() => table.column` pour éviter les circular dependencies
- **Index Drizzle** : `interventions.date` → `.index('idx_interventions_date')`

**IDs :** tables Better Auth (user, session, account, verification) = `text`. Tables custom (addresses, clients, interlocuteurs, interventions, etc.) = `uuid` (PostgreSQL `gen_random_uuid()`).

---

## 5. API

**Stack :** Hono + Hono RPC (pas de wrapper fetch)
**Validation :** Zod sur chaque endpoint

### Setup Hono

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS
app.use('*', cors({ origin: process.env.CORS_ORIGIN }))

// Error handler global
app.onError((err, c) => {
  console.error(err)
  return c.json({
    error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur' }
  }, 500)
})

// Routes chaînées + export type pour RPC
const routes = app
  .get('/interventions', ...)
  .post('/interventions', ...)
export type AppType = typeof routes
```

### Auth

| Méthode | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/auth/sign-in` | 🌐 Public | Connexion username + mdp |
| POST | `/auth/sign-out` | 🌐 Public | Déconnexion |

### Format d'erreur canonique

Toutes les erreurs API suivent ce format unique :

```ts
{
  error: {
    code: string,        // Code métier (NOT_FOUND, VALIDATION_ERROR, etc.)
    message: string,     // Message en français pour l'utilisateur
    field?: string       // Optionnel : champ concerné (erreurs validation)
  }
}
```

**Codes d'erreur métier :**
- `VALIDATION_ERROR` — Champ invalide ou manquant (400)
- `UNAUTHORIZED` — Non authentifié (401)
- `FORBIDDEN` — Rôle insuffisant (403)
- `NOT_FOUND` — Ressource introuvable (404)
- `CONFLICT` — Conflit métier (transition invalide, doublon) (409)
- `INTERNAL_ERROR` — Erreur serveur (500)

**Règle KISS :** Un seul format, une seule fonction `handleError()` côté client.

### Users

| Méthode | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/users` | 🔴 Chef | Créer un tech |
| GET | `/users` | 🔴 Chef | Liste des techs |
| GET | `/users/:id` | 🔴 Chef | Détail tech |
| PATCH | `/users/:id` | 🔴 Chef | Modifier tech |
| DELETE | `/users/:id` | 🔴 Chef | Soft delete tech |
| PATCH | `/users/:id/status` | 🔴 Chef | Changer dispo tech |
| GET | `/users/me` | 🟢 Les deux | Mon profil |

**Implémentation** : utilise `auth.api.createUser()` du plugin admin Better Auth, qui gère le hash du mdp + l'assignation de `role` server-side. Le chef passe son cookie de session dans `headers`.

### Clients

| Méthode | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/clients` | 🔴 Chef | Créer |
| GET | `/clients` | 🔴 Chef | Liste + recherche |
| GET | `/clients/:id` | 🔴 Chef | Détail + historique |
| PATCH | `/clients/:id` | 🔴 Chef | Modifier |
| DELETE | `/clients/:id` | 🔴 Chef | Soft delete |
| POST | `/clients/:id/interlocuteurs` | 🔴 Chef | Ajouter interlocuteur |
| PATCH | `/clients/:id/interlocuteurs/:iid` | 🔴 Chef | Modifier interlocuteur |
| DELETE | `/clients/:id/interlocuteurs/:iid` | 🔴 Chef | Supprimer interlocuteur |

### Interventions

| Méthode | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/interventions` | 🔴 Chef | Créer |
| GET | `/interventions` | 🟢 Les deux | Liste (filtrée auto si tech) |
| GET | `/interventions/:id` | 🟢 Les deux | Détail |
| PATCH | `/interventions/:id` | 🔴 Chef | Modifier champs + noteChef |
| DELETE | `/interventions/:id` | 🔴 Chef | Soft delete |
| POST | `/interventions/:id/assign` | 🔴 Chef | Assigner tech(s) |
| DELETE | `/interventions/:id/assign/:userId` | 🔴 Chef | Retirer tech |
| POST | `/interventions/:id/transition` | 🔵 Tech assigné | Changer status |
| POST | `/interventions/:id/notes` | 🔵 Tech assigné | Ajouter noteTech |

### Dashboard

| Méthode | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/dashboard/stats` | 🔴 Chef | KPIs du jour |
| GET | `/dashboard/activity` | 🔴 Chef | Fil d'activité récente |
| GET | `/dashboard/grouping` | 🔴 Chef | Suggestions regroupement |
| POST | `/proximity/group` | 🔴 Chef | Calculer groupes par distance |

### Permissions résumé

| Action | Chef | Tech |
|---|---|---|
| CRUD clients | ✅ | ❌ |
| CRUD interventions | ✅ | ❌ |
| CRUD users | ✅ | ❌ |
| Assigner interventions | ✅ | ❌ |
| Annuler interventions | ✅ | ❌ |
| Gérer dispo techs | ✅ | ❌ |
| Voir dashboard | ✅ | ❌ |
| Voir ses interventions | ✅ | ✅ (filtré) |
| Voir détail intervention | ✅ | ✅ (si assigné) |
| Transitionner status | ✅ | ✅ (si assigné) |
| Ajouter noteTech | ❌ | ✅ (si assigné) |
| Modifier noteChef | ✅ | ❌ |

---

## 6. Workflow intervention

### Cycle de vie

```
unassigned → planned → started → completed
                                ↓
                            cancelled (chef only)
```

### Actions

| Action | Qui | Quand |
|---|---|---|
| Créer | Chef | N'importe quand |
| Assigner | Chef | Depuis la liste ou le détail |
| Démarrer | Tech assigné | Statut = planned |
| Clôturer | Tech assigné | Statut = started |
| Annuler | Chef only | N'importe quand sauf completed |

### Règles

- Tech ne peut transitionner que ses propres interventions
- Dernier update de status gagne en BDD
- Pas de confirmation sur démarrer/terminer
- Confirmation obligatoire sur annuler
- Le bouton 'Démarrer' part de `planned` et va à `started`. Le statut `en_route` a été retiré en v1 (YAGNI — pas de bouton 'En route' côté tech).

---

## 7. Notes

| Qui | Où | Modifiable ? |
|---|---|---|
| Chef | Champ `noteChef` sur intervention | Oui (éditable tant que pas envoyé) |
| Tech | Table `intervention_notes` (userId + content) | Non (append-only) |

---

## 8. Dashboard chef

**Vue D hybride :**

| Zone | Contenu |
|---|---|
| Header | Date du jour, nombre total d'interventions, nombre de techs actifs |
| Calendrier | Timeline horizontale simple par tech, vue jour/semaine |
| Charge | Barre par tech : success/#3DD68C (0-2), warning/#F0C000 (3-4), error/#EB5757 (5+) |
| En attente | Liste des interventions non assignées |
| Regroupement proximity | Suggestions de groupes par distance (couleurs) |
| Temps réel | Mise à jour auto via **polling** (TanStack Query `refetchInterval` à 10s pour le dashboard) |
| Recherche rapide | Barre de recherche interventions/clients/techs |
| Fil d'activité | Dernières actions en temps réel |
| Stats | Interventions terminées, en cours, en retard, taux complétion |

### Calendrier

4 options étudiées (A: Gantt, B: Colonnes, C: Swim lanes, D: Hybride).
**Choix : D — Dashboard hybride.** Vue simple : liste de techs avec barres horizontales colorées proportionnelles à la charge. Pas de Gantt interactif en v1 (YAGNI — drag/resize/zoom = complexité inutile pour un dashboard de visibilité).

### Polling — Approche v1 (KISS)

**Pourquoi le polling plutôt que SSE ?**
- 10 utilisateurs internes → pas besoin de push sub-seconde
- SSE via Hono sur Vercel = long-running functions (30-60s timeout) + reconnexion complexe
- Polling = 0 dépendance externe, marche parfaitement sur Vercel serverless
- 10 users × 6 req/min × 5 Ko = ~18 MB/h de polling (négligeable)

**Implémentation :**
```ts
useQuery({
  queryKey: ['dashboard', 'stats'],
  queryFn: fetchDashboardStats,
  refetchInterval: 10_000,           // 10s pour le dashboard
  refetchOnWindowFocus: true,
  refetchIntervalInBackground: false, // pause quand l'onglet est caché
})
```

**Intervalles de polling par contexte :**
- Dashboard chef : 10s
- Liste missions tech : 2s
- Détail intervention : 5s

Si le besoin de push sub-seconde arrive en v2, on pourra migrer vers Supabase Realtime.

---

## 9. Interface mobile tech

**Page d'accueil :** Liste des interventions du jour

| Élément | Détail |
|---|---|
| Titre intervention | Visible en un coup d'œil |
| Client + adresse | Abrégé |
| Heure prévue | Début |
| Statut actuel | Badge coloré |
| Badge multi-assigné | Si applicable |
| Bouton d'action | Selon le status |

### Boutons d'action

| Statut | Bouton | Action |
|---|---|---|
| Planifié | **Démarrer** | Passe à démarré |
| Démarré | **Terminer** | Passe à terminé, retour liste |

### Détail intervention

- Client complet (nom, adresse, téléphone)
- Interlocuteur (si défini)
- Description / note
- Bouton **Itinéraire** → choix app GPS (intent URL)
- Notes du tech (historique + ajout)
- Badge multi-assigné

---

## 10. GPS / Itinéraire

Bouton "Itinéraire" → intent URL → choix de l'app GPS (Waze, Maps, etc.)
Pas de calcul d'itinéraire dans l'app — on ouvre l'app GPS externe.

---

## 11. Géocodage / Regroupement par proximité

**Feature :** Le chef voit des suggestions de groupes d'interventions proches.

**Approche v1 :**
- Les adresses ont `latitude` + `longitude`
- **Photon (Komoot)** pour le géocodage — gratuit, open-source (OpenStreetMap), pas d'API key
- Calcul de distance entre interventions d'une même date
- Seuil configurable (défaut: 3 km)
- Algorithme simple (pas de TSP)
- Affichage avec couleurs

L'affichage cartographique (Leaflet) est différé en v2. En v1, les groupes sont affichés en liste avec couleurs par groupe.

**API :** `POST /proximity/group` avec les IDs d'interventions → retourne les groupes suggérés.

---

## 12. CRM Integration (v2/v3)

- CRM : IOVISION
- Données custom, juste un ID de liaison
- Champ `source` sur clients : `'internal'` | `'crm'`
- Champ `crmId` : string nullable
- Validation : si `source = 'crm'` → `crmId` obligatoire
- Pas de sync bidirectionnelle pour l'instant

---

## 13. Navigation UX

### Chef — Sidebar collapsible

**Spécifications Violet Issue :**
- Largeur : 220px (étendue) → 48px (réduite)
- Fond : `#1B1B25` (dark) / `#FFFFFF` (light)
- Bordure droite : 1px `#2C2C3A`
- Items nav : 13px Inter 500, hauteur 32px, radius 8px
- Item actif : fond `#5E6AD2` à 10%, texte `#F1F1F4`
- Sections : collapsibles
- Toggle ☰ pour réduire/étendre
- État mémorisé (localStorage)

```
┌─────────────────────────────────────────────────┐
│ ☰   │  Contenu principal                        │
│     │                                           │
│ 🏠  │  [Zone de travail]                        │
│ 📋  │                                           │
│ 👥  │                                           │
│ 🔧  │                                           │
│ 👤  │                                           │
│     │                                           │
│ 🚪  │                                           │
└─────────────────────────────────────────────────┘
```

- Toggle ☰ pour réduire/étendre
- **Expanded** : icons + labels
- **Collapsed** : icons uniquement (tooltip au hover)
- État mémorisé (localStorage)

### Tech — Bottom bar colorée, pas de header

```
┌─────────────────────────────────────┐
│                                     │
│  [Zone de travail - plein écran]    │
├─────────────────────────────────────┤
│  📋 Missions │  👤 Profil            │
│  ███████████                        │
└─────────────────────────────────────┘
```

- **Pas de header** — contenu plein écran
- Bottom bar : fond coloré sur l'onglet actif (violet `#5E6AD2`)
- 2 onglets : Missions (liste) / Profil
- Simple, clean, mobile-first

### Palette spécifique mobile (light mode)

| Token | Dark | Light (mobile) |
|-------|------|----------------|
| Background | `#101014` | `#F8F9FA` |
| Surface | `#1B1B25` | `#FFFFFF` |
| Text Primary | `#F1F1F4` | `#1A1D23` |
| Border | `#2C2C3A` | `#E5E7EB` |

### Continuité UX

| Élément | Chef | Tech |
|---|---|---|
| Layout | Sidebar collapsible | Bottom bar colorée |
| Header | Recherche + activité | Aucun |
| Design system | shadcn | shadcn |
| Cartes intervention | Même composant | Même composant |
| Badge multi-assigné | Même badge | Même badge |

---

## 14. Erreurs (UX)

**Règle :** L'utilisateur ne doit jamais voir une erreur technique. Toujours un message clair et actionnable.

| Type d'erreur | Affichage | Exemple |
|---|---|---|
| Erreur réseau | Toast rouge + retry auto (1 tentative) | "Erreur de connexion. Réessayez." |
| Validation formulaire | Message sous le champ | "Ce champ est obligatoire" |
| Action échouée | Toast rouge | "Impossible de créer l'intervention" |
| Non autorisé | Redirect page erreur | "Vous n'avez pas accès à cette page" |
| Introuvable | Page 404 custom | "Cette intervention n'existe pas" |
| Update polling | Toast info | "Intervention mise à jour" |

**Pattern :**
- Toast via `sonner` (shadcn wrapper) pour les erreurs temporaires et updates temps réel
- Messages inline pour les formulaires (FieldGroup + Field)
- Pages dédiées pour les erreurs d'accès
- Anti-double-click sur les boutons d'action

---

## 15. Chargement (Loading states)

**Règle :** L'utilisateur ne doit jamais voir une page vide pendant le chargement.

| État | Affichage |
|---|---|
| Chargement initial (page) | Skeleton (shadcn) |
| Chargement liste | Skeleton ligne par ligne |
| Soumission formulaire | Spinner sur le bouton "Enregistrer" |
| Action rapide (démarrer/terminer) | Spinner sur le bouton |
| Recherche | Debounce 300ms + skeleton |
| Transitions optimistes | Pas de skeleton, mise à jour inline |

**Optimistic updates :** Quand le tech clique "Terminer", on met à jour l'UI immédiatement sans attendre la réponse API (meilleure UX).

**Composants :**
- `Skeleton` (shadcn) — pour les pages et listes. Pas de `animate-pulse` custom.
- `Spinner` — pour les boutons d'action
- Pas de page de chargement plein écran (jamais)

---

## 16. Validation Zod — Flow optimisé

**Principe :** Un seul schéma Zod = validation client + serveur + erreurs typées.

### Serveur — Hono middleware global

- Validation automatique sur chaque route
- Erreur structurée : `{ error: { code: "VALIDATION_ERROR", message: "Titre obligatoire", field: "title" } }`
- Code HTTP adapté (400, 404, 403, etc.)

### Client — React Hook Form + Zod

- Même schéma, validation instantanée
- Erreur affichée SOUS le champ, pas dans un toast
- Pas de duplication de code
- **Form layout :** `FieldGroup` + `Field` (shadcn), pas de `div` avec `space-y-*`

### Hono RPC — Erreurs typées

- Le client reçoit l'erreur TYPIFIED, pas de `any`
- Error = `{ error: { code: string, message: string, field?: string } }`

### TanStack Query — Patterns

- **Query keys :** Arrays hiérarchiques : `['interventions', { date, status }]`
- **staleTime :** 30s (données changeantes), 5min (données stables)
- **Cache invalidation :** Après mutation → `queryClient.invalidateQueries({ queryKey: ['interventions'] })`
- **Optimistic updates :** UI immédiate + rollback en cas d'erreur

### TanStack Router — Patterns

- **Type registration :** Enregistrer le routeur pour l'inférence de types
- **Code splitting :** Utiliser `.lazy.tsx` pour chaque route
- **Search params :** Toujours valider avec Zod
- **Error 404 :** Composant `notFound` custom

---

## 17. Variables d'environnement

### Serveur

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL PostgreSQL Supabase | `postgresql://...` |
| `BETTER_AUTH_SECRET` | Secret Better Auth | `cle-aleatoire_32+chars` |
| `BETTER_AUTH_URL` | URL du serveur | `http://localhost:3000` |
| ~~`GOOGLE_MAPS_API_KEY`~~ | ~~Retiré en v1.0.1 (migration vers Photon/OSM)~~ | N/A |
| `CORS_ORIGIN` | Origine autorisée | `http://localhost:5173` |
| `PORT` | Port du serveur | `3000` |

### Client

| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de l'API Hono | `http://localhost:3000` |

### Fichier `.env.example`

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/timeo
BETTER_AUTH_SECRET=change-me-32-chars-minimum
BETTER_AUTH_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:5173
PORT=3000
VITE_API_URL=http://localhost:3000
```

---

## 18. Deploy

### Architecture

| Composant | Service | Tier |
|---|---|---|
| API (Hono) | Vercel (serverless) | Gratuit |
| Frontend (React) | Vercel (static) | Gratuit |
| Base de données | Supabase (PostgreSQL) | Gratuit (500 MB) |
| Auth | Better Auth (sur Vercel) | Gratuit |
| Géocodage | Photon (OSM) | Gratuit |
| Realtime | Polling (TanStack Query) | Gratuit |

### Structure Vercel

```
timeo.vercel.app
├── /api/* → Hono (serverless function)
└── /* → React SPA (static)
```

**BaseURL Better Auth :** ajouter `allowedHosts: ['*.vercel.app']` dans la config Better Auth pour les previews Vercel.

### Migration DB

- Drizzle Kit pour les migrations
- `drizzle-kit generate` → `drizzle-kit push` (en dev)
- `drizzle-kit generate` → migration manuelle (en prod)
- **Mieux :** `npx @better-auth/cli@latest migrate` pour Better Auth, puis `drizzle-kit generate` pour les tables métier
- **Seed :** `bun run db:seed` crée le 1er chef (Drizzle direct insert + bcrypt hash)

### Turborepo — Règles

- **Package tasks** : scripts dans chaque `package.json`, root = delegation uniquement
- **`turbo run`** dans les scripts, jamais le shorthand `turbo`
- **`^build`** pour builder les dépendances en premier
- **Outputs** : définir `dist/**` pour chaque task qui produit des fichiers

### Limites free tier

| Service | Limite | Impact v1 (10 users) |
|---|---|---|
| Vercel | 100 GB bandwidth/mois | ✅ Largement suffisant |
| Supabase | 500 MB DB, 50k MAU | ✅ Largement suffisant |
| Photon (OSM) | Pas de limite stricte | ✅ ~100/jour max |

---

## 19. Stack technique

| Couche | Outil |
|---|---|
| Runtime | Bun |
| API | Hono + Hono RPC |
| ORM | Drizzle |
| Auth | Better Auth (plugins `username` + `admin`) — `better-auth/react` côté client |
| Frontend | React + Vite |
| UI | shadcn/ui (sonner pour toasts, Skeleton pour loading) |
| Data fetching | TanStack Query |
| Routing | TanStack Router |
| Monorepo | Turborepo |
| DB | Supabase (PostgreSQL) |
| Deploy | Vercel (Hono adapter) |
| Validation | Zod (source de vérité) |
| Maps | Leaflet (open source) |
| Geocoding | Photon (OSM, open source) |

---

## 20. Design System

**Base :** [Violet Issue](https://designmd.ai/chef/violet-issue) par @chef — design system conçu pour les outils de suivi et de gestion de projet.

**Détail complet :** voir [`docs/DESIGN.md`](./DESIGN.md)

### Résumé

| Élément | Dark (chef desktop) | Light (tech mobile) |
|---------|---------------------|---------------------|
| Fond | `#101014` | `#F8F9FA` |
| Surfaces | `#1B1B25` | `#FFFFFF` |
| Texte | `#F1F1F4` | `#1A1D23` |
| Accent | `#5E6AD2` (violet) | `#5E6AD2` (identique) |
| Typo | Inter + JetBrains Mono | Inter + JetBrains Mono |
| Spacing | Base 4px | Base 4px |
| Radius | 4-6-8-12px | 4-6-8-12px |
| Animations | ≤ 150ms | ≤ 150ms |

### Statuts → Couleurs

Des **statuts d'intervention (5 états)**.

| Statut | Couleur | Code |
|--------|---------|------|
| `unassigned` | Gris | `#8A8F98` |
| `planned` | Violet (primary) | `#5E6AD2` |
| `started` | Or (warning) | `#F0C000` |
| `completed` | Émeraude (success) | `#3DD68C` |
| `cancelled` | Rouge corail (error) | `#EB5757` |

**Mapping enum → label UI :**
```ts
const STATUS_LABEL_FR: Record<InterventionStatus, string> = {
  unassigned: 'Non assigné',
  planned: 'Planifié',
  started: 'Démarré',
  completed: 'Terminé',
  cancelled: 'Annulé',
}
```

### Composants clés
- **Sidebar :** 220px → 48px collapsible, fond `#1B1B25`
- **Boutons :** 28px (compact) / 32px (standard), radius 6px
- **Chips :** 20px hauteur, 4px radius, 11px font
- **Listes :** rows 36px, pas de bordures visibles
- **Command palette :** Cmd+K, 560px, fond `#1F1F2E`
- **Modals :** fond `#1F1F2E`, shadow subtile + backdrop blur

---

## 21. Principes d'architecture

- **Feature-driven** (pas layer-first)
- **Zod = source de vérité** (pas de types séparés)
- **Pas d'interfaces avec 1 implémentation**
- **Hono RPC** direct (pas de wrapper fetch)
- **Pas de tests unitaires** pour v1 (test = usage réel)
- **Solo dev** — simplicité > perfection
- **Pas de PWA/offline** pour v1
- **Responsive** — un seul codebase

### KISS — Keep It Simple, Stupid

- **Un seul format d'erreur API** — pas de variants selon l'endpoint
- **Un seul plan de PR** — PR-PLAN.md, pas de découpage en 42 micro-PRs
- **Polling** (TanStack Query `refetchInterval`) — pas besoin de SSE/Supabase Realtime pour 10 users
- **Timeline simple** — pas de Gantt interactif pour de la visibilité
- **Colonnes BDD en anglais** — uniforme, pas de mix FR/EN

### YAGNI — You Aren't Gonna Need It

- **Pas de reset password par email** — le chef reset manuellement
- **Pas de tests unitaires en v1** — test = usage réel (10 users)
- **Pas de PWA/offline** — connexion terrain suffisante
- **Pas de Gantt éditable** — visibilité seule, édition = v2 si besoin
- **Pas de notifications push** — polling suffit pour 10 users
- **Pas d'avatar/photo** — UI v1 = initiales calculées depuis `name` (champ `image` retiré en v1, YAGNI)

---

## 22. Ce qui est exclu de v1

- Compétences/qualifications des techs
- Photos sur interventions
- Rapports détaillés
- PWA / mode offline
- Notifications push
- Drag & drop sur le calendrier
- Multi-assignation avec équipe stable
- Avatar/photo de profil
- Reset mdp par email
- **Map UI (Leaflet) — v2** (geocoding + proximity logic restent en v1, affichage carte en v2)
- **Champ `image` sur user — pas d'avatar en v1**
- **Champ `endTime` sur interventions — YAGNI, le status `completed` suffit**
- **Champs `source` + `crmId` sur clients — intégration CRM = v2/v3**
- **`en_route` status — retiré, le bouton 'Démarrer' part directement de `planned`**
