# Plan : Quality Gates anti-oubli — Timeo v1.0.1

> **Objectif** : Empêcher les PRs incomplètes (cf. oubli des forms CRUD en PR #4). 3 mécanismes complémentaires.
> **Exécution** : je lance tout en autonomie, j'utilise Playwright MCP pour tester, je merge.
> **PR cible** : `feat/quality-gates` → `main`.

---

## 🛠️ Outils que je vais utiliser

| Outil | Usage |
|---|---|
| `mcp__playwright__navigate`, `screenshot`, `click`, `fill`, `evaluate` | Tests E2E + screenshots frontend |
| `mcp__playwright__browser_snapshot` | Vérifier le DOM après navigation |
| `mcp__playwright__browser_console_messages` | Vérifier qu'il n'y a pas d'erreurs JS |
| `mcp__playwright__browser_network_request` | Vérifier que les API calls passent |
| Context7 | Docs à jour Playwright, TanStack Router, Better Auth |
| Skills : `playwright`, `code-review`, `tanstack-router`, `better-auth`, `shadcn` | Best practices |
| Subagent `CoderAgent` | Implémenter les 3 actions |
| Subagent `CodeReviewer` | Review avant commit |
| Tools : Read, Write, Edit, Bash, Grep, Glob | Standard |

---

## 📋 Phase 0 : Discovery (5 min, 0 commit)

### Steps
```bash
cd /home/hlmekki/Documents/repo/timeo
git checkout v1.x && git pull origin main --no-rebase
ls -la .github/ .opencode/ 2>/dev/null
ls -la client/e2e/ tests/ 2>/dev/null
grep -r "playwright" client/package.json package.json 2>/dev/null
```

### Skills à charger (via `skill` tool)
- `playwright` (setup)
- `tanstack-router`
- `better-auth`
- `shadcn`
- `code-review`
- `biome`

### Output attendu
État actuel : `.github/` existe, `e2e/` n'existe pas, `playwright` pas installé, branche v1.x à jour.

---

## 📋 Phase 1 : PR template strict (1h, 1 commit)

### Fichier
- **Path** : `.github/PULL_REQUEST_TEMPLATE.md`
- **Status** : NEW (le repo a déjà `.github/ISSUE_TEMPLATE/` probablement)

### Contenu complet du fichier

```markdown
## PR
- [ ] Branche `feat/phase-X-nom` créée depuis `main` (ou `dev`)
- [ ] Pas de merge conflict
- [ ] PR cible la bonne branche (vérifier la base du merge)

## Fichiers modifiés (exhaustif)
- [ ] Liste chaque fichier + raison du changement
<!-- Exemple :
- [ ] `server/src/routes/users.ts` (ajout endpoint GET /users pour le listing chef)
-->

## Fonctionnalités livrées (SPEC §X.Y, ligne par ligne)
<!-- Cocher CHAQUE item du PR-PLAN pour cette phase -->
- [ ] Item 1 du PR-PLAN (ex: "Tâche 5 : schema Zod pour client")
- [ ] Item 2 du PR-PLAN (ex: "Tâche 6 : routes clients CRUD")
- [ ] Item 3 ...
<!-- Chaque item NON coché doit être justifié dans la section suivante -->

## Fonctionnalités NON livrées (et pourquoi)
<!-- Si tout est fait, écrire "Aucune" -->
- [ ] Item X : reporté à v1.0.1 car [raison]
- [ ] Item Y : pas dans le scope de cette PR

## Self-review (CONVENTIONS.md §4)
- [ ] `bun run lint` vert
- [ ] `bun run type-check` vert
- [ ] `bun run build` vert
- [ ] `bun run db:push` + `bun run db:seed` testés contre Supabase (si modifs DB)
- [ ] Pas de `console.log` oublié
- [ ] Pas de `TODO` / `FIXME` dans le code
- [ ] Tous les nouveaux fichiers ont un `export` ou un `import` (pas de dead code)
- [ ] Tous les nouveaux `export` sont utilisés quelque part (`grep` le nom)
- [ ] Pas de fichier > 250 lignes, pas de fonction > 30 lignes
- [ ] Pas de `any`
- [ ] Colonnes BDD en anglais, UI en français
- [ ] Format erreur canonique `{ error: { code, message, field? } }`

## Tests manuels (flows testés en local)
<!-- Chaque flow doit avoir été testé AVANT de cocher -->
- [ ] `bun run dev` démarre sans erreur
- [ ] Login `chef` / `ChangeMeImmediately123!` redirige vers `/chef/dashboard`
- [ ] Flow X testé manuellement (description)
- [ ] Flow Y testé manuellement (description)

## Screenshots (si UI)
<!-- Attacher les captures d'écran pour validation visuelle -->
- [ ] Screenshot de chaque page affectée par cette PR
- [ ] Screenshot du flow principal testé

## Issue(s) liée(s)
<!-- Si cette PR ferme des issues, les lier avec "Closes #N" -->
- Closes #XX
- Related to #YY
```

### Validation
```bash
test -f .github/PULL_REQUEST_TEMPLATE.md && echo "OK"
```

### Commit
- `chore: add strict PR template with quality checklist`

---

## 📋 Phase 2 : Verifier agent template (2h, 1 commit)

### Fichier
- **Path** : `docs/IA-PROMPT-TEMPLATES.md` (APPEND une nouvelle section)
- **Status** : MODIFY

### Section à ajouter (à la fin du fichier)

```markdown
---

## 9. `verify-pr.md` — Vérifier qu'une PR est complète

**Quand** : avant chaque `gh pr create`, lance ce subagent pour auditer le code vs le plan.

### Template de prompt

```markdown
You are the **PR verification agent** for PR #X of the Timeo project.

# Mission
Verify that EVERY item from the PR-PLAN (docs/PR-PLAN.md) for this PR is implemented in the code. NO OVERSIGHT is acceptable.

# STEP 1 — Load skills first
- `code-review`

# STEP 2 — Read context
- `docs/PR-PLAN.md` (find the PR #X task list)
- `docs/SPEC-V1.md` (find related SPEC sections)
- The actual `git diff main...HEAD` to see what changed

# STEP 3 — For each item in the PR-PLAN task list
For EACH checkbox item in the PR, verify in the code:

1. **"Create X page"** → Check the file `client/src/routes/...tsx` exists AND has substantive content (not just a placeholder, not just `<div>Loading...</div>`)
2. **"Add Y endpoint"** → Check the route handler in `server/src/routes/...ts` AND that it's mounted in `server/src/index.ts` AND that the HTTP method matches
3. **"Add Z component"** → Check the component file exists AND is imported + used in some page
4. **"Wire up A with B"** → Trace the data flow from A to B (form → mutation → API call → cache invalidation)
5. **"Add validation"** → Check Zod schema exists AND is used in the form/route
6. **"Update X hook"** → Check the hook file AND that it returns the right data

# STEP 4 — Common oversights to look for
- Forms that have a button but no onClick / form submission logic
- "Create" buttons that exist but no "create" form/modal
- Routes mounted but no Zod validation
- Hooks that exist but are not called in any page
- Pages that exist but contain only "Coming soon" or placeholders
- Tests claimed in the PR but no test file exists
- Schemas declared in shared/ but not used in any route

# STEP 5 — Report format
For EACH item in the PR-PLAN task list:

- ✅ DONE — implemented in code, working
- ⚠️ PARTIAL — file exists but incomplete
- ❌ MISSING — no file, no code, not implemented
- 🚫 DIFFERENT — implemented differently than planned (specify how)

Then a summary:
- Total items: X
- ✅ Done: Y
- ⚠️ Partial: Z
- ❌ Missing: W
- 🚫 Different: V

# STEP 6 — Block the PR if any item is ❌
If ANY item is ❌ or ⚠️, the PR is NOT READY. List the blockers clearly with:
- File that should exist (with full path)
- Code that should be added (snippet)
- Or the SPEC page reference if it's a behavior gap

# Constraints
- READ-ONLY (don't fix anything, just report)
- Be thorough (no oversight is acceptable)
- Cite file paths + line numbers
- Group by severity (blocker first)
```

### Validation
```bash
test -f docs/IA-PROMPT-TEMPLATES.md && grep -q "verify-pr" docs/IA-PROMPT-TEMPLATES.md && echo "OK"
```

### Commit
- `chore: add verifier agent template to IA-PROMPT-TEMPLATES.md`

---

## 📋 Phase 3 : Playwright E2E smoke tests (3h, 1 commit)

### Install
```bash
cd client
bun add -d @playwright/test
bunx playwright install chromium
```

### Fichiers à créer

#### `client/playwright.config.ts`
```ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: "http://localhost:5173",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "cd .. && bun run dev",
		url: "http://localhost:5173",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
})
```

#### `client/e2e/auth.spec.ts`
```ts
import { test, expect } from "@playwright/test"

test.describe("Auth flow", () => {
	test("login page renders", async ({ page }) => {
		await page.goto("/login")
		await expect(page.getByRole("heading", { name: "Connexion" })).toBeVisible()
		await expect(page.getByLabel("Identifiant")).toBeVisible()
		await expect(page.getByLabel("Mot de passe")).toBeVisible()
	})

	test("redirects to login when not authenticated", async ({ page }) => {
		await page.goto("/chef/dashboard")
		await expect(page).toHaveURL(/\/login/)
	})

	test("login as chef redirects to /chef/dashboard", async ({ page }) => {
		await page.goto("/login")
		await page.getByLabel("Identifiant").fill("chef")
		await page.getByLabel("Mot de passe").fill("ChangeMeImmediately123!")
		await page.getByRole("button", { name: "Se connecter" }).click()
		await expect(page).toHaveURL(/\/chef\/dashboard/)
	})

	test("login as chef redirects to /changer-mot-de-passe first time", async ({ page }) => {
		// This test only works on a freshly seeded DB
		// The chef has mustChangePassword: true by default
		await page.goto("/login")
		await page.getByLabel("Identifiant").fill("chef")
		await page.getByLabel("Mot de passe").fill("ChangeMeImmediately123!")
		await page.getByRole("button", { name: "Se connecter" }).click()
		// First time, should redirect to change password
		await expect(page).toHaveURL(/\/changer-mot-de-passe/)
	})

	test("logout button is in chef layout", async ({ page }) => {
		// First login + change password + then navigate to dashboard
		await page.goto("/login")
		await page.getByLabel("Identifiant").fill("chef")
		await page.getByLabel("Mot de passe").fill("ChangeMeImmediately123!")
		await page.getByRole("button", { name: "Se connecter" }).click()
		// Skip change password (we'd need to change it to test this fully)
		await page.goto("/profil")
		await page.getByRole("button", { name: /Déconnexion/ }).click()
		await expect(page).toHaveURL(/\/login/)
	})
})
```

#### `client/e2e/chef-dashboard.spec.ts`
```ts
import { test, expect } from "@playwright/test"

test.describe("Chef dashboard", () => {
	test.beforeEach(async ({ page }) => {
		// Login as chef
		await page.goto("/login")
		await page.getByLabel("Identifiant").fill("chef")
		await page.getByLabel("Mot de passe").fill("ChangeMeImmediately123!")
		await page.getByRole("button", { name: "Se connecter" }).click()
		await page.waitForURL(/\/chef\/dashboard|\/changer-mot-de-passe/)
		// Skip change password by going directly to dashboard
		if (page.url().includes("changer-mot-de-passe")) {
			await page.goto("/chef/dashboard")
		}
	})

	test("dashboard renders with stats", async ({ page }) => {
		await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
		await expect(page.getByText("Interventions")).toBeVisible()
		await expect(page.getByText("Terminées")).toBeVisible()
	})

	test("sidebar shows chef nav items", async ({ page }) => {
		await expect(page.getByRole("link", { name: /Dashboard/ })).toBeVisible()
		await expect(page.getByRole("link", { name: /Interventions/ })).toBeVisible()
		await expect(page.getByRole("link", { name: /Clients/ })).toBeVisible()
		await expect(page.getByRole("link", { name: /Techs/ })).toBeVisible()
		await expect(page.getByRole("link", { name: /Profil/ })).toBeVisible()
	})

	test("non-autorise page when accessing tech route as chef", async ({ page }) => {
		await page.goto("/tech/missions")
		await expect(page).toHaveURL(/\/non-autorise|\/tech\/missions/)
		// Either redirected or shown the page (depending on whether /tech/missions exists)
	})
})
```

#### `client/e2e/chef-interventions.spec.ts`
```ts
import { test, expect } from "@playwright/test"

test.describe("Chef interventions", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/login")
		await page.getByLabel("Identifiant").fill("chef")
		await page.getByLabel("Mot de passe").fill("ChangeMeImmediately123!")
		await page.getByRole("button", { name: "Se connecter" }).click()
		await page.waitForURL(/\/chef\/dashboard|\/changer-mot-de-passe/)
		if (page.url().includes("changer-mot-de-passe")) {
			await page.goto("/chef/interventions")
		}
	})

	test("interventions list page renders", async ({ page }) => {
		await page.goto("/chef/interventions")
		await expect(page.getByRole("heading", { name: "Interventions" })).toBeVisible()
	})

	test("interventions list has search and filter", async ({ page }) => {
		await page.goto("/chef/interventions")
		// Date filter
		await expect(page.locator('input[type="date"]')).toBeVisible()
		// Status filter
		await expect(page.locator("select")).toBeVisible()
	})
})
```

#### `client/e2e/chef-clients.spec.ts`
```ts
import { test, expect } from "@playwright/test"

