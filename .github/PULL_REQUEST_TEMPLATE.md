## Description

<!-- Quelle phase du plan ? Que fait cette PR ? -->

**Phase :** PR #X — `feat/phase-X-nom`
**Plan :** Lien vers `docs/PR-PLAN.md` (section concernée)

## Type de changement

- [ ] feat — Nouvelle fonctionnalité
- [ ] fix — Correction de bug
- [ ] refactor — Refacto sans changement de comportement
- [ ] chore — Tooling, config, deps
- [ ] docs — Documentation

## Tâches réalisées

<!-- Lister les tâches du plan terminées dans cette PR -->

- [ ] Tâche 1
- [ ] Tâche 2

## Self-review ( obligatoire — voir CONTRIBUTING.md )

### Code
- [ ] Pas de `any` — tout est typé
- [ ] Pas de console.log oublié
- [ ] Pas de code commenté
- [ ] Pas de TODO dans le code
- [ ] Pas de fichier > 250 lignes
- [ ] Pas de fonction > 30 lignes
- [ ] Nommage clair (pas d'abréviations)
- [ ] Early return (pas de nesting profond)
- [ ] Pas de classe / interface avec 1 impl
- [ ] Pas de default export (named exports uniquement)

### Conventions
- [ ] Code en anglais, UI en français
- [ ] Erreurs au format canonique `{ error: { code, message, field? } }`
- [ ] Colonnes BDD en anglais
- [ ] Zod = source de vérité (pas de types manuels)
- [ ] Commentaires expliquent le POURQUOI, pas le QUOI

### KISS / YAGNI
- [ ] Pas de feature non prévue dans la spec
- [ ] Pas de pattern complexe inutile (Repository, Factory, Strategy)
- [ ] Pas de code "au cas où" (YAGNI)

## Validation

- [ ] `bun run lint` passe
- [ ] `bun run type-check` passe
- [ ] `bun run build` passe

## Notes

<!-- Difficultés, décisions de design, points d'attention -->
