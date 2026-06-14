# 🏗️ Architecture — Ports & Adapters (Hexagonal)

> **Principe fondateur** : Le code métier ne dépend jamais d'une infrastructure spécifique.
> Changer de base de données, d'auth, ou de stockage = 1 nouvel adapter + 1 ligne de changement.

---

## 1. Tech Stack

| Couche | Technologie | Rôle |
|---|---|---|
| **Runtime** | Bun | Exécution, package manager, bundler |
| **Monorepo** | bhvr (Bun + Hono + Vite + React) | Structure du projet, Turborepo pipeline |
| **Backend** | Hono + Drizzle ORM + postgres | API, DB |
| **Frontend** | React + Vite + Tailwind + Shadcn UI | UI |
| **État client** | TanStack React Query + idb-keyval | Cache serveur + offline |
| **DB Hosting** | Supabase (Postgres) | Base de données |
| **Validation** | Zod (dans shared/) | Schemas partagés |

---

## 2. Structure du Projet

```
timeo/
├── server/                          # Backend Hono
│   ├── src/
│   │   ├── index.ts                 # Entry point, container DI
│   │   ├── container.ts             # ⚡ Wiring : branche les adapters aux services
│   │   │
│   │   ├── routes/                  # 🚪 Points d'entrée API (ultra légers)
│   │   │   ├── job.ts               #   Délègue au service, pas de logique métier
│   │   │   ├── auth.ts
│   │   │   └── ...
│   │   │
│   │   ├── services/                # 🧠 Logique métier (pure)
│   │   │   ├── job-service.ts       #   Utilise IJobRepository, pas Drizzle
│   │   │   └── ...
│   │   │
│   │   ├── adapters/                # 🔌 Implémentations concrètes
│   │   │   ├── drizzle/             #   Adapters Drizzle (une DB = un dossier)
│   │   │   │   ├── job-repository.ts
│   │   │   │   └── ...
│   │   │   ├── auth/                #   Adapters auth
│   │   │   │   ├── better-auth.ts
│   │   │   │   └── clerk.ts         #   (futur)
│   │   │   └── storage/             #   Adapters stockage
│   │   │       ├── s3.ts
│   │   │       └── r2.ts            #   (futur)
│   │   │
│   │   ├── db/                      # 📦 Drizzle schema & migrations
│   │   │   ├── schema/
│   │   │   │   ├── job.ts
│   │   │   │   └── ...
│   │   │   └── migrations/
│   │   │
│   │   └── middleware/              # Hono middleware
│   │       ├── auth.ts
│   │       └── error.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── client/                          # Frontend React
│   ├── src/
│   │   ├── components/              # Composants UI (Shadcn)
│   │   ├── pages/                   # Pages
│   │   ├── hooks/                   # Hooks React
│   │   ├── services/                # 🔌 Appels API (client Hono RPC)
│   │   ├── stores/                  # État local (idb-keyval)
│   │   └── lib/                     # Utilitaires
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                          # 🔗 Couche partagée (domaine pur)
│   ├── src/
│   │   ├── types/                   # Entités métier (Job, User, etc.)
│   │   ├── interfaces/              # 🎯 Ports (IJobRepository, IAuthProvider...)
│   │   ├── schemas/                 # Zod schemas (validation)
│   │   ├── constants/               # Enums, statuts, etc.
│   │   └── errors/                  # Domain errors
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATAMODEL.md
│   ├── WORKFLOW.md
│   ├── AGENTS.md
│   └── errors/                     # 🧠 Mémoire collective des erreurs
│       ├── README.md               #   Index + instructions
│       ├── architecture.md         #   Erreurs d'architecture
│       ├── typescript.md           #   Erreurs de types/schemas
│       ├── database.md             #   Erreurs DB/Drizzle
│       ├── auth.md                 #   Erreurs d'authentification
│       ├── frontend.md             #   Erreurs React/Vite
│       ├── process.md              #   Erreurs de processus agent
│       └── deployment.md           #   Erreurs de déploiement
│
├── turbo.json
├── package.json
└── tsconfig.json
```

---

## 3. Règle d'Or : Dépendances Unidirectionnelles

```
shared/ (ZÉRO dépendance)
    ↑
server/ (dépend de shared/)
    ↑
client/ (dépend de shared/)
```

```
server/src/
├── routes/        → dépend des services
├── services/      → dépend des interfaces (shared/) + adapters (injectés)
├── adapters/      → implémente les interfaces (shared/)
└── db/            → ne JAMAIS importer ailleurs que dans les adapters
```

**RÈGLE ABSOLUE** : `shared/` ne doit jamais importer depuis `server/` ou `client/`.

**RÈGLE ABSOLUE** : Les `services/` n'importent jamais `drizzle`, `prisma`, ou autre DB directement.

---

## 4. Pattern : Ports & Adapters