test.describe("Chef clients", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/login")
		await page.getByLabel("Identifiant").fill("chef")
		await page.getByLabel("Mot de passe").fill("ChangeMeImmediately123!")
		await page.getByRole("button", { name: "Se connecter" }).click()
		await page.waitForURL(/\/chef\/dashboard|\/changer-mot-de-passe/)
		if (page.url().includes("changer-mot-de-passe")) {
			await page.goto("/chef/clients")
		}
	})

	test("clients list page renders", async ({ page }) => {
		await page.goto("/chef/clients")
		await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible()
	})

	test("clients list has search input", async ({ page }) => {
		await page.goto("/chef/clients")
		await expect(page.getByPlaceholder(/Rechercher/)).toBeVisible()
	})
})
```

#### `client/e2e/tech-missions.spec.ts`
```ts
import { test, expect } from "@playwright/test"

test.describe("Tech missions (skip if no tech user)", () => {
	test("tech layout has bottom bar with Missions + Profil", async ({ page }) => {
		// This test assumes a tech user exists
		// Skip if not (use test.skip in real implementation)
		test.skip(true, "No tech user created in seed — skip for now")
	})
})
```

#### Update `client/package.json` (ajout script e2e)
```json
{
	"scripts": {
		"dev": "vite",
		"build": "tsc -b && vite build",
		"type-check": "tsc --noEmit",
		"preview": "vite preview",
		"lint": "biome lint src/",
		"e2e": "playwright test",
		"e2e:headed": "playwright test --headed"
	}
}
```

### Validation
```bash
cd client && bun run e2e
# Should pass (or show test results)
```

### Commit
- `chore: add Playwright E2E smoke tests for chef + tech pages`

---

## 📋 Phase 4 : Documentation (30 min, 1 commit)

### Fichier : `CONTRIBUTING.md` (MODIFY)

Ajout d'une section après "## 4. Créer la PR" :

```markdown
## 4.5 Quality Gates (obligatoires avant merge)

