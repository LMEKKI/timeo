# Bibliothèque de prompts IA — Timeo v1.0.0

> **Objectif :** standardiser la délégation de tâches à l'agent IA (co-pilote senior). 1 prompt = 1 tâche, 5-10min de remplissage au lieu de 30min de rédaction.
> **Pattern :** le junior ouvre ce fichier, copie le bon template, remplit les `[PLACEHOLDERS]`, colle dans le chat IA, l'IA génère le code.
> **Date :** 2026-06-27 — Aligné avec `CONVENTIONS.md` v1, `PR-PLAN.md` v1, `SPEC-V1.md`.

## Workflow en 4 étapes

1. **Lire le template** correspondant à la tâche (5s)
2. **Remplir les `[PLACEHOLDERS]`** (5min)
3. **Coller dans le chat IA** avec un load de skill si applicable (5s)
4. **Reviewer le code généré** contre la checklist `CONVENTIONS.md` (5-10min)

## Conventions rappel (avant de générer un prompt)

- **1 prompt = 1 tâche** (pas de mega-prompt pour 5 fichiers)
- **Code en anglais**, UI en français
- **Zod = source de vérité** — pas de type manuel
- **Format d'erreur** : `{ error: { code, message, field? } }`
- **Enums BDD/code en anglais** (`status: 'planned'`), labels FR en UI (`"Planifié"`)
- **Validation finale** : `bun run lint && bun run type-check && bun run build`

---

## 1. `feat-zod-schema.md` — Nouveau schéma Zod

**Quand :** tu ajoutes un nouveau schéma de validation dans `shared/src/schemas/`.

````markdown
# Tâche : Créer un schéma Zod pour [ENTITÉ]

## Contexte
- Projet : Timeo (gestion interventions terrain)
- Stack : Hono 4 + Drizzle 1.0-beta + Zod 4 + Better Auth 1.6
- Fichier à créer : `shared/src/schemas/[name].ts`
- Schémas similaires : `shared/src/schemas/auth.ts`, `shared/src/schemas/user.ts`
- Spec source : `docs/SPEC-V1.md` §[X]
- Convention : `docs/CONVENTIONS.md` §9 (Zod — source unique de vérité)

## Spec
- **Schéma** : `[NOM]_SCHEMA`
- **Champs** :
  - `[champ1]` : `[type Zod, ex: z.string().min(1).max(200)]`
  - `[champ2]` : `[type Zod, ex: z.string().uuid()]`
  - `[champN]` : `[optional/required, defaultValue]`
- **Type inféré** : `z.infer<typeof [NOM]_SCHEMA>` (exporté en `export type`)
- **Schémas liés** : `[ex: extend createInterventionSchema pour createClientSchema]`

## Conventions
- Schéma < 50 lignes (split si plus)
- Zod 4 (`z.email()`, `z.uuid()`, `z.enum()` natifs, pas de regex manuels)
- Messages d'erreur en français (UI = français)
- Exporte le type avec `z.infer` — jamais de type manuel dupliqué
- Ajouter l'export dans `shared/src/index.ts`

## Validation
- [ ] `bun run build:shared` passe
- [ ] Le type inféré matche les colonnes Drizzle de `[table]`
- [ ] Test manuel : parser un input valide + un input invalide (vérifier message FR)
````

---

## 2. `feat-drizzle-table.md` — Nouvelle table Drizzle

**Quand :** tu ajoutes une nouvelle table BDD dans `server/src/db/schema/`.

````markdown
# Tâche : Créer la table `[NAME]`

## Contexte
- Projet : Timeo
- Stack : Drizzle 1.0-beta.15 + PostgreSQL (Supabase)
- Fichier à créer : `server/src/db/schema/[name].ts`
- Pattern à suivre : `server/src/db/schema/users.ts` (déjà créé)
- Spec source : `docs/SPEC-V1.md` §4 (Modèle de données)
- Convention : `docs/CONVENTIONS.md` §1, §15

## Spec
- **Nom table** : `[snake_case, ex: interventions]`
- **ID** : `uuid().defaultRandom().primaryKey()` (sauf table Better Auth = `text`)
- **Colonnes** :
  - `[col1]` : `[type, ex: text("col1").notNull()]`
  - `[col2]` : `[type, ex: pgEnum("status", ["a","b","c"])("status").notNull().default("a")]`
  - `[FK1]` : `uuid("fk_id").references(() => otherTable.id, { onDelete: "cascade" })`
  - `[audit]` : spread `...auditFields` (de `server/src/db/helpers.ts`)
- **Index** : `index("idx_name").on(table.col1, table.col2)` (composite si besoin)
- **Relations** : `relations(table, ({ one, many }) => ({ ... }))` si lié à d'autres tables