### 4.1 Pour la Base de Données

```typescript
// —— shared/interfaces/job-repository.ts (LE PORT) ——
export interface IJobRepository {
  findById(id: string): Promise<Job | null>
  findByBranch(branchId: string, opts?: PaginationOpts): Promise<Job[]>
  save(job: Job): Promise<void>
  updateStatus(id: string, status: JobStatus, expectedVersion: number): Promise<boolean>
  delete(id: string): Promise<void>
}

// —— server/adapters/drizzle/job-repository.ts (L'ADAPTER) ——
export class DrizzleJobRepository implements IJobRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: string): Promise<Job | null> {
    const row = await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id))
      .limit(1)
    return row[0] ? mapToJob(row[0]) : null
  }
  // ...
}
```

**Pour changer de DB** : crée `SqliteJobRepository implements IJobRepository` → change 1 ligne dans `container.ts`.

### 4.2 Pour l'Authentification

```typescript
// —— shared/interfaces/auth-provider.ts (LE PORT) ——
export interface IAuthProvider {
  signIn(params: SignInParams): Promise<Session>
  signUp(params: SignUpParams): Promise<User>
  signOut(sessionToken: string): Promise<void>
  getCurrentUser(sessionToken: string): Promise<User | null>
  verifySession(sessionToken: string): Promise<Session | null>
}

// —— server/adapters/auth/better-auth.ts (L'ADAPTER) ——
export class BetterAuthAdapter implements IAuthProvider {
  constructor(private db: DrizzleDB) {}
  // Implémente l'interface avec Better Auth
}

// —— server/adapters/auth/clerk.ts (ADAPTER FUTUR) ——
export class ClerkAuthAdapter implements IAuthProvider {
  constructor(private client: ClerkClient) {}
  // Implémente la MÊME interface avec Clerk
}
```

**Pour changer d'auth** : change 1 ligne dans `container.ts`.

### 4.3 Pour le Stockage Fichier

```typescript
// —— shared/interfaces/storage-provider.ts ——
export interface IStorageProvider {
  upload(key: string, data: Buffer | Blob): Promise<string>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
  delete(key: string): Promise<void>
}
```

---

## 5. Container DI (Dependency Injection)

Tout le "wiring" se fait dans **un seul fichier** :

```typescript
// server/src/container.ts
import { DrizzleJobRepository } from './adapters/drizzle/job-repository'
import { BetterAuthAdapter } from './adapters/auth/better-auth'
import { S3StorageProvider } from './adapters/storage/s3'
import { JobService } from './services/job-service'
import type { IJobRepository, IAuthProvider, IStorageProvider } from 'shared'

// 1. Database
const db = drizzle(process.env.DATABASE_URL!)

// 2. Adapters (change UNE ligne ici pour changer de techno)
const jobRepository: IJobRepository = new DrizzleJobRepository(db)
const authProvider: IAuthProvider = new BetterAuthAdapter(db)
const storageProvider: IStorageProvider = new S3StorageProvider({
  bucket: process.env.S3_BUCKET!,
  region: process.env.S3_REGION!,
})

// 3. Services
const jobService = new JobService(jobRepository, authProvider, storageProvider)

// 4. Export pour les routes
export { jobService, authProvider }
```

---

## 6. Implémentations Atomiques

Chaque feature est décomposée en étapes **indépendantes et testables** :

```
Étape 1: Définir l'interface dans shared/    [1 fichier, 15 min]
Étape 2: Écrire les tests de l'interface     [1 fichier, 15 min]
Étape 3: Implémenter l'adapter               [1 fichier, 30 min]
Étape 4: Tester l'adapter                    [1 fichier, 15 min]
Étape 5: Créer le service (logique métier)   [1 fichier, 30 min]
Étape 6: Créer la route API                  [1 fichier, 15 min]
Étape 7: Tester l'intégration                [1 fichier, 15 min]
```

**Pas de grosse PR de 20 fichiers.** Chaque étape est reviewable individuellement.

---

## 7. Règles de Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Dossiers | kebab-case | `job-repository.ts`, `job-service.ts` |
| Interfaces | Préfixe `I` majuscule | `IJobRepository` |
| Classes | PascalCase | `DrizzleJobRepository` |
| Fonctions | camelCase | `findById()` |
| Types/Entities | PascalCase | `Job`, `UserProfile` |
| Fichiers de routes | kebab-case | `job.ts`, `auth.ts` |
| Tables DB | singulier, snake_case | `job`, `user_profile` |

---

## 8. Variables d'Environnement

```env
# Fichier: server/.env.local

# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_PROVIDER=better-auth    # ou "clerk" plus tard
AUTH_SECRET=...

# Storage
STORAGE_PROVIDER=s3
S3_BUCKET=timeo-uploads
S3_REGION=eu-west-3
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# App
PORT=3000
NODE_ENV=development
```
