# 🔷 TypeScript — Erreurs & Leçons

### 2026-06-14 — `Blob` / `Buffer` non disponible dans shared/ (pas de DOM lib)

**Agent** : CoderAgent (Phase 2)
**Tâche** : Création de `IStorageProvider` dans shared/interfaces/

**Problème** : Le build TypeScript échouait car `Blob` et `Buffer` n'existent pas dans le contexte `lib: ["ESNext"]` de `shared/`.

**Cause** : `shared/tsconfig.json` surcharge `lib` avec `ESNext` uniquement (pas de DOM), contrairement au root tsconfig qui inclut `["ESNext", "DOM", "DOM.Iterable"]`.

**Solution** : Remplacer `Buffer | Blob` par `Uint8Array` — disponible dans ESNext.

**Leçon** :
- `shared/` est un package pur domaine — il n'a pas accès aux API navigateur (Blob, File, etc.)
- Les adapters dans `server/` feront la conversion (Blob → Uint8Array) avant d'appeler les interfaces shared
- Toujours vérifier les libs disponibles dans le tsconfig de chaque package avant d'utiliser des API spécifiques

### 2026-06-14 — Duplicate identifier 'JobStatus' dans barrel export

**Agent** : CoderAgent (Phase 2)
**Tâche** : Création du barrel export des constants

**Problème** : `shared/src/constants/index.ts` exportait `JobStatus` deux fois : une fois via `export { JobStatus }` (valeur + type) et une fois via `export type { JobStatus }` (type only).

**Cause** : Avec `verbatimModuleSyntax: true`, les deux exports entrent en conflit car `JobStatus` est défini à la fois comme `const` et `type` dans le même fichier source.

**Solution** : Supprimer l'export type redondant. `export { JobStatus }` exporte déjà implicitement le type associé.

**Leçon** :
- Quand un fichier définit `export const X = ...` + `export type X = ...`, le barrel export n'a besoin que de `export { X }` — le type est automatiquement inclus
- L'ajout de `export type { X }` en plus crée un doublon

### 2026-06-14 — Zod v4 `z.record()` nécessite 2 paramètres (key + value)

**Agent** : CoderAgent (Phase 2)
**Tâche** : Création des schemas Zod pour les champs JSONB

**Problème** : Le build échouait sur `z.record(z.any())` avec l'erreur `Expected 2-3 arguments, but got 1`.

**Cause** : Le projet a installé **Zod v4** (via `bun add zod`), qui a changé l'API de `z.record()`. En v3, `z.record(valueType)` était suffisant (keyType par défaut à string). En v4, il faut `z.record(keyType, valueType)`.

**Solution** : Remplacer `z.record(z.any())` par `z.record(z.string(), z.any())`.

**Leçon** :
- Toujours vérifier la version de Zod utilisée avant d'écrire des schemas
- En Zod v4 : `z.record(z.string(), z.any())` au lieu de `z.record(z.any())`
- En Zod v4 : `z.unknown()` n'existe plus — utiliser `z.any()` à la place
- Le skill `zod` Skill doit être chargé AVANT d'écrire du code Zod

### 2026-06-14 — Champ `job.status` en VARCHAR au lieu d'un enum type-safe

**Agent** : Repository Manager (planification)
**Tâche** : Définition initiale du DATA MODEL

**Problème** : Le statut du job était défini comme `VARCHAR` sans contrainte de type en TypeScript.

**Cause** : On a pensé "DB first" plutôt que "types first".

**Solution** : Créer un enum TypeScript `JobStatus` dans `shared/src/constants/job-status.ts` avec les valeurs autorisées et les transitions valides.

**Leçon** :
- Toujours définir les **types dans `shared/` d'abord**, avant le schema DB
- Les enums métier doivent être des **unions TypeScript** (pas des `string` génériques)
- Une erreur de type se détecte à la compilation, une erreur VARCHAR se détecte en production
