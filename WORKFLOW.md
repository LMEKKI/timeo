# 🔄 Business Logic & State Machines

> Implémentation dans `server/src/services/` (jamais dans les routes).
> Les transitions sont testées dans les tests unitaires des services.

---

## 1. Job Status — State Machine

### Diagramme des Transitions

```
                    ┌──────────┐
                    │SCHEDULED │◄───── Création
                    └────┬─────┘
                         │
                     [Départ?]
                         │
                         ▼
                    ┌──────────┐
              ┌────►│ EN_ROUTE │◄──────────────┐
              │     └────┬─────┘               │
              │          │                     │
              │      [Arrivé?]                 │
              │          │                     │
              │          ▼                     │
              │     ┌───────────┐             │
              │     │IN_PROGRESS│             │
              │     └─────┬─────┘             │
              │           │                   │
              │      [Terminé?]               │
              │           │                   │
              │           ▼                   │
              │     ┌──────────────────┐      │
              │     │PENDING_APPROVAL  │      │
              │     └────────┬─────────┘      │
              │              │                │
              │        [Approuvé?]            │
              │              │                │
              │              ▼                │
              │     ┌──────────┐              │
              └─────┤COMPLETED │              │
                    └──────────┘              │
                                             │
              ┌──────────┐                   │
              │CANCELLED │◄───────────────────┘
              └──────────┘    (depuis SCHEDULED ou EN_ROUTE uniquement)
```

**Règle** : `CANCELLED` est accessible uniquement depuis `SCHEDULED` ou `EN_ROUTE`.

---

## 2. Validation Guards — Détaillé

Chaque transition est un **service method** avec validation explicite.

### Transition : SCHEDULED → EN_ROUTE

| | Détail |
|---|---|
| **Précondition** | Le job existe, statut = SCHEDULED |
| **Guard** | `scheduled_start_at` - now <= 24h (pas de départ anticipé) |
| **Action** | Marquer le job EN_ROUTE, enregistrer l'heure de départ |
| **Postcondition** | Statut = EN_ROUTE, audit log créé |
| **Erreurs** | `JobNotFoundError`, `InvalidTransitionError`, `EarlyDepartureError` |

**Code (Idéal)** :
```typescript
// server/src/services/job-service.ts
async startRoute(jobId: string, userId: string): Promise<Job> {
  const job = await this.jobRepo.findById(jobId)
  if (!job) throw new JobNotFoundError(jobId)
  if (job.status !== JobStatus.SCHEDULED) throw new InvalidTransitionError()
  
  const hoursUntilStart = diffHours(job.scheduledStartAt, new Date())
  if (hoursUntilStart > 24) throw new EarlyDepartureError()
  
  const updated = await this.jobRepo.updateStatus(jobId, JobStatus.EN_ROUTE, job.version)
  if (!updated) throw new OptimisticLockError() // version mismatch
  
  await this.auditRepo.log({
    jobId, userId,
    previousStatus: JobStatus.SCHEDULED,
    newStatus: JobStatus.EN_ROUTE,
  })
  
  return updated
}
```

### Transition : EN_ROUTE → IN_PROGRESS

| | Détail |
|---|---|
| **Précondition** | Statut = EN_ROUTE |
| **Guard** | **Géo-fencing** : la position GPS du technicien doit être dans `company_config.gps_threshold_meters` de la branche/client |
| **Action** | Marquer IN_PROGRESS |
| **Postcondition** | Statut = IN_PROGRESS |
| **Erreurs** | `InvalidTransitionError`, `GeofencingError` |

### Transition : IN_PROGRESS → PENDING_APPROVAL

| | Détail |
|---|---|
| **Précondition** | Statut = IN_PROGRESS |
| **Guard** | Le payload du formulaire DOIT valider le `form_template.question_schema` (Zod) |
| **Guard** | Optimistic locking : le `version` du job doit correspondre |
| **Action** | Marquer PENDING_APPROVAL, sauvegarder les réponses |
| **Postcondition** | Statut = PENDING_APPROVAL |
| **Erreurs** | `InvalidTransitionError`, `ValidationError`, `OptimisticLockError` |