## Conventions
- IDs : `text` pour tables Better Auth, `uuid()` pour tables custom
- Enums : `pgEnum()` (vraie contrainte BDD, pas `text({ enum: [...] })`)
- FK : arrow functions `() => otherTable.id` (évite TDZ)
- Soft delete : `deletedAt` nullable dans `...auditFields`
- Audit : `...auditFields` (createdAt, updatedAt, deletedAt) sur TOUTES les tables custom
- Ne PAS modifier les tables Better Auth (user, session, account, verification)
- Ajouter l'export dans `server/src/db/schema/index.ts` (junction APRÈS parents)

## Validation
- [ ] `bun run build:server` passe
- [ ] `bun run db:generate` produit une migration propre
- [ ] Ordre de déclaration respecté (junction après parents dans `schema/index.ts`)
````

---

## 3. `feat-hono-route.md` — Nouvel endpoint API

**Quand :** tu ajoutes une nouvelle route Hono dans `server/src/routes/`.

````markdown
# Tâche : [METHOD] [path]

## Contexte
- Fichier à créer : `server/src/routes/[name].ts`
- Fichier à modifier : `server/src/index.ts` (ajouter `.route("/[path]", [name]Route)`)
- Pattern à suivre : `server/src/routes/users.ts` (POST chef-crée-tech)
- Spec source : `docs/SPEC-V1.md` §5 (API)
- Convention : `docs/CONVENTIONS.md` §6 (API — Réponses HTTP), §8 (Hono)

## Spec
- **Endpoint** : `[METHOD]` `/[path]` (ex: `POST /clients`)
- **Permission** : `[chef | tech | public | mixed]`
- **Middleware** : `[requireAuth | requireChef | aucun]`
- **Body (Zod validation)** : `[import depuis shared/src/schemas/client.ts : createClientSchema]`
- **Comportement** :
  1. Valider body avec Zod (`c.req.valid("json")`)
  2. Logique métier (étapes numérotées)
  3. Retourner `{ data: X }` avec status Y
- **Erreurs possibles** :
  - 400 `VALIDATION_ERROR` (champ invalide, `field: "X"`)
  - 401 `UNAUTHORIZED` (pas de session)
  - 403 `FORBIDDEN` (mauvais rôle)
  - 404 `NOT_FOUND` (ressource inexistante)
  - 409 `CONFLICT` (doublon, transition invalide)
  - 500 `INTERNAL_ERROR` (catch all)

## Conventions
- Fichier < 250 lignes
- Fonctions < 30 lignes (handler = orchestration seule)
- Format erreur : `{ error: { code, message, field? } }` (cf. `server/src/lib/errors.ts`)
- Pas de `any`, pas de classes, named exports only
- Early return, pas de nesting profond
- Soft delete : toujours filtrer `isNull(deletedAt)` dans les queries
- Messages utilisateur en français, codes en anglais

## Validation
- [ ] `bun run build:server` passe
- [ ] `bun run lint` passe
- [ ] `bun run type-check` passe
- [ ] Test 1 : input valide → 201 + data
- [ ] Test 2 : input invalide → 400 + `field: "X"`
- [ ] Test 3 : mauvais rôle → 403
````

---

## 4. `feat-tanstack-hook.md` — Nouveau hook TanStack Query

**Quand :** tu ajoutes un nouveau hook `useQuery` ou `useMutation` dans `client/src/hooks/`.

````markdown
# Tâche : Hook pour [ENTITÉ]

## Contexte
- Fichier à créer : `client/src/hooks/use-[name].ts`
- Pattern à suivre : `client/src/hooks/use-interventions.ts` (existe)
- Spec source : `docs/SPEC-V1.md` §[X]
- Convention : `docs/CONVENTIONS.md` §7 (React), polling only (KISS — pas de SSE)
- Query keys : ajouter dans `client/src/lib/query-keys.ts` (factory)

## Spec
- **Type de hook** : `[useQuery | useMutation]`
- **Endpoint API** : `[METHOD] /[path]` (déjà implémenté côté server)
- **Query key** : `[ex: queryKeys.interventions.list({ date, status })]`
- **Query function** : `[ex: api.interventions.$get({ query: { date, status } }).then(r => r.json())]`
- **Options** :
  - `refetchInterval` : `[ex: 10_000 pour dashboard chef, 2_000 pour tech missions]`
  - `staleTime` : `[ex: 30_000 pour changeant, 300_000 pour stable]`
  - `refetchOnWindowFocus` : `true` (par défaut)
  - `refetchIntervalInBackground` : `false` (pause si onglet caché)
- **Mutations** (si `useMutation`) :
  - `onMutate` : optimistic update (snapshot + `setQueryData`)
  - `onError` : rollback avec `context` retourné par `onMutate`
  - `onSettled` : `invalidateQueries` pour re-sync

