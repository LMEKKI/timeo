# Guide de déploiement — Timeo v1

> Procédure complète pour mettre Timeo en production sur Vercel + Supabase.
> Solo dev + 1 agent IA. Pas de CI/CD custom (Vercel déploie auto sur push).

---

## Vue d'ensemble

| Composant | Service | Tier gratuit |
|---|---|---|
| API (Hono) | Vercel serverless function | 100 GB bandwidth/mois |
| Frontend (React) | Vercel static | Inclus |
| Base de données | Supabase PostgreSQL | 500 MB, 50k MAU |
| Auth | Better Auth (sur Vercel) | Inclus |
| Géocodage | Google Maps API | 28k requêtes/mois |
| Realtime | Polling TanStack Query | Inclus |

### Architecture runtime

```
timeo.vercel.app
├── /api/*  →  Vercel serverless function (api/index.ts → Hono)
└── /*      →  Static SPA (client/dist/index.html)
```

- **Monorepo Bun + Turborepo** buildé par Vercel (`bun run build`).
- **SPA routing** : toutes les routes non-`/api` sont réécrites vers `index.html` (TanStack Router gère le routing côté client).
- **Pas de SSE/WebSocket** : le quasi-realtime est géré par polling TanStack Query (`refetchInterval` 2-10s).

---

## Prérequis

