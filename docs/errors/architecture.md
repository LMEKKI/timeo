# 🏗️ Architecture — Erreurs & Leçons

### 2026-06-14 — Absence d'isolation des couches (Ports & Adapters)

**Agent** : Repository Manager (planification)
**Tâche** : Architecture initiale du projet, avant refactor

**Problème** : Les fichiers `.md` ne spécifiaient pas clairement que le code métier ne doit jamais dépendre directement de Drizzle, Hono, ou autre infrastructure. Risque de couplage fort.

**Cause** : Architecture documentée de façon trop vague, pas de "garde-fou" pour les agents.

**Solution** :
- Ajout de la section ARCHITECTURE.md avec le pattern Ports & Adapters
- Création de `shared/src/interfaces/` pour tous les ports
- Le container DI (`container.ts`) est le seul endroit où on branche les implémentations concrètes
- Règles de vérification ajoutées pour le CodeReviewer

**Leçon** :
- La documentation d'archi doit être **normative** (ce qui est interdit aussi bien que ce qui est autorisé)
- Un fichier `AGENTS.md` bien fait = zéro ambiguïté pour les agents
- Le `CodeReviewer` doit vérifier le respect des dépendances unidirectionnelles

**Tags** : `#architecture` `#ports-adapters` `#container` `#clean-architecture`