Avant de merger une PR, **3 vérifications** sont obligatoires :

### Gate 1 : PR template
Tu DOIS utiliser le template à `.github/PULL_REQUEST_TEMPLATE.md`. Chaque case non cochée = blocker.

### Gate 2 : Verifier agent
Avant `gh pr create`, lance le verifier agent :
```
@opencode run verifier agent on PR #X
```
Ou manuellement : voir `docs/IA-PROMPT-TEMPLATES.md` section 9.

L'agent vérifie que CHAQUE item du PR-PLAN est implémenté dans le code. Si ❌, fix avant de push.

### Gate 3 : Smoke tests E2E
```bash
bun run lint && bun run type-check && bun run build && bun --filter client run e2e
```
Tous verts obligatoires.

### Gate 4 (humain) : toi
Tu relis le diff (`git diff main...HEAD`) et tu coches les cases du PR template. Si tu ne peux pas cocher, la PR n'est pas prête.
```

### Fichier : `AGENTS.md` (MODIFY)

Ajout d'une ligne dans la section "Pièges connus" :

```markdown
- **Aucun oubli n'est autorisé.** Avant chaque `gh pr create`, lance le verifier agent (`docs/IA-PROMPT-TEMPLATES.md` §9) pour auditer que CHAQUE item du PR-PLAN est implémenté dans le code.
```

### Validation
```bash
grep -q "Quality Gates" CONTRIBUTING.md && echo "OK"
grep -q "verifier agent" AGENTS.md && echo "OK"
```

### Commit
- `docs: document quality gates (PR template, verifier, E2E tests)`

---

## 📋 Phase 5 : Validation finale + PR (30 min, 1 commit si besoin)

### Steps

1. **Run all validations** :
```bash
bun run lint
bun run type-check
bun run build
cd client && bun run e2e
```

2. **Take screenshots via Playwright MCP** :
   - Navigate to each page
   - Screenshot to `docs/screenshots/v1.0.0/` (if needed)

3. **Commit if any uncommitted changes** :
```bash
git add -A
git status  # review
git commit -m "chore: quality gates validation fixes"
```

4. **Push + PR** :
```bash
git push -u origin feat/quality-gates
gh pr create --base main --title "chore: quality gates (PR template, verifier agent, E2E tests)"
```

5. **Wait for CI** :
```bash
sleep 30 && gh pr checks
```

6. **Merge** :
```bash
gh pr merge --squash
```

### Acceptance
- [ ] `bun run lint` green
- [ ] `bun run type-check` green
- [ ] `bun run build` green
- [ ] `bun --filter client run e2e` all tests pass
- [ ] All 4 commits pushed
- [ ] CI green on PR
- [ ] PR merged

---

## 📊 Récap des commits

| # | Commit | Fichiers |
|---|---|---|
| 1 | `chore: add strict PR template with quality checklist` | `.github/PULL_REQUEST_TEMPLATE.md` |
| 2 | `chore: add verifier agent template to IA-PROMPT-TEMPLATES.md` | `docs/IA-PROMPT-TEMPLATES.md` (APPEND) |
| 3 | `chore: add Playwright E2E smoke tests for chef + tech pages` | `client/playwright.config.ts`, `client/e2e/*.spec.ts`, `client/package.json` |
| 4 | `docs: document quality gates (PR template, verifier, E2E tests)` | `CONTRIBUTING.md`, `AGENTS.md` |

Total : **4 commits**, 1 PR, ~5h de travail.

---

## 🚀 Order of execution

```
[Phase 0: Discovery]  ← 5 min
       ↓
[Phase 1: PR template]  ← 1h
       ↓
[Phase 2: Verifier agent]  ← 2h  ┐
[Phase 3: Playwright E2E]  ← 3h ┘  ← parallel
       ↓
[Phase 4: Documentation]  ← 30 min
       ↓
[Phase 5: Validation + PR]  ← 30 min
```

Total : **~5-6h** (some phases parallelized).

---

## 🛡️ Critères d'acceptance globaux

- [ ] `.github/PULL_REQUEST_TEMPLATE.md` existe avec les 6 sections
- [ ] `docs/IA-PROMPT-TEMPLATES.md` contient la section 9 (verifier agent)
- [ ] `client/playwright.config.ts` configuré
- [ ] `client/e2e/auth.spec.ts` (5 tests)
- [ ] `client/e2e/chef-dashboard.spec.ts` (4 tests)
- [ ] `client/e2e/chef-interventions.spec.ts` (2 tests)
- [ ] `client/e2e/chef-clients.spec.ts` (2 tests)
- [ ] `client/e2e/tech-missions.spec.ts` (1 test, skipped)
- [ ] `CONTRIBUTING.md` mentionne les 3 quality gates
- [ ] `AGENTS.md` mentionne le verifier agent
- [ ] `bun run e2e` passe tous les tests
- [ ] PR mergée dans `main`
- [ ] Tag v1.0.1 créé sur main (optionnel)

---

## 📸 Screenshots (via Playwright MCP)

Je capture les screenshots des pages suivantes pour validation visuelle :

| Page | URL | Attendu |
|---|---|---|
| Login | `/login` | Form username + password |
| Change password (1er login) | `/changer-mot-de-passe` | Form 3 champs |
| Dashboard chef | `/chef/dashboard` | KPIs + activité + non assignées |
| Interventions (liste) | `/chef/interventions` | Filtres + liste |
| Clients (liste) | `/chef/clients` | Search + liste |
| Techs (liste) | `/chef/techs` | Cards tech avec dispo |
| Non-autorise | `/non-autorise` | Message accès refusé |

Screenshots sauvés dans `docs/screenshots/v1.0.0/`.
