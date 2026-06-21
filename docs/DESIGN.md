# Timeo — Design System

> **Base :** [Violet Issue](https://designmd.ai/chef/violet-issue) par @chef (designmd.ai)
> **Licence :** MIT
> **Adapté pour :** Timeo — gestion d'interventions terrain

---

## 1. Vue d'ensemble

Violet Issue est un design system pensé pour les outils de suivi de tickets et de gestion de projet. Timeo l'adopte comme base et l'étend pour :
- Un **mode dark** (dashboard chef desktop)
- Un **mode light** dérivé (interface mobile tech en extérieur)
- Des **statuts d'intervention** (6 états au lieu de 3)
- Une **sidebar de navigation** type Gemini

---

## 2. Palette — Dark Mode (mode principal)

| Token | Valeur | Usage |
|-------|--------|-------|
| **Primary** | `#5E6AD2` | Actions principales, sélection, focus rings |
| **Primary Hover** | `#4E5BBF` | Hover/pressed sur primary |
| **Secondary** | `#6E79D6` | Highlights secondaires, accents |
| **Background** | `#101014` | Fond d'application (niveau 0) |
| **Neutral** | `#1B1B25` | Sidebar, cards (niveau 1) |
| **Surface** | `#1F1F2E` | Dropdowns, modals, command palette (niveau 2) |
| **Surface Elevated** | `#252536` | Popovers, tooltips (niveau 3) |
| **Text Primary** | `#F1F1F4` | Titres, texte principal |
| **Text Secondary** | `#8A8F98` | Métadonnées, timestamps, placeholders |
| **Border** | `#2C2C3A` | Bordures subtiles, inputs, séparateurs |
| **Success** | `#3DD68C` | Terminé, disponible, OK |
| **Warning** | `#F0C000` | En cours, attention |
| **Error** | `#EB5757` | Annulé, urgent, erreur |
| **High Priority** | `#F7953D` | Haute priorité, en mission |

---

## 3. Palette — Light Mode (mobile tech)

| Token | Dark | Light |
|-------|------|-------|
| Background | `#101014` | `#F8F9FA` |
| Neutral | `#1B1B25` | `#FFFFFF` |
| Surface | `#1F1F2E` | `#F1F3F5` |
| Surface Elevated | `#252536` | `#E9ECEF` |
| Text Primary | `#F1F1F4` | `#1A1D23` |
| Text Secondary | `#8A8F98` | `#6B7280` |
| Border | `#2C2C3A` | `#E5E7EB` |

> **Note :** Les couleurs d'accent (Primary, Success, Warning, Error) restent identiques en light mode.

---

## 4. Statuts d'intervention → Couleurs

| Statut | Token | Code fond | Code texte |
|--------|-------|-----------|------------|
| `non_assigne` | Text Secondary | `#8A8F98` à 15% | `#8A8F98` |
| `planifie` | Primary | `#5E6AD2` à 22% | `#5E6AD2` |
| `en_route` | Secondary | `#6E79D6` à 22% | `#A78BFA` |
| `demarre` | Warning | `#F0C000` à 20% | `#F0C000` |
| `termine` | Success | `#3DD68C` à 22% | `#3DD68C` |
| `annule` | Error | `#EB5757` à 22% | `#EB5757` |

---

## 5. Priorités → Couleurs

| Priorité | Token | Code fond | Code texte |
|----------|-------|-----------|------------|
| `basse` | Text Secondary | `#8A8F98` à 15% | `#8A8F98` |
| `haute` | High Priority | `#F7953D` à 20% | `#F7953D` |
| `urgente` | Error | `#EB5757` à 20% | `#EB5757` |

---

## 6. Disponibilité tech → Couleurs

| Statut | Couleur dot | Code |
|--------|------------|------|
| `disponible` | Success | `#3DD68C` |
| `en_mission` | High Priority | `#F7953D` |
| `absent` | Error | `#EB5757` |

---

## 7. Typographie

| Rôle | Font | Poids | Taille | Usage |
|------|------|-------|--------|-------|
| H1 | Inter | 600 | 40px | Landing page |
| H2 | Inter | 600 | 32px | Settings |
| H3 | Inter | 600 | 24px | Titre de page |
| H4 | Inter | 500 | 20px | Titre de vue |
| H5 | Inter | 500 | 16px | Titre de panneau |
| Body | Inter | 500 | 14px | Titre d'intervention |
| Small | Inter | 400 | 13px | Navigation, body small |
| Metadata | Inter | 500 | 12px | Labels, statuts, métadonnées |
| Code | JetBrains Mono | 400 | 11px | ID d'intervention, raccourcis |

- **Line-height :** Body = 1.5, Headings = 1.2
- **Letter-spacing :** Headings = -0.03em, Overline = 0.05em

---

## 8. Spacing

**Base unit :** 4px

| Valeur | Usage |
|--------|-------|
| 2px | Très serré |
| 4px | Padding chips, gap minimal |
| 8px | Gap standard, padding cards |
| 12px | Padding boutons, sections horizontales |
| 16px | Padding contenu, gap sections |
| 20px | Sections |
| 24px | |
| 32px | Espacement entre sections |
| 40px | |
| 48px | |
| 64px | |

---

## 9. Border Radius

| Valeur | Usage |
|--------|-------|
| 4px | Chips, badges, labels inline |
| 6px | Boutons, inputs, dropdown items |
| 8px | Cards, panels, nav items, dropdowns |
| 12px | Modals, command palette, settings |
| 9999px | Cercles (statuts, avatars, raccourcis clavier) |

---

## 10. Élévation (Dark Mode)

Pas de shadows lourdes — utilisation de **layering par couleur de fond**.

| Niveau | Fond | Composant |
|--------|------|-----------|
| 0 | `#101014` | Fond d'application |
| 1 | `#1B1B25` | Sidebar, cards |
| 2 | `#1F1F2E` | Dropdowns, command palette, modals |
| 3 | `#252536` | Popovers, tooltips |

**Modal shadow :** `0 24px 48px rgba(0,0,0,0.4)` + backdrop blur 4px
**Focus glow :** `0 0 24px rgba(94,106,210,0.15)` sur éléments focused/sélectionnés

---

## 11. Composants

### Boutons

| Variante | Fond | Texte | Hauteur | Padding H | Border |
|----------|------|-------|---------|-----------|--------|
| **Primary** | `#5E6AD2` | Blanc | 32px / 28px | 12px | — |
| **Secondary** | Transparent | `#F1F1F4` | 32px / 28px | 12px | 1px `#2C2C3A` |
| **Ghost** | Transparent | `#8A8F98` | 32px / 28px | 12px | — |

- **Hover Primary :** `#4E5BBF`
- **Hover Secondary :** border `#8A8F98`
- **Hover Ghost :** texte `#F1F1F4`, fond `#1F1F2E`
- **Font :** 13px Inter 500
- **Radius :** 6px
- **Hauteur compact :** 28px (toolbar, filtres)
- **Hauteur standard :** 32px (formulaires, pages)

### Inputs

- Hauteur : 32px (standard) / 28px (compact)
- Fond : `#1B1B25` (dark) / `#FFFFFF` (light)
- Border : 1px `#2C2C3A` (dark) / `#E5E7EB` (light)
- Radius : 6px
- Font : 14px Inter 400
- Placeholder : `#8A8F98`
- Focus : border `#5E6AD2` + ring `0 0 0 2px rgba(94,106,210,0.15)`

### Chips (Badges)

- Hauteur : 20px
- Radius : 4px
- Font : 11px Inter 500
- Padding : 2px 8px
- Fond : couleur à 15-22% d'opacité
- Texte : couleur pleine

### Cartes (Cards)

- Fond : `#1B1B25` (dark) / `#FFFFFF` (light)
- Border : 1px `#2C2C3A` (dark) / `#E5E7EB` (light)
- Radius : 8px
- Padding : 12px 16px
- Pas de shadow

### Listes (Rows)

- Hauteur de ligne : 36px
- Pleine largeur, pas de bordure visible entre les lignes
- Hover : fond `#1F1F2E` (dark) / `#F1F3F5` (light)
- Sélectionné : fond `#5E6AD2` à 10%
- Contenu en ligne : status + priority + ID + title + labels + assigné

### Sidebar

- Largeur : 220px (étendue) → 48px (réduite)
- Fond : `#1B1B25` (dark) / `#FFFFFF` (light)
- Bordure droite : 1px `#2C2C3A`
- Items nav : 13px Inter 500, hauteur 32px, radius 8px
- Item actif : fond `#5E6AD2` à 10%, texte `#F1F1F4`
- Sections : collapsibles
- Bas : settings, aide, déconnexion

### Command Palette (Cmd+K)

- Largeur : 560px centrée
- Fond : `#1F1F2E` (dark) / `#FFFFFF` (light)
- Border : 1px `#2C2C3A`
- Radius : 12px
- Shadow : `0 24px 48px rgba(0,0,0,0.4)` + backdrop blur
- Input : 44px, 16px Inter 400
- Résultats groupés par catégorie, lignes 36px
- Navigation clavier avec highlight `#5E6AD2` à 10%

### Tooltips

- Fond : `#252536`
- Border : 1px `#2C2C3A`
- Texte : `#F1F1F4`, 12px Inter 400
- Radius : 6px
- Padding : 6px 10px
- Délai : 0ms, fade-in 100ms
- Raccourci clavier aligné à droite en JetBrains Mono

---

## 12. Animations

| Règle | Valeur |
|-------|--------|
| Durée max | 150ms |
| Hover response | 50ms |
| Tooltip fade-in | 100ms |
| Modal backdrop | blur 4px instantané, contenu fade 100ms |
| Page transition | Pas d'animation (instantané) |

**Pas de :**
- Animations décoratives
- Transitions >150ms
- Shadows lourdes

---

## 13. Statuts — Rendu visuel

### Mode Dark (Chef)

```
┌──────────────────────────────────────────────┐
│ ● Non assigné  ● Planifié  ● En route        │
│   #8A8F98        #5E6AD2     #6E79D6          │
│                                              │
│ ● Démarré      ● Terminé   ● Annulé          │
│   #F0C000        #3DD68C     #EB5757          │
└──────────────────────────────────────────────┘
```

### Mode Light (Tech mobile)

```
┌──────────────────────────────────────────────┐
│ ● Non assigné  ● Planifié  ● En route        │
│   fond #F1F3F5   fond #EBF0FF  fond #F0ECFF  │
│   txt  #6B7280   txt  #5E6AD2  txt  #7C6FD6  │
│                                              │
│ ● Démarré      ● Terminé   ● Annulé          │
│   fond #FFF7E6   fond #E6F9F0  fond #FFE6E6  │
│   txt  #C79500   txt  #2D8A5E  txt  #D14343  │
└──────────────────────────────────────────────┘
```

---

## 14. Mise en œuvre technique

### shadcn/ui CSS Variables (dark mode)

```css
:root {
  --background: 240 6% 7%;        /* #101014 */
  --foreground: 240 5% 95%;       /* #F1F1F4 */
  --card: 240 15% 13%;            /* #1B1B25 */
  --card-foreground: 240 5% 95%;
  --popover: 240 20% 16%;         /* #252536 */
  --primary: 234 58% 64%;         /* #5E6AD2 */
  --primary-foreground: 0 0% 100%;
  --secondary: 240 18% 18%;       /* #1F1F2E */
  --muted: 240 10% 17%;
  --muted-foreground: 220 6% 56%; /* #8A8F98 */
  --accent: 234 58% 64%;
  --destructive: 0 73% 63%;       /* #EB5757 */
  --border: 240 15% 20%;          /* #2C2C3A */
  --input: 240 15% 20%;
  --ring: 234 58% 64%;
  --radius: 0.5rem;
}
```

### Light mode

```css
.light {
  --background: 210 20% 97%;      /* #F8F9FA */
  --foreground: 220 15% 12%;      /* #1A1D23 */
  --card: 0 0% 100%;              /* #FFFFFF */
  --card-foreground: 220 15% 12%;
  --popover: 0 0% 100%;
  --border: 220 13% 91%;          /* #E5E7EB */
  --input: 220 13% 91%;
  --muted: 210 14% 95%;           /* #F1F3F5 */
  --muted-foreground: 220 9% 46%; /* #6B7280 */
}
```

---

## 15. Références

- **Source :** [Violet Issue par @chef](https://designmd.ai/chef/violet-issue)
- **Licence :** MIT
- **Fichier DESIGN.md original :** https://designmd.ai/api/v1/kits/chef/violet-issue/download
- **MCP :** `designmd.ai` MCP server disponible pour implémentation automatique
