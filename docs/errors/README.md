# 🧠 ERRORS & LESSONS — Mémoire Collective

> **⚠️ OBLIGATION** : Tout agent qui rencontre une erreur, un piège, ou une leçon DOIT l'ajouter dans le fichier approprié ci-dessous.
> Ces fichiers sont lus par **tous les agents** avant chaque action.
> Le but : ne jamais répéter la même erreur deux fois.

---

## 📂 Structure

| Fichier | Catégorie | Exemples |
|---|---|---|
| `architecture.md` | Architecture, patterns, structure | Ports & Adapters, dépendances, container DI |
| `database.md` | Base de données, Drizzle, migrations | Schemas, requêtes, indexes |
| `typescript.md` | Types, Zod, interfaces | Enums, génériques, validations |
| `auth.md` | Authentification, permissions | Better Auth, Clerk, sessions, RLS |
| `frontend.md` | React, Vite, Shadcn, TanStack | Composants, hooks, offline, état |
| `process.md` | Workflow agent, processus | Implémentations non atomiques, skills oubliés |
| `deployment.md` | Déploiement, CI/CD, hosting | Build, env vars, Docker, Cloudflare |

---

## 📋 Comment Ajouter une Erreur

Copie ce template dans le fichier approprié :

```markdown
### YYYY-MM-DD — Titre court et précis

**Agent** : [nom]
**Tâche** : [feature / fichier]
**Problème** : Ce qui s'est mal passé
**Cause** : Pourquoi c'est arrivé
**Solution** : Comment on a corrigé
**Leçon** : Comment éviter la répétition
**Tags** : #tag1 #tag2
```

---

## ✅ Checklist Agent Avant Chaque Action

- [ ] Ai-je chargé `../AGENTS.md` ?
- [ ] Ai-je chargé `../ARCHITECTURE.md`, `../DATAMODEL.md`, `../WORKFLOW.md` ?
- [ ] Ai-je consulté **tous les fichiers** de `docs/errors/` ?
- [ ] Ai-je chargé les skills appropriés pour ma tâche ?
- [ ] Mon implémentation est-elle atomique (1-3 fichiers max) ?
- [ ] L'interface (port) est-elle définie dans `shared/` avant l'implémentation ?

---

## 📊 Statistiques

| Catégorie | Nombre |
|---|---|
| Architecture | 1 |
| Database | 0 |
| TypeScript | 1 |
| Auth | 0 |
| Frontend | 0 |
| Process | 1 |
| Déploiement | 0 |
| **Total** | **3** |

<!-- Dernière mise à jour : 2026-06-14 -->