- [x] Repo GitHub connecté
- [x] Compte [Vercel](https://vercel.com) (gratuit)
- [x] Compte [Supabase](https://supabase.com) (gratuit)
- [x] Compte [Google Cloud](https://console.cloud.google.com) avec une clé API Maps JavaScript / Geocoding activée
- [x] Bun 1.2.4 installé localement (pour le seed initial)

---

## Étape 1 — Créer le projet Supabase

1. Aller sur https://supabase.com/dashboard
2. **New project** :
   - Name : `timeo-prod`
   - Database password : **générer et stocker** (nécessaire pour `DATABASE_URL`)
   - Region : `West EU (Ireland)` (le plus proche de la France)
   - Plan : Free
3. Attendre que le projet soit prêt (~2 min)
4. **Settings → Database → Connection string → Transaction mode (port 6543)** :
   - Copier l'URL : `postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`
   - **C'est cette URL qu'on met dans `DATABASE_URL`** (le pooler gère mieux les connexions serverless)

> **Pourquoi le pooler (port 6543) ?** Les fonctions serverless Vercel ouvrent/ferment des connexions à chaque invocation. Le pooler Supabase mutualise ces connexions, évite l'épuisement du pool PostgreSQL, et reste sous la limite de 60 connexions du plan gratuit.

---

## Étape 2 — Connecter le repo à Vercel

1. Aller sur https://vercel.com/new
2. **Import** le repo `LMEKKI/timeo`
3. **Configure Project** :
   - Project Name : `timeo`
   - Framework Preset : **Other** (Vercel ne supporte pas nativement Bun + Turborepo)
   - Root Directory : `./` (laisser vide — repo root)
   - Build Command : **laisser vide** (lu depuis `vercel.json`)
   - Install Command : **laisser vide** (lu depuis `vercel.json`)
   - Output Directory : **laisser vide** (lu depuis `vercel.json`)
4. **Environment Variables** — ajouter (voir tableau ci-dessous)
5. **Deploy** (premier déploiement = preview par défaut)

> **Note :** Vercel auto-détecte Turborepo (`turbo.json` à la racine) et utilise `vercel.json` pour le reste. Le `outputDirectory: "client/dist"` indique où Vercel trouve le bundle statique. Le dossier `api/` est détecté automatiquement pour les serverless functions.

---

## Étape 3 — Variables d'environnement Vercel

Dans **Vercel → Settings → Environment Variables**, ajouter pour **Production**, **Preview**, et **Development** (avec valeurs différentes si besoin) :

| Variable | Valeur Production | Valeur Preview/Dev | Notes |
|---|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres` | idem ou DB de staging | Pooler Supabase (port 6543) |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | différent en dev | **32+ chars obligatoires.** Jamais committer. |
| `BETTER_AUTH_URL` | `https://timeo.vercel.app` | `https://timeo-dev.vercel.app` (ou vide) | URL de la deployment |
| `CORS_ORIGIN` | `https://timeo.vercel.app` | `https://timeo-dev.vercel.app` | Sans trailing slash |
| `VITE_API_URL` | `https://timeo.vercel.app` | `https://timeo.vercel.app` (ou vide) | Vite remplace à build time. Vide = même origine (recommandé pour preview auto). |
| `GOOGLE_MAPS_API_KEY` | Clé API restreinte au domaine Vercel | idem | Restreindre la clé sur Google Cloud Console |
| `NODE_ENV` | `production` | `production` | Pour Vercel serverless |

### Générer `BETTER_AUTH_SECRET`

```bash
openssl rand -base64 32
# → ex: 8K3p2xN9... (44 chars)
```

### Restreindre la clé Google Maps

Dans Google Cloud Console → APIs & Services → Credentials → Edit key :
- **Application restrictions** : HTTP referrers
- **Website restrictions** :
  - `https://timeo.vercel.app/*`
  - `https://*.vercel.app/*` (pour les previews)
- **API restrictions** : Geocoding API uniquement

---

## Étape 4 — Pousser le schéma Drizzle

### En dev (local)

```bash
bun run db:push
```

### En production (Supabase)

Option A — **Via Vercel CLI** (recommandé) :

```bash
npm i -g vercel
vercel login
vercel link  # lie le repo local au projet Vercel
vercel env pull .env.production  # récupère les env vars
bun run db:push  # utilise DATABASE_URL de .env.production
```

Option B — **Via Supabase SQL Editor** :
1. `bun run db:generate` localement
2. Copier le SQL généré dans `server/src/db/migrations/`
3. Coller dans Supabase → SQL Editor → Run

> **Recommandation v1 :** Option A. Le `db:push` est idempotent et adapté à un MVP solo.

---

## Étape 5 — Seed du 1er chef (une seule fois)

```bash
# Avec les env vars de production
vercel env pull .env.production
bun run db:seed
```

Output attendu :
```
✓ Chef créé : chef (chef@timeo.local)
⚠ Mot de passe provisoire : ChangeMeImmediately123!
→ Changez-le après la première connexion.
```

> **Important :** le seed est idempotent — si des users existent déjà, il ne fait rien. Ne pas re-run en production sauf pour reset.

Se connecter sur https://timeo.vercel.app/login avec `chef` / `ChangeMeImmediately123!`, puis **changer le mot de passe** (le flow `mustChangePassword` force ce changement au 1er login).

---

## Étape 6 — Créer les comptes techs

Une fois le chef connecté, utiliser l'UI chef pour créer les techs (via le plugin admin Better Auth, jamais en SQL direct) :

1. **Chef → Techs → Nouveau tech**
2. Username + mot de passe provisoire + nom
3. Le tech se connecte → flow `mustChangePassword` → change son mdp
4. Le tech a accès à son interface mobile

> **Pourquoi le plugin admin ?** Le plugin Better Auth `admin` gère le hashing bcrypt, les sessions, et la table `user.role`. Pas de manipulation SQL manuelle = pas de risque d'incohérence.

---

## Étape 7 — Configurer les branches Vercel

Dans **Vercel → Settings → Git** :
- **Production Branch** : `main`
- **Branch Deployments** : All branches (previews auto pour chaque `feat/*`)

Déploiement automatique :

| Branche | URL | Environnement |
|---|---|---|
| `main` | `timeo.vercel.app` | Production |
| `dev` | `timeo-dev.vercel.app` | Staging |
| `feat/*` | `timeo-feat-xxx.vercel.app` | Preview éphémère |

> **Limitation v1 connue :** `VITE_API_URL` est baked au build time. Les previews pointent vers la prod si `VITE_API_URL` est set à l'URL prod. C'est acceptable pour v1 (10 users internes) — un fix v2 rendra l'URL dynamique.

---

## Vérification post-deploy

Checklist à valider sur https://timeo.vercel.app :

- [ ] La page de login charge
- [ ] Login `chef` / mdp provisoire → redirection vers changement de mdp → dashboard chef
- [ ] Création d'un client + adresse → apparaît dans la liste
- [ ] Création d'une intervention → apparaît dans la timeline
- [ ] Assignation d'un tech → l'intervention apparaît sur l'UI tech
- [ ] Login tech sur mobile → mission list affiche l'intervention assignée
- [ ] Démarrer / terminer mission → status mis à jour, visible côté chef
- [ ] Filtre recherche interventions → résultats instantanés
- [ ] Le polling refresh la liste (ouvrir 2 onglets, modifier dans un, attendre 10s)

---

## Limites du free tier (v1, 10 users)

| Service | Limite | Conso estimée v1 | Marge |
|---|---|---|---|
| Vercel bandwidth | 100 GB/mois | ~500 MB/mois | ✅ 200x |
| Vercel function executions | 1M/mois | ~50k/mois | ✅ 20x |
| Supabase DB | 500 MB | ~10 MB | ✅ 50x |
| Supabase MAU | 50k | 10 | ✅ 5000x |
| Google Maps Geocoding | 28k/mois | ~100/jour = 3k/mois | ✅ 9x |

Pas de risque de saturation en v1.

---

## Troubleshooting

### "CORS_ORIGIN mismatch" au login

- Vérifier que `CORS_ORIGIN` matche exactement l'URL du client (sans trailing slash)
- En local : `http://localhost:5173`
- En prod : `https://timeo.vercel.app`
- Vercel a peut-être besoin d'un redeploy après changement d'env var

### "BETTER_AUTH_URL not set" en prod

- Ajouter `BETTER_AUTH_URL=https://timeo.vercel.app` dans Vercel env vars
- Redeploy

### "DATABASE_URL connection failed"

- Vérifier que l'URL utilise le **pooler** (port 6543), pas la connexion directe (port 5432)
- Le pooler est obligatoire pour les serverless functions (connexions éphémères)

### Page blanche après deploy

- Vérifier `outputDirectory: "client/dist"` dans `vercel.json`
- Vérifier que `bun run build` produit bien `client/dist/index.html`
- Console browser : les erreurs 404 sur les assets = `outputDirectory` mal configuré

### Le polling ne refresh pas

- Vérifier la console réseau : les requêtes `/api/interventions` arrivent toutes les 2-10s ?
- Si non : vérifier `refetchInterval` dans les hooks TanStack Query
- Si oui : le problème est côté serveur (vérifier les logs Vercel)

### Rollback

En cas de bug critique en prod :

1. **Vercel → Deployments** → sélectionner le dernier déploiement stable → **Promote to Production**
2. Pas besoin de toucher au code, le rollback est instantané

Pour un fix rapide :

```bash
git checkout main
git pull
git checkout -b hotfix/description
# ... fix ...
git push origin hotfix/description
# → PR vers main + dev (voir docs/BRANCHING.md)
```

---

## Variables d'environnement (résumé)

```bash
# Serveur
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://timeo.vercel.app
CORS_ORIGIN=https://timeo.vercel.app
GOOGLE_MAPS_API_KEY=<clé Google Cloud restreinte>
NODE_ENV=production

# Client (build time)
VITE_API_URL=https://timeo.vercel.app
```

Voir [`.env.example`](../.env.example) pour le template local.

---

## Références

- [Vercel — Monorepos](https://vercel.com/docs/monorepos)
- [Vercel — Functions](https://vercel.com/docs/functions)
- [Supabase — Connection pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Hono — Vercel adapter](https://hono.dev/docs/getting-started/vercel)
- [Better Auth — Vercel deploy](https://better-auth.com/docs/integrations/vercel)
- [Google Maps — API key restrictions](https://cloud.google.com/docs/authentication/api-keys#api_key_restrictions)