### Transition : PENDING_APPROVAL → COMPLETED

| | Détail |
|---|---|
| **Précondition** | Statut = PENDING_APPROVAL |
| **Guard** | L'utilisateur doit avoir le rôle `GLOBAL_ADMIN` ou `BRANCH_MANAGER` |
| **Action** | Créer le `job_billing_snapshot` (gel des données) |
| **Postcondition** | Statut = COMPLETED, snapshot créé |
| **Erreurs** | `InvalidTransitionError`, `UnauthorizedError` |

### Transition : {SCHEDULED, EN_ROUTE} → CANCELLED

| | Détail |
|---|---|
| **Précondition** | Statut = SCHEDULED ou EN_ROUTE |
| **Guard** | Un `comment_reason` textuel OBLIGATOIRE dans `job_audit_log` |
| **Action** | Marquer CANCELLED |
| **Postcondition** | Statut = CANCELLED, audit log avec raison |
| **Erreurs** | `InvalidTransitionError`, `MissingReasonError` |

---

## 3. Optimistic Locking

Le champ `version` sur la table `job` protège contre les écritures concurrentes :

```typescript
// shared/interfaces/job-repository.ts
interface IJobRepository {
  updateStatus(id: string, newStatus: JobStatus, expectedVersion: number): Promise<Job | null>
  // Retourne null si la version ne correspond pas (conflit)
}

// SQL généré par Drizzle :
// UPDATE job SET status = ?, version = version + 1 
// WHERE id = ? AND version = ?
// Si affectedRows === 0 → conflit détecté
```

---

## 4. Gestion des Erreurs

Toutes les erreurs métier sont dans `shared/src/errors/` :

```typescript
// shared/src/errors/domain-error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string  // Ex: "JOB_NOT_FOUND", "INVALID_TRANSITION"
  abstract readonly httpStatus: number
}

// shared/src/errors/job-errors.ts
export class JobNotFoundError extends DomainError {
  code = "JOB_NOT_FOUND"
  httpStatus = 404
  constructor(id: string) { super(`Job not found: ${id}`) }
}

export class InvalidTransitionError extends DomainError {
  code = "INVALID_TRANSITION"
  httpStatus = 409
  constructor() { super("Invalid status transition") }
}

export class EarlyDepartureError extends DomainError {
  code = "EARLY_DEPARTURE"
  httpStatus = 400
  constructor() { super("Cannot start route more than 24h before scheduled time") }
}

export class GeofencingError extends DomainError {
  code = "GEOFENCING_FAILED"
  httpStatus = 403
  constructor() { super("Technician is not within the allowed geofence area") }
}

export class OptimisticLockError extends DomainError {
  code = "OPTIMISTIC_LOCK"
  httpStatus = 409
  constructor() { super("Concurrent modification detected, retry") }
}

export class MissingReasonError extends DomainError {
  code = "MISSING_REASON"
  httpStatus = 400
  constructor() { super("A cancellation reason is required") }
}
```

---

## 5. Data Storage Rules

| Type de donnée | Stockage | Exemple |
|---|---|---|
| Texte, settings, JSON | PostgreSQL (via Drizzle) | `job`, `form_template.question_schema` |
| Photos, signatures, PDFs | S3 / Cloudflare R2 | `customer_signature_image` |
| Stockage local offline | `idb-keyval` (IndexedDB) | Formulaires en cours sur le mobile |

**Règle** : La DB ne stocke que les **clés S3** pour les fichiers lourds.
**Règle** : Les signatures et photos sont uploadées directement depuis le client vers S3 via une URL pré-signée.

---

## 6. Sécurité & RLS (Row Level Security)

La sécurité est gérée à **3 niveaux** :

| Niveau | Où | Mécanisme |
|---|---|---|
| 1. API | Hono middleware | Vérification du token JWT (session) |
| 2. Métier | Services | Vérification des rôles (permissions) |
| 3. DB | Supabase RLS | Policies au niveau table (optionnel, redondant) |
