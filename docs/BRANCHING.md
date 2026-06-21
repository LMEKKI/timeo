# Stratégie de Branches — Timeo

## Vue d'ensemble

```
main (production)
  │
  ├── dev (staging/test)
  │     │
  │     ├── feat/intervention-api
  │     ├── feat/dashboard-chef
  │     ├── fix/login-error
  │     └── ...
  │
  └── hotfix/critical-bug (direct depuis main)
```

## Branches

| Branche | Origine | Merge vers | Déploiement | Protection |
|---|---|---|---|---|
| **main** | — | — | Vercel prod | ✅ Pas de push direct, PR requise |
| **dev** | main | main (PR) | Vercel staging | ✅ Pas de push direct, PR requise |
| **feat/*** | dev | dev (PR) | — | ❌ |
| **fix/*** | dev ou main | dev ou main (PR) | — | ❌ |
| **hotfix/*** | main | main + dev (PR) | — | ❌ |

## Workflow

### Nouvelle feature
```bash
git checkout dev
git pull origin dev
git checkout -b feat/intervention-api
# ... développement
git push origin feat/intervention-api
# Créer PR → dev
# Review + merge
```

### Bug fix
```bash
git checkout dev
git pull origin dev
git checkout -b fix/login-error
# ... correction
git push origin fix/login-error
# Créer PR → dev
# Review + merge
```

### Hotfix (bug critique en prod)
```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-auth-bug
# ... correction
git push origin hotfix/critical-auth-bug
# Créer PR → main + dev
# Review + merge
```

### Release vers production
```bash
git checkout main
git pull origin main
git merge dev
git push origin main
# Vercel déploie automatiquement
```

## Conventions de nommage

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/description` | `feat/intervention-api` |
| Fix | `fix/description` | `fix/login-error` |
| Hotfix | `hotfix/description` | `hotfix/critical-auth-bug` |
| Chore | `chore/description` | `chore/update-deps` |
| Docs | `docs/description` | `docs/update-spec` |

## Branch protection rules (GitHub)

### `main`
- ✅ Require pull request before merging
- ✅ Require approvals (1 minimum)
- ✅ Require status checks to pass (CI: lint, typecheck, build)
- ✅ Require branches to be up to date
- ❌ Allow force pushes (non)
- ❌ Allow deletions (non)

### `dev`
- ✅ Require pull request before merging
- ✅ Require status checks to pass (CI: lint, typecheck, build)
- ❌ Allow force pushes (non)

## Vercel deployment

| Branche | Environnement | URL |
|---|---|---|
| `main` | Production | `timeo.vercel.app` |
| `dev` | Preview | `timeo-dev.vercel.app` |
| `feat/*` | Preview | `timeo-feat-xxx.vercel.app` |

Vercel déploie automatiquement chaque branche en preview.

## Résumé

```
main ──────────────────────────────────▶ Production
  │
  └── dev ─────────────────────────────▶ Staging
        │
        ├── feat/xxx ──PR──▶ dev
        ├── feat/yyy ──PR──▶ dev
        └── fix/zzz ──PR──▶ dev

hotfix/xxx ──PR──▶ main + dev
```

**4 branches max en vie** : main, dev, feat/*, fix/*
**2 PRs obligatoires** : feat/fix → dev, dev → main
**CI sur chaque PR** : lint, typecheck, build
