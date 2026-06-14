# 🤖 Guide des Agents & Skills pour Timeo

> Ce fichier définit **quel agent utilise quel skill** et **dans quel ordre**.
> Tout agent qui travaille sur Timeo DOIT charger ce fichier en premier.

---

## 📋 Les Fichiers Obligatoires (à charger avant chaque action)

Chaque action sur Timeo DOIT charger ces fichiers (dans cet ordre) :

| Ordre | Fichier | Contenu |
|---|---|---|
| 1 | `ARCHITECTURE.md` | Structure du monorepo, stack, Ports & Adapters |
| 2 | `DATAMODEL.md` | Schémas de base de données, relations |
| 3 | `WORKFLOW.md` | Logique métier, state machines, sécurité |
| 4 | `docs/errors/` (TOUS les fichiers) | 🧠 Mémoire collective des erreurs passées — éviter de les répéter |

**Règle absolue** : Le dossier `docs/errors/` (tous les fichiers) est lu par TOUS les agents avant chaque action. Si tu fais une erreur, tu l'ajoutes dans le fichier correspondant. Si tu vois une erreur déjà listée, tu ne la répètes pas.

---

## 🎯 Mapping Agent → Skills

### 1. Repository Manager (Toi — l'orchestrateur)

**Rôle** : Coordonne tout le projet, décide quoi faire, délègue aux spécialistes.

**Skills à charger avant chaque action :**
| Ordre | Skill | Quand |
|---|---|---|
| 1 | `ARCHITECTURE.md`, `DATAMODEL.md`, `WORKFLOW.md` | **Toujours** — charger les 3 fichiers du projet |
| 2 | `brainstorming` | Avant toute feature créative (nouveau composant, nouvelle feature) |
| 3 | `planning-and-task-breakdown` | Avant de découper une grosse tâche |
| 4 | `writing-plans` | Avant d'écrire un plan d'implémentation |
| 5 | `dispatching-parallel-agents` | Quand 2+ tâches indépendantes peuvent être parallélisées |
| 6 | `subagent-driven-development` | Quand tu exécutes un plan avec des sous-tâches |
| 7 | `requesting-code-review` | Avant de merger du code |
| 8 | `verification-before-completion` | Avant de déclarer une tâche terminée |

---

### 2. ContextScout

**Rôle** : Découvre et charge les contextes pertinents avant chaque action.

**Comportement** :
- Explore `/home/hlmekki/.config/opencode/context/` pour trouver les fichiers pertinents
- Pour Timeo, doit toujours prioriser les 3 fichiers du projet
- Skills : Chargement dynamique (pas de skills fixes)

---

### 3. TaskManager

**Rôle** : Décompose les features complexes en sous-tâches atomiques et ordonnancées.

**Skills à charger :**
| Skill | Pourquoi |
|---|---|
| `planning-and-task-breakdown` | Découpage en sous-tâches |
| `subagent-driven-development` | Génération de sous-tâches exécutables |
| `writing-plans` | Rédaction du plan détaillé |

**Règle d'atomicité** : Chaque sous-tâche doit :
- Faire **une seule chose** (ex: "Créer l'interface IJobRepository", pas "Faire la couche DB")
- Être **testable indépendamment**
- Représenter **max 30 min** de travail

---

### 4. CoderAgent

**Rôle** : Implémente le code des sous-tâches.

**Skills à charger AVANT d'écrire du code :**
| Ordre | Skill | Pourquoi |
|---|---|---|
| 1 | `bun-runtime` | Connaître les spécificités Bun |
| 2 | `zod` | Schemas de validation |
| 3 | La skill métier appropriée selon la tâche (voir tableau ci-dessous) |

**Skills métier par type de tâche :**

| Si la tâche est... | Charger aussi |
|---|---|
| Backend / API | `hono` |
| Base de données / Schémas | `drizzle-orm-patterns` |
| Validation / Schemas | `zod` |
| Frontend / Build | `vite` |
| Monorepo / Pipeline | `turborepo` |
| Supabase / Hosting | `supabase` |
| Authentification | `better-auth-best-practices` + `supabase` |

**Règles** :
- Ne JAMAIS coder une feature sans avoir défini son **interface (port)** dans `shared/` d'abord
- Toujours suivre le pattern **Ports & Adapters** décrit dans `ARCHITECTURE.md`
- Le code métier ne doit JAMAIS dépendre directement de Drizzle, Hono, ou autre infra
- Utiliser le **Repository Pattern** pour la DB
- Utiliser le **Adapter Pattern** pour l'auth et le storage

---

### 5. TestEngineer

**Rôle** : Écrit les tests (TDD first).