## Conventions
- Hook < 50 lignes
- Query keys hiérarchiques (factory dans `query-keys.ts`)
- Polling pour quasi-realtime (PAS de SSE/WebSocket)
- Optimistic updates avec rollback propre
- Pas de `useMemo`/`useCallback` par défaut (perf mesurée d'abord)
- Type retour = `z.infer` du schéma Zod côté server

## Validation
- [ ] `bun run build:client` passe
- [ ] Le hook est typé (z.infer du schéma Zod)
- [ ] Le hook invalide les bonnes queries après mutation
- [ ] Test : changer une donnée côté server → refresh auto via polling
````

---

## 5. `feat-react-component.md` — Nouveau composant React

**Quand :** tu ajoutes un nouveau composant dans `client/src/components/`.

````markdown
# Tâche : Composant [NOMCOMPOSANT]

## Contexte
- Fichier à créer : `client/src/components/[dossier]/[name].tsx`
- Pattern à suivre : `client/src/components/shared/status-badge.tsx`
- Spec source : `docs/SPEC-V1.md` §[X]
- Convention : `docs/CONVENTIONS.md` §7 (React)
- Design : `docs/DESIGN.md` (couleurs Violet Issue, dark chef / light tech)

## Spec
- **Nom** : `[NOMCOMPOSANT]` (PascalCase, ex: `InterventionCard`)
- **Props** : `[ex: { intervention: Intervention, onStatusChange?: (s: Status) => void }]`
- **Variantes** : `[ex: variant: 'default' | 'compact']` (si applicable)
- **États** : `[ex: loading, error, success, empty]` (skeleton si loading)
- **Accessibilité** : `[role, aria-label si icon-button, keyboard nav]`
- **Thème** : `[dark (chef) | light (tech) | both]`

## Conventions
- Composant = fonction, pas de classes
- Pas de `React.FC<Props>` (typage explicite via `interface Props`)
- Pas de `useMemo` / `useCallback` par défaut
- Named export (`export function NOM`)
- Fichier < 200 lignes (split si plus)
- Props typées strictement, jamais `any`
- shadcn/ui en base (`Button`, `Card`, `Badge`, etc.) — pas de wrapper inutile
- Fichier en kebab-case (`intervention-card.tsx`)

## Validation
- [ ] `bun run build:client` passe
- [ ] `bun run lint` passe
- [ ] Rendu visuel vérifié en mode dark (chef) ET light (tech)
- [ ] Accessible : tab navigation, aria-labels, contrastes WCAG
````

---

## 6. `feat-shadcn-add.md` — Ajouter un composant shadcn

**Quand :** tu as besoin d'un nouveau composant shadcn (ex: `Dialog`, `Dropdown`, `Sheet`).

````markdown
# Tâche : Ajouter le composant shadcn `[COMPOSANT]`

## Contexte
- Stack : shadcn/ui + Vite 6 + Tailwind 4 + React 19
- Commande : `npx shadcn@latest add [composant]`
- Pattern : `client/components.json` est déjà configuré (style: new-york, rsc: false)
- Design : `docs/DESIGN.md` (thème Violet Issue)

## Spec
- **Composant** : `[ex: dialog, dropdown-menu, sheet, toast, command]`
- **Usage prévu** : `[ex: confirmation d'annulation d'intervention]`
- **Personnalisation** : `[ex: variant destructive pour le bouton Annuler]`

## Conventions
- Toujours utiliser la commande CLI (pas de copier-coller manuel depuis docs)
- Le composant atterrit dans `client/src/components/ui/`
- Aligner avec le thème Violet Issue (`docs/DESIGN.md`) — tokens en CSS variables
- Variants custom via `cva` si besoin
- Ne JAMAIS modifier un fichier `client/src/components/ui/*` à la main sans comprendre l'impact sur les autres usages

## Validation
- [ ] `bun run build:client` passe
- [ ] Le composant est dans `client/src/components/ui/[composant].tsx`
- [ ] Il respecte les tokens Violet Issue (background, primary, etc.)
- [ ] Test : import + rendu sans warning console
````

---

## 7. `fix-bug.md` — Corriger un bug

**Quand :** tu as un bug à corriger (UI cassée, erreur 500, comportement incorrect).

````markdown
# Tâche : Fix le bug `[DESCRIPTION COURTE]`

## Contexte
- **Symptôme** : `[ex: "Le bouton 'Terminer' ne fait rien sur la page mission"]`
- **Reproduction** : `[étapes pour reproduire, ex: 1. login tech, 2. ouvrir mission, 3. cliquer Terminer]`
- **Comportement attendu** : `[ex: "L'intervention passe au status 'completed' et la liste se met à jour"]`
- **Code concerné** : `[fichier(s) : ligne(s)]`
- **Logs / erreur** : `[coller l'erreur complète console ou terminal]`

## Spec
- **Cause probable** : `[ex: "le hook useFinishIntervention n'invalide pas la query 'missions' après mutation"]`
- **Fix proposé** : `[description du fix]`
- **Fichiers à modifier** : `[ex: client/src/hooks/use-finish-intervention.ts]`
- **Impact** : `[ex: "ajouter onSettled avec invalidateQueries({ queryKey: queryKeys.interventions.today() })"]`

## Conventions
- DRY : ne pas dupliquer le code, factoriser si le fix se répète
- KISS : le fix le plus simple qui résout le bug (pas de refactor en passant)
- Self-documenting : pas de commentaire "fix bug", nom de fonction/variable explicite
- Tests manuels : vérifier que le scénario qui déclenchait le bug est résolu + que les scénarios proches ne sont pas cassés

## Validation
- [ ] `bun run lint && bun run type-check && bun run build` passe
- [ ] Le bug est résolu (reproduction manuelle)
- [ ] Aucun nouveau bug introduit (test des scénarios proches)
- [ ] Si fix non trivial → créer une issue GitHub qui référence ce fix
````

---

## 8. `refactor.md` — Refactoring

**Quand :** tu veux améliorer le code SANS changer le comportement (DRY, naming, extraction de fonction).

````markdown
# Tâche : Refactor `[DESCRIPTION]`

## Contexte
- **Code actuel** : `[fichier(s) : ligne(s)]`
- **Problème** : `[ex: "La fonction createIntervention fait 60 lignes, mélange validation + logique + réponse"]`
- **Spec inchangée** : `[confirmer que le comportement externe reste identique]`
- **Convention** : `docs/CONVENTIONS.md` §2 (fichier > 250 lignes = split), §4 (1 fonction = 1 responsabilité)

## Spec
- **Refactor proposé** : `[ex: "Extraire validateInput() et persistIntervention(), garder createIntervention comme orchestration"]`
- **Fichiers à modifier** : `[liste]`
- **Nouveau fichier (si création)** : `[chemin + raison]`

## Conventions
- Le refactor NE CHANGE PAS le comportement (zéro régression fonctionnelle)
- `bun run lint && bun run type-check && bun run build` reste vert
- Tests manuels : le scénario qui marchait avant marche toujours après
- Limites : fichier < 250 lignes, fonction < 30 lignes
- Si la fonction extraite est utilisée ailleurs, c'est un helper → mettre dans `lib/`
- Ne pas refactor + feat en même temps (1 PR = 1 intention)

## Validation
- [ ] Aucune régression (test du scénario principal + scénarios proches)
- [ ] Le code est plus lisible / plus DRY
- [ ] `bun run lint && bun run type-check && bun run build` passe
- [ ] Diff minimal : lignes modifiées = celles du refactor uniquement
````

---

## Commentaires finaux

- **Un prompt par tâche** : si tu as 5 tâches, fais 5 prompts séparés (pas 1 mega-prompt).
- **Skills à charger** : si ton prompt implique une lib (Better Auth, Drizzle, Hono, TanStack, shadcn, etc.), commence le prompt par : « Avant toute chose, charge la skill `[nom-de-la-skill]` (via le tool `skill`). » Exemples : `better-auth`, `drizzle-orm-patterns`, `hono`, `tanstack-query-best-practices`, `shadcn`.
- **Toujours valider** : après génération, le code est à ~95% bon. Le 5% restant = relire la checklist `CONVENTIONS.md`, tester manuellement, vérifier que le typage est strict (pas de `any`).
- **Pas de re-tentative à l'aveugle** : si l'IA produit du code faux, NE REDEMANDE PAS juste « refais ». Précise ce qui est faux, copie le code fautif, et indique la correction. L'IA apprend avec un retour précis.
- **Context budget** : si le prompt dépasse 150 lignes, c'est qu'il y a trop de tâches dedans — split.

## Référence rapide — Skills par tâche

| Template | Skill à charger (si applicable) |
|---|---|
| 1. feat-zod-schema | `zod` ou `zod-validation-utilities` |
| 2. feat-drizzle-table | `drizzle-orm-patterns` |
| 3. feat-hono-route | `hono` |
| 4. feat-tanstack-hook | `tanstack-query-best-practices` |
| 5. feat-react-component | `shadcn`, `tanstack-router` |
| 6. feat-shadcn-add | `shadcn` |
| 7. fix-bug | `systematic-debugging`, `diagnose` |
| 8. refactor | (aucune skill spécifique) |

## Voir aussi

- `docs/CONVENTIONS.md` — conventions de code (référence absolue)
- `docs/PR-PLAN.md` — découpage des 6 PRs (source des tâches)
- `docs/SPEC-V1.md` — spécification fonctionnelle (source de vérité métier)
