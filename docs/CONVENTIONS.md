# Timeo — Conventions de code

> **Principes :** Clean code, auto-documenté, junior-friendly, 0 over-engineering.
> **Inspiré de :** [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript), [bulletproof-react](https://github.com/alan2207/bulletproof-react), Violet Issue.
> **Dernière mise à jour :** 2026-06-21

---

## 1. Langue

| Quoi | Langue | Exemple |
|------|--------|---------|
| Code source (variables, fonctions, fichiers) | 🇬🇧 Anglais | `getInterventionById` |
| Tables, colonnes, enums BDD | 🇬🇧 Anglais | `interventions`, `status`, `priority` |
| Commentaires dans le code | 🇬🇧 Anglais | `// Only assigned tech can transition` |
| Messages utilisateur (UI) | 🇫🇷 Français | `"Intervention créée avec succès"` |
| Commits, PRs, documentation | 🇫🇷 Français | `feat: création du formulaire client` |

---

## 2. Structure des fichiers

### Ordre interne

```ts
// 1. Imports — groupés : libs → shared → local
import { Hono } from 'hono'
import { z } from 'zod'

import { createInterventionSchema } from '@shared/schemas'
import { getDb } from '@server/lib/db'

// 2. Types / Zod schemas (si propres au fichier)
const querySchema = z.object({
  date: z.string().optional(),
  status: z.enum(['planned', 'started', 'completed']).optional(),
})

// 3. Fonctions pures / helpers
function canTransition(status: Status, target: Status): boolean {
  return TRANSITION_MAP[status]?.includes(target) ?? false
}

// 4. Handler / Composant principal
export const getInterventions = async (c: Context) => { ... }

// 5. Exports (en bas de fichier)
// (TypeScript gère l'export — on évite les barrels inutiles)
```

### Taille des fichiers

| Règle | Seuil | Action |
|-------|-------|--------|
| Fichier > 250 lignes | 🔴 | Split en 2 fichiers ou extraire une fonction |
| Fonction > 30 lignes | 🟡 | Considérer l'extraction |
| Composant React > 200 lignes | 🟡 | Extraire sous-composants ou hooks |
| Fichier < 10 lignes | 🔴 | Inliner — pas de fichier pour 1 export |

---

## 3. Nommage

### Variables & fonctions

```ts
// ✅ Verbe + nom + contexte
getInterventionById(id)
updateStatus(newStatus)
validateAssignment(interventionId, userId)

// ✅ Booléens préfixés
isCompleted, hasStarted, canTransition, shouldRefresh

// ✅ Handlers préfixés
handleSubmit, onStatusChange, onChange

// ✅ Constantes en UPPER_SNAKE_CASE
const MAX_TECHNICIANS_PER_INTERVENTION = 5
const DEFAULT_PROXIMITY_KM = 3

// ❌ Jamais d'abréviations
// ❌ getInt() → getInterventionById()
// ❌ data, tmp, val, i (sauf boucle simple)
// ❌ Suffixes Data/Info/Obj
```

### Types & Enums

```ts
// ✅ PascalCase pour les types
type InterventionStatus = 'planned' | 'started' | 'completed'

// ✅ PascalCase pour les enums (pas d'enums TypeScript, utiliser const objects)
const Status = {
  PLANNED: 'planned',
  STARTED: 'started',
  COMPLETED: 'completed',
} as const

// ✅ Interfaces pour les props React
interface InterventionCardProps {
  intervention: Intervention
  onStatusChange?: (newStatus: Status) => void
}
```

### Fichiers

```ts
// ✅ kebab-case (React convention)
intervention-form.tsx
auth-middleware.ts
user-profile.ts

// ❌ Pas de PascalCase pour les fichiers
// InterventionForm.tsx ❌
```

---

## 4. Fonctions

### Une fonction = une responsabilité

```ts
// ❌ Mélange validation + logique métier + réponse
async function handleSubmit(data: unknown) {
  if (!data) throw new Error('no data')
  const validated = schema.parse(data)
  await db.insert(validated)
  return { ok: true }
}

// ✅ Chaque étape est isolée
function validateInput(data: unknown): CreateIntervention {
  return createInterventionSchema.parse(data)
}

async function createIntervention(data: CreateIntervention): Promise<Intervention> {
  return db.insert(interventions).values(data).returning()
}

// Handler = orchestring seulement
async function handleCreate(c: Context) {
  const data = validateInput(c.req.valid('json'))
  const intervention = await createIntervention(data)
  return c.json({ data: intervention }, 201)
}
```

### Éviter les flags booléens

```ts
// ❌
function getInterventions(date: string, includeDeleted: boolean) { ... }

// ✅
function getInterventions(date: string) { ... }
function getInterventionsIncludingDeleted(date: string) { ... }
```

### Éviter les effets de bord

```ts
// ❌
function assignTech(intervention: Intervention, userId: string) {
  intervention.technicians.push(userId) // mute l'input !
  return intervention
}

// ✅
function assignTech(intervention: Intervention, userId: string): Intervention {
  return {
    ...intervention,
    technicians: [...intervention.technicians, userId],
  }
}
```

---

## 5. Conditionnels

### Extraire les conditions complexes

```ts
// ❌
if (intervention.status === 'started' && intervention.technicians.includes(userId) && !intervention.isCompleted) { ... }

// ✅
const canTransition = intervention.status === 'started'
  && isTechAssigned(intervention, userId)
  && !intervention.isCompleted

if (canTransition) { ... }
```

### Early return plutôt que nesting

```ts
// ❌
function getStatusLabel(status: Status): string {
  if (status) {
    if (STATUS_LABELS[status]) {
      return STATUS_LABELS[status]
    } else {
      return 'Inconnu'
    }
  } else {
    return 'Non défini'
  }
}

// ✅
function getStatusLabel(status: Status): string {
  if (!status) return 'Non défini'
  return STATUS_LABELS[status] ?? 'Inconnu'
}
```

### Pas de négations dans les noms

```ts
// ❌
if (!isNotAssigned) { ... }

// ✅
if (isAssigned) { ... }
```

---

## 6. API — Réponses HTTP

### Convention des codes

| Code | Usage Timeo | Exemple |
|------|------------|---------|
| `200` | GET réussi, PATCH réussi | `GET /interventions/:id` |
| `201` | Création réussie | `POST /interventions` |
| `204` | Suppression réussie | `DELETE /clients/:id` |
| `400` | Validation échouée (Zod) | Champ manquant ou invalide |
| `401` | Non authentifié | Pas de session |
| `403` | Non autorisé (rôle) | Tech tente CRUD client |
| `404` | Ressource introuvable | ID inexistant |
| `409` | Conflit métier | Annuler une intervention déjà terminée |
| `429` | Rate limit | Trop de requêtes |
| `500` | Erreur serveur inattendue | Bug, DB down |

### Format de réponse

```ts
// ✅ Succès avec données
return c.json({ data: intervention }, 200)

// ✅ Succès sans contenu
return c.body(null, 204)

// ✅ Erreur structurée
return c.json({
  error: { code: 'NOT_FOUND', message: "L'intervention n'existe pas" }
}, 404)

return c.json({
  error: { code: 'VALIDATION_ERROR', message: 'Titre obligatoire', field: 'title' }
}, 400)

return c.json({
  error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur. Réessayez.' }
}, 500)

// ❌ Jamais de { success: true } sans données
```

### Codes d'erreur métier

```ts
const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const
```

---

## 7. React — Composants

### Structure d'un composant

```tsx
// 1. Imports
import { Badge } from '@client/components/ui/badge'

// 2. Types
interface Props {
  intervention: Intervention
  onAction?: (status: Status) => void
}

// 3. Composant
export function InterventionRow({ intervention, onAction }: Props) {
  const canStart = intervention.status === 'planned'
  const canComplete = intervention.status === 'started'

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-surface">
      <div className="flex items-center gap-3">
        <StatusDot status={intervention.status} />
        <div>
          <p className="text-sm font-medium">{intervention.title}</p>
          <p className="text-xs text-secondary">{intervention.clientAddress}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-secondary">{intervention.time}</span>
        {canStart && <Button size="sm" onClick={() => onAction?.('started')}>Démarrer</Button>}
        {canComplete && <Button size="sm" variant="success" onClick={() => onAction?.('completed')}>Terminer</Button>}
      </div>
    </div>
  )
}
```

### Règles React

```tsx
// ✅ Extraire la logique métier hors du JSX
const canTransition = intervention.status === 'planned'
const assignedTechs = intervention.technicians.filter(t => t.assigned)

// ✅ Props typées, jamais any
interface Props { ... }

// ✅ Composant = fonction, pas de classes
// ❌ Pas de React.FC<Props> (inutile avec TypeScript moderne)
// ❌ Pas de useMemo/useCallback par défaut (seulement si perf mesurée)
// ❌ Pas de default export (toujours named export)
```

---

## 8. Hono — Handlers

### Pattern standard

```ts
// ✅ Valider → logique métier → répondre
const updateStatus: AppRouteHandler<typeof route> = async (c) => {
  const { id } = c.req.param()
  const body = c.req.valid('json')

  const intervention = await getInterventionById(id)
  if (!intervention) {
    return c.json({
      error: { code: 'NOT_FOUND', message: 'Intervention introuvable' }
    }, 404)
  }

  if (!canTransition(intervention.status, body.status)) {
    return c.json({
      error: { code: 'CONFLICT', message: 'Transition impossible' }
    }, 409)
  }

  await updateInterventionStatus(id, body.status)
  return c.json({ data: { id, status: body.status } }, 200)
}
```

### Middleware

```ts
// ✅ Un middleware = une vérification
function requireChef(c: Context, next: Next) {
  const role = c.get('userRole')
  if (role !== 'chef') {
    return c.json({
      error: { code: 'FORBIDDEN', message: 'Accès réservé au chef' }
    }, 403)
  }
  return next()
}
```

---

## 9. Zod — Source unique de vérité

```ts
// ✅ Un schéma = validation client + serveur
// shared/src/schemas/interventions.ts
export const createInterventionSchema = z.object({
  title: z.string().min(3, 'Titre trop court').max(200),
  clientId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  priority: z.enum(['low', 'high', 'urgent']).optional(),
  description: z.string().max(1000).optional(),
})

// Type inféré automatiquement — jamais de type manuel
export type CreateIntervention = z.infer<typeof createInterventionSchema>
```

---

## 10. Commentaires

### Règle d'or

> Le code doit s'expliquer tout seul. Le commentaire explique le POURQUOI, pas le QUOI.

```ts
// ✅ Utile : explique une décision non évidente
// Haversine is used instead of Euclidean because we need
// real-world distance accounting for Earth's curvature
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number { ... }

// ✅ Utile : documente un edge case
// Workaround: Supabase realtime sometimes sends duplicate events
// within 100ms. This dedup logic prevents UI flickering.

// ❌ Inutile : répète le code
// Get intervention by id
function getInterventionById(id) { ... }

// ❌ Inutile : explique l'évident
// Return the result
return result
```

### Pas de TODO dans le code

```ts
// ❌
// TODO: fix this later

// ✅ → Créer une issue GitHub
// Voir https://github.com/LMEKKI/timeo/issues/XX
```

---

## 11. Gestion d'erreurs

### Jamais de try-catch silencieux

```ts
// ❌
try {
  await db.update(...)
} catch (e) {
  // rien
}

// ✅
try {
  await db.update(...)
} catch (e) {
  console.error('Failed to update intervention status', { id, error: e })
  return c.json({
    error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur. Réessayez.' }
  }, 500)
}
```

### Erreurs utilisateur vs erreurs techniques

```ts
// ✅ Erreur utilisateur = message en français, code HTTP adapté
return c.json({
  error: { code: 'NOT_FOUND', message: "L'intervention n'existe pas" }
}, 404)

// ✅ Erreur technique = log + message générique
console.error('DB connection failed', error)
return c.json({
  error: { code: 'INTERNAL_ERROR', message: 'Erreur serveur. Réessayez.' }
}, 500)
```

---

## 12. Asynchrone

### Toujours async/await (pas de .then())

```ts
// ❌
fetch('/api/interventions')
  .then(res => res.json())
  .then(data => setInterventions(data))

// ✅
const response = await fetch('/api/interventions')
const { data } = await response.json()
setInterventions(data)
```

### Éviter les await en série inutiles

```ts
// ❌
const techs = await getTechnicians()
const clients = await getClients()
const interventions = await getInterventions()

// ✅ (parallèle quand les données sont indépendantes)
const [techs, clients, interventions] = await Promise.all([
  getTechnicians(),
  getClients(),
  getInterventions(),
])
```

---

## 13. Imports

### Ordre et style

```ts
// 1. Libraries externes
import { Hono } from 'hono'
import { z } from 'zod'

// 2. Packages monorepo
import { createInterventionSchema } from '@shared/schemas'
import { db } from '@server/lib/db'

// 3. Imports locaux (relatifs)
import { StatusBadge } from './status-badge'
import { getInterventionById } from './queries'

// ✅ Toujours avec les vrais noms (pas d'alias sauf si conflit)
// ❌ Pas de barrel exports qui cachent la source
```

---

## 14. Ce qu'on NE fait PAS

```ts
// ❌ Classes (sauf lib externe)
class InterventionService { ... }

// ❌ Interfaces avec 1 seule implémentation
interface IInterventionRepository { ... }
class DrizzleInterventionRepository implements IInterventionRepository { ... }

// ❌ Factory, Builder, Strategy, Repository patterns
// ❌ Types manuels doublant Zod
type CreateIntervention = { ... } // ZOD LE FAIT DÉJÀ

// ❌ Fichiers index.ts qui réexportent juste
export * from './user' // INUTILE

// ❌ useMemo / useCallback par défaut
// ❌ HOCs, render props (utiliser hooks)
// ❌ Classes React (utiliser fonctions)
// ❌ default exports (utiliser named exports)
```

---

## 15. Outils

### Biome (linter + formatter)

```bash
bun run lint      # biome check
bun run format    # biome format --write
```

**`biome.json` — configuration v2.x :**

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"     // Trie les imports automatiquement
      }
    }
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  },
  "linter": {
    "rules": {
      "preset": "recommended",
      "domains": {
        "react": "recommended",
        "a11y": "all"
      },
      "style": {
        "useConst": "error",
        "useSingleVarDeclarator": "error"
      },
      "correctness": {
        "noUndeclaredDependencies": "error"
      }
    }
  },
  "vcs": {
    "clientKind": "git",
    "enabled": true,
    "useIgnoreFile": true
  }
}
```

### Husky (pre-commit)

```bash
# .husky/pre-commit
# Vérifie le lint avant chaque commit
bun run lint
```

⚠️ **Pas de `typecheck` en pre-commit** — trop lent. Le typecheck est dans la CI.

### CI (GitHub Actions)

```yaml
# .github/workflows/ci.yml
# 3 jobs : lint → typecheck → build
# Bloque le merge si échec
```

### Bun — Workspaces

```jsonc
// root package.json
{ "packageManager": "bun@1.2.4" }  // OBLIGATOIRE pour Turborepo
```

### Drizzle — Index

```ts
// ✅ Index dans le 3e argument de pgTable
const interventions = pgTable("interventions", {
  // ...
}, (table) => ({
  statusDateIdx: index("idx_status_date").on(table.status, table.date),
}))
```

### Better Auth — Imports (2026)

```ts
// ✅ Serveur
import { username, emailAndPassword } from "better-auth/plugins"