**Skills à charger :**
| Ordre | Skill | Pourquoi |
|---|---|---|
| 1 | `test-driven-development` | Approche TDD |
| 2 | `zod` | Validation des schemas dans les tests |
| 3 | `drizzle-orm-patterns` | Tests de repositories (si besoin) |

**Règles** :
- Toujours suivre le TDD : test d'abord, implémentation ensuite
- Tester les **ports (interfaces)** pas les implémentations concrètes
- Tests unitaires pour la logique métier (services)
- Tests d'intégration pour les adapters

---

### 6. CodeReviewer

**Rôle** : Review de code, sécurité, qualité.

**Skills à charger :**
| Ordre | Skill | Pourquoi |
|---|---|---|
| 1 | `receiving-code-review` | Réception des feedbacks |
| 2 | `requesting-code-review` | Demander une review |
| 3 | `systematic-debugging` | Si des bugs sont détectés |

**Points de vérification obligatoires :**
- [ ] Le code suit-il le pattern Ports & Adapters ?
- [ ] Les interfaces sont-elles dans `shared/` ?
- [ ] Les services n'importent-ils pas d'infrastructure directement ?
- [ ] Les adapters sont-ils interchangeables (même interface) ?
- [ ] Les tests couvrent-ils les cas positifs ET négatifs ?
- [ ] Y a-t-il des dépendances circulaires ?
- [ ] La validation Zod est-elle dans `shared/` ?

---

### 7. BuildAgent

**Rôle** : Vérifie que le projet compile, les types sont corrects, les builds passent.

**Skills à charger :**
| Skill | Pourquoi |
|---|---|
| `bun-runtime` | Connaître les spécificités Bun |
| `vite` | Build frontend |
| `turborepo` | Pipeline monorepo |

**Commandes de validation :**
```bash
bun run type-check    # Vérification des types
bun run lint          # Linting
bun run build         # Build complet
bun run test          # Tests
```

---

### 8. WorkflowDesigner

**Rôle** : Design des workflows métier et state machines.

**Skills à charger :**
| Ordre | Skill | Pourquoi |
|---|---|---|
| 1 | `brainstorming` | Exploration du besoin avant design |
| 2 | `writing-plans` | Planification du workflow |

**Règles** :
- Chaque transition de state doit avoir : précondition, action, postcondition, erreurs possibles
- Documenter dans `WORKFLOW.md`
- Implémenter dans `server/src/services/` (pas dans les routes)

---

### 9. ExternalScout

**Rôle** : Va chercher de la documentation externe à jour.

**Skills à charger :**
| Skill | Pourquoi |
|---|---|
| `context7` | Documentation à jour des librairies |

**Quand l'utiliser** :
- Nouvelle librairie à intégrer
- Version majeure d'une dépendance existante
- API spécifique dont on n'est pas sûr

---

## 🔄 Workflow Recommandé pour Chaque Feature

```
1. [Repository Manager] Charger ARCHITECTURE.md, DATAMODEL.md, WORKFLOW.md
2. [Repository Manager] brainstorming → explorer le besoin
3. [Repository Manager] writing-plans → écrire le plan
4. [Repository Manager] planning-and-task-breakdown → découper en sous-tâches
5. [TaskManager] Générer les sous-tâches atomiques
6. POUR CHAQUE sous-tâche:
   a. [TestEngineer] TDD: écrire le test d'abord
   b. [CoderAgent] Implémenter (avec skills appropriés)
   c. [CoderAgent] Vérifier que les tests passent
7. [CodeReviewer] Review le code complet
8. [BuildAgent] Build et validation
9. [Repository Manager] verification-before-completion
10. [Repository Manager] Merge / PR
```

---

## 🧪 Règles d'Atomicité

**Chaque implémentation DOIT être atomique :**

```
❌ MAUVAIS : "Créer le module d'authentification"
   → 10 fichiers, 3 jours, tout est mélangé

✅ BON :
   Étape 1: "Définir IAuthProvider dans shared/interfaces/"         [1 fichier]
   Étape 2: "Tester l'interface IAuthProvider"                       [1 fichier]
   Étape 3: "Implémenter BetterAuthAdapter"                          [1 fichier]
   Étape 4: "Tester BetterAuthAdapter"                               [1 fichier]
   Étape 5: "Créer AuthService"                                      [1 fichier]
   Étape 6: "Créer la route POST /auth/sign-in"                      [1 fichier]
   Étape 7: "Test d'intégration de l'auth"                           [1 fichier]
```

**Critères d'atomicité** :
- 1 à 3 fichiers max par commit
- Testable indépendamment
- Reviewable en < 5 minutes
- Pas de dépendance vers du code pas encore écrit
