# 🔄 Process — Erreurs & Leçons

### 2026-06-14 — Oubli du fichier commun d'erreurs

**Agent** : Repository Manager (première session)
**Tâche** : Session de planification initiale

**Problème** : On n'avait pas de fichier centralisé pour tracker les erreurs et les leçons. Chaque agent repartait de zéro, risquant de répéter les mêmes erreurs.

**Cause** : Pas de "mémoire collective" prévue dans l'architecture agent.

**Solution** : Création de `docs/errors/` avec un fichier par catégorie (architecture.md, typescript.md, process.md, etc.) + un README.md central.

**Leçon** :
- Tout agent doit charger TOUS les fichiers de `docs/errors/` avant chaque action
- Toute erreur rencontrée DOIT être documentée immédiatement
- Les agents CoderAgent, TestEngineer, CodeReviewer sont tenus de l'enrichir
- Un dossier de fichiers catégorisés est plus lisible qu'un seul gros fichier

**Tags** : `#process` `#agents` `#memory` `#documentation`