// ✅ Client React
import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

const authClient = createAuthClient({
  plugins: [usernameClient()],
})
```

---

## 16. TDD — Notre approche pour v1

### Ce qu'on teste

| Priorité | Type de test | Quand |
|----------|-------------|-------|
| 🔴 **Obligatoire** | Tests manuels en conditions réelles | Après chaque PR mergée |
| 🟡 **Recommandé** | Tests E2E (Playwright) — flux critiques | Avant release v1 |
| ⚪ **Pas en v1** | Tests unitaires | v2 |

### Tests E2E (quand on y arrive)

```ts
// ✅ Tester les flux métier, pas les détails d'implémentation
test('tech can start and complete an intervention', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="username"]', 'kevin')
  await page.fill('[name="password"]', 'pass123')
  await page.click('button[type="submit"]')

  await expect(page.locator('text=Urgence plomberie')).toBeVisible()
  await page.click('text=Démarrer')
  await expect(page.locator('text=Terminer')).toBeVisible()
})
```

---

## 17. Résumé — Règles d'or pour Timeo

1. **🇬🇧 Code en anglais, 🇫🇷 UI en français**
2. **Un fichier > 250 lignes = split**
3. **Une fonction = une responsabilité**
4. **Zod est la source unique de vérité** — pas de types dupliqués
5. **Pas de `any`** — toujours typer
6. **Code > commentaires** — le code s'explique tout seul
7. **Early return** — pas de nesting profond
8. **Pas de classes, pas d'interfaces inutiles, pas de patterns overkill**
9. **Les erreurs utilisateur sont en français, structurées, avec code HTTP**
10. **Chaque PR valide le lint et le build avant merge**

### KISS & YAGNI — Rappels

**KISS :**
- Un seul format d'erreur API (`{ error: { code, message, field? } }`)
- Un seul plan de PR (PR-PLAN.md)
- SSE pour Realtime, pas Supabase Realtime
- Timeline simple, pas de Gantt interactif

**YAGNI :**
- Pas de reset password par email (chef reset manuellement)
- Pas de tests unitaires en v1 (usage réel = test)
- Pas de PWA/offline, pas de notifications push
- Pas de patterns complexes (Repository, Factory, Strategy)
- Pas d'interfaces avec 1 implémentation

---

## Références

- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript) — principes généraux
- [Violet Issue](https://designmd.ai/chef/violet-issue) — design system
- [SPEC-V1.md](./SPEC-V1.md) — spécification fonctionnelle
- [DESIGN.md](./DESIGN.md) — design system complet
