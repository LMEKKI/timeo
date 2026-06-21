# CONTRIBUTING.md — Guide du développeur solo

> Tu es junior, tu codes seul, tu n'as pas de lead dev pour review.
> Ce guide remplace le lead dev. Suis-le à chaque commit, à chaque PR.

## 1. Avant de coder

```bash
git checkout dev
git pull origin dev
git checkout -b feat/phase-X-nom
```

- 1 branche = 1 phase du plan (`docs/PR-PLAN.md`)
- Le nom de branche suit `docs/BRANCHING.md` : `feat/`, `fix/`, `hotfix/`, `chore/`, `docs/`

## 2. Pendant le code — Commits

### Format (Conventional Commits)

```
<type>: <description en français>
```

| Type | Usage | Exemple |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | `feat: ajout du formulaire client` |
| `fix` | Correction de bug | `fix: transition status invalide` |
| `refactor` | Refacto sans changement de comportement | `refactor: extraction de canTransition()` |
| `chore` | Tooling, config, deps | `chore: setup Biome linter` |
| `docs` | Documentation uniquement | `docs: mise à jour SPEC-V1` |
| `test` | Tests | `test: ajout test E2E login` |

### Règles

- **Description en français**, minuscule, pas de point final
- **1 commit = 1 tâche** du plan (ou 1 changement logique)
- **Pas de "wip" ou "stuff"** — chaque commit doit compiler
- **Pas de commit avec seulement du formatage** (Biome le fait en pre-commit)

### Exemples

```
feat: ajout du formulaire client
feat: ajout des routes CRUD interventions
fix: erreur 409 sur transition démarré→terminé
refactor: extraction de TRANSITION_MAP dans shared/
chore: setup Husky pre-commit
docs: correction format d'erreur canonique
```

### Quand committer

```bash
# Après chaque tâche terminée qui compile
bun run lint && bun run type-check && bun run build
git add -A
git commit -m "feat: description claire"
```

## 3. Avant la PR — Validation

```bash
# 1. S'assurer d'être à jour avec dev
git checkout dev
git pull origin dev
git checkout feat/phase-X-nom
git rebase dev  # ou merge dev

# 2. Valider
bun run lint && bun run type-check && bun run build

# 3. Pousser
git push origin feat/phase-X-nom
```

## 4. Créer la PR

```bash
gh pr create --base dev --title "PR #X: description" --body "$(cat .github/PULL_REQUEST_TEMPLATE.md)"
```

Ou via l'interface GitHub. Utilise le template automatiquement.

## 5. Self-review ( obligatoire )

Tu n'as pas de lead dev. Tu DOIS te reviewer toi-même avant de merger.

### Checklist self-review

**Avant de regarder le diff :**
- [ ] Le code fait ce que dit la spec (`docs/SPEC-V1.md`) ?
- [ ] Je n'ai pas ajouté de feature non prévue (YAGNI) ?

**En regardant le diff (`git diff dev...HEAD`) :**
- [ ] Pas de `any` — tout est typé
- [ ] Pas de commentaire inutile (le code s'explique)
- [ ] Pas de console.log oublié
- [ ] Pas de code commenté
- [ ] Pas de TODO dans le code (créer une issue)
- [ ] Pas de fichier > 250 lignes
- [ ] Pas de fonction > 30 lignes
- [ ] Nommage clair (pas d'abréviations)
- [ ] Early return (pas de nesting profond)
- [ ] Pas de classe, pas d'interface avec 1 impl
- [ ] Erreurs au format canonique `{ error: { code, message, field? } }`
- [ ] Colonnes BDD en anglais
- [ ] UI en français

**Validation finale :**
- [ ] `bun run lint` passe
- [ ] `bun run type-check` passe
- [ ] `bun run build` passe

### Commande pour le self-review

```bash
# Voir tous tes changements
git diff dev...HEAD --stat

# Voir le diff complet
git diff dev...HEAD

# Voir les fichiers modifiés
git diff dev...HEAD --name-only
```

## 6. Merge

```bash
# Après self-review, squash merge
gh pr merge --squash

# La branche distante est supprimée automatiquement
# Nettoyer en local
git checkout dev
git pull origin dev
git branch -d feat/phase-X-nom
```

## 7. Release ( après PR #7 )

```bash
git checkout main
git pull origin main
git merge dev
git tag -a v1.0.0 -m "v1.0.0"
git push origin main --tags
```

## 8. En cas de bug en production ( hotfix )

```bash
git checkout main
git pull origin main
git checkout -b hotfix/description-du-bug
# ... corriger ...
git push origin hotfix/description-du-bug
gh pr create --base main --title "hotfix: description"
gh pr merge --squash

# Reporter le fix sur dev
git checkout dev
git merge hotfix/description-du-bug
git push origin dev
```

## 9. CI/CD — Comment ça marche

### Sur chaque PR (vers `dev` ou `main`)

1. **CodeRabbit** review automatiquement ton code (gratuit, config dans `.coderabbit.yaml`)
   - Vérifie la checklist Timeo (pas de `any`, fichiers < 250 lignes, etc.)
   - Poste un commentaire avec les issues trouvées
   - Tu peux répondre au bot pour affiner la review

2. **CI GitHub Actions** (`.github/workflows/ci.yml`) tourne :
   - `bun run lint` (Biome)
   - `bun run type-check` (tsc --noEmit)
   - `bun run build` (Turborepo build tous les packages)
   - Cache Turbo pour accélérer les builds

3. **Branch protection** :
   - `main` et `dev` exigent que le job `CI / quality` passe
   - 0 approval requis (solo dev)
   - Pas de force push, pas de deletion

### Deploy

**Pas de workflow deploy en v1.** Vercel déploie automatiquement :
- `main` push → production (`timeo.vercel.app`)
- `dev` push → preview (`timeo-dev.vercel.app`)
- `feat/*` push → preview (`timeo-feat-xxx.vercel.app`)

Tu connectes le repo à Vercel une fois (https://vercel.com/new), et c'est tout.
Le fichier `vercel.json` sera ajouté dans la PR #7 (Realtime + Polish).

### Si le CI échoue

1. Lis le message d'erreur dans l'onglet "Actions" sur GitHub
2. Corrige localement : `bun run lint && bun run type-check && bun run build`
3. Commit et pousse la correction
4. Le CI relance automatiquement

## 10. Règles d'or ( afficher sur ton écran )

1. **KISS** — Si c'est compliqué, c'est faux
2. **YAGNI** — Si tu n'en as pas besoin maintenant, ne le code pas
3. **1 commit = 1 tâche** — Pas de mega-commit
4. **Valide avant de commit** — lint + type-check + build
5. **Self-review obligatoire** — Relis ton diff avant de merger
6. **Pas de push sur main** — Toujours via PR
7. **Squash merge** — Historique propre, 1 commit par PR
8. **Si tu bloques > 30 min** — Arrête, relis la spec, ou demande de l'aide

## 11. Ressources

- [Conventional Commits](https://www.conventionalcommits.org/)
- `docs/CONVENTIONS.md` — Règles de code détaillées
- `docs/PR-PLAN.md` — Plan d'implémentation
- `docs/BRANCHING.md` — Stratégie de branches
