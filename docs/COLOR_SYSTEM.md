# STARTUPOLY Design System: Color System & Tokens

This document serves as the single source of truth for all color tokens, semantic usage guidelines, migration mappings, and styling guardrails across the STARTUPOLY codebase.

---

## 1. Core 7-Color Brand Palette

STARTUPOLY is built upon an authentic 8-bit retro arcade aesthetic anchored by 7 authoritative brand colors. Every UI element, border, surface, and semantic indicator is derived from or harmonizes with this primary palette.

| Token | Hex | Role & Usage | Tailwind Utility |
|---|---|---|---|
| `--color-brand-sky` | `#5C94FC` | World sky, atmosphere, primary info badges, network state | `bg-brand-sky`, `text-brand-sky`, `border-brand-sky` |
| `--color-brand-green` | `#22B14C` | Warp pipe green, primary success states, cash positive indicators, active turn pills | `bg-brand-green`, `text-brand-green`, `border-brand-green` |
| `--color-brand-gold` | `#FFCC00` | Coin gold, primary buttons, arcade highlights, warning states, leaderboard medals | `bg-brand-gold`, `text-brand-gold`, `border-brand-gold` |
| `--color-brand-brick` | `#B84418` | Terracotta brick, secondary arcade accents, warm terrain accents | `bg-brand-brick`, `text-brand-brick`, `border-brand-brick` |
| `--color-brand-white` | `#FFFFFF` | Crisp pixel card backgrounds, high-contrast text, cloud fills | `bg-brand-white`, `text-brand-white`, `border-brand-white` |
| `--color-brand-navy` | `#102040` | 8-bit border ink, drop shadows, high-contrast dark text, retro headers | `bg-brand-navy`, `text-brand-navy`, `border-brand-navy` |
| `--color-brand-red` | `#D32F2F` | Expense alerts, emergency indicators, danger states, cancel actions | `bg-brand-red`, `text-brand-red`, `border-brand-red` |

---

## 2. Navy-Tinted Neutral Scale

To eliminate fragmented slate/gray/zinc hexes, STARTUPOLY utilizes a unified navy-tinted neutral scale. These shades are derived with a subtle cool undertone to blend seamlessly with `--color-brand-navy` (`#102040`).

| Token | Hex | Primary Usage | Tailwind Utility |
|---|---|---|---|
| `--color-neutral-50` | `#F8FAFC` | Light surface background, modal background, card fills | `bg-neutral-50`, `text-neutral-50` |
| `--color-neutral-100` | `#F1F5F9` | Table header background, subtle card dividers | `bg-neutral-100`, `border-neutral-100` |
| `--color-neutral-200` | `#E2E8F0` | Subtle inner borders, container dividers | `bg-neutral-200`, `border-neutral-200` |
| `--color-neutral-300` | `#CBD5E1` | Disabled element borders, placeholder strokes | `border-neutral-300` |
| `--color-neutral-400` | `#94A3B8` | Disabled text, tertiary metadata | `text-neutral-400` |
| `--color-neutral-500` | `#64748B` | Secondary text, subtle timestamps | `text-neutral-500` |
| `--color-neutral-600` | `#475569` | Body text in dark containers, muted icons | `text-neutral-600` |
| `--color-neutral-700` | `#334155` | Castle slate stone, deep card surfaces | `bg-neutral-700`, `text-neutral-700` |
| `--color-neutral-800` | `#1E293B` | Dark surface fills, terminal surfaces | `bg-neutral-800`, `text-neutral-800` |
| `--color-neutral-900` | `#102040` | Identical to `--color-brand-navy`: Primary ink & borders | `bg-neutral-900`, `text-neutral-900`, `border-neutral-900` |
| `--color-neutral-950` | `#0A1128` | Deep night sky, deepest drop shadow layer | `bg-neutral-950`, `text-neutral-950` |

---

## 3. Semantic Status System

Semantic states are derived directly from the core brand palette, providing consistent feedback for actions, alerts, badges, and system toasts.

### Success (Derived from Arcade Green `#22B14C`)
- `status-success`: `#22B14C` (Base indicator, active badges)
- `status-success-light`: `#86EFAC` (Borders on success callouts)
- `status-success-dark`: `#16A34A` (Hover and dark mode accents)
- `status-success-bg`: `#F0FDF4` (Pill & banner backgrounds)

### Warning & Attention (Derived from Coin Gold `#FFCC00`)
- `status-warning`: `#FFCC00` (Base gold indicator)
- `status-warning-light`: `#FEF9C3` (Parchment & gold highlights)
- `status-warning-dark`: `#B45309` (Amber warning borders)
- `status-warning-text`: `#92400E` (Accessible text on amber backgrounds)
- `status-warning-bg`: `#FFFBEB` (Warning callout backgrounds)

### Danger & Destruction (Derived from Flag Red `#D32F2F`)
- `status-danger`: `#D32F2F` (Abort, penalty, deficit indicators)
- `status-danger-light`: `#FCA5A5` (Error pill borders)
- `status-danger-dark`: `#991B1B` (Hover & active states on destructive buttons)
- `status-danger-bg`: `#FEECEB` (Error card & callout backgrounds)

### Information & System (Derived from Sky Blue `#5C94FC`)
- `status-info`: `#5C94FC` (Network sync, turn notification)
- `status-info-light`: `#BAE6FD` (Info callout borders)
- `status-info-dark`: `#1E40AF` (Deep blue emphasis)
- `status-info-bg`: `#F0F9FF` (Info banner backgrounds)

---

## 4. Functional Interaction Variants

For tactile arcade feedback, interactive components use strict mathematical brightness/tint shifts rather than arbitrary hex codes:

- `--color-interactive-gold-hover`: `#f5c400`
- `--color-interactive-gold-active`: `#e6b800`
- `--color-interactive-green-hover`: `#1fa145`
- `--color-interactive-red-hover`: `#bf2626`

---

## 5. Old Token → New Token Migration Reference

During the systematic migration in Phases 3–5, old token names and raw hex codes are replaced according to this mapping table:

| Old / Fragmented Token or Hex | New Canonical Token | Tailwind Utility Replacement |
|---|---|---|
| `#5C94FC`, `nes-sky`, `sky-base` | `--color-brand-sky` | `bg-brand-sky`, `text-brand-sky`, `border-brand-sky` |
| `#22B14C`, `nes-green`, `green-retro` | `--color-brand-green` | `bg-brand-green`, `text-brand-green`, `border-brand-green` |
| `#FFCC00`, `nes-gold`, `gold-base` | `--color-brand-gold` | `bg-brand-gold`, `text-brand-gold`, `border-brand-gold` |
| `#B84418`, `nes-brick`, `brick-base` | `--color-brand-brick` | `bg-brand-brick`, `text-brand-brick`, `border-brand-brick` |
| `#FFFFFF`, `nes-white` | `--color-brand-white` | `bg-brand-white`, `text-brand-white`, `border-brand-white` |
| `#102040`, `nes-navy`, `navy-base` | `--color-brand-navy` | `bg-brand-navy`, `text-brand-navy`, `border-brand-navy` |
| `#D32F2F`, `nes-red`, `flag-red` | `--color-brand-red` | `bg-brand-red`, `text-brand-red`, `border-brand-red` |
| `#F8FAFC`, `metal-surface` | `--color-neutral-50` | `bg-neutral-50` |
| `#F1F5F9`, `metal-light` | `--color-neutral-100` | `bg-neutral-100` |
| `#E2E8F0`, `metal-plate`, `nes-gray` | `--color-neutral-200` | `bg-neutral-200`, `border-neutral-200` |
| `#CBD5E1`, `metal-border` | `--color-neutral-300` | `border-neutral-300` |
| `#64748B`, `metal-mid`, `nes-muted` | `--color-neutral-500` | `text-neutral-500` |
| `#475569`, `metal-dark` | `--color-neutral-600` | `text-neutral-600` |
| `#334155`, `castle-stone`, `metal-deep` | `--color-neutral-700` | `bg-neutral-700` |
| `#1E293B`, `castle-shadow`, `navy-mid` | `--color-neutral-800` | `bg-neutral-800` |
| `#0A1128`, `navy-deep` | `--color-neutral-950` | `bg-neutral-950` |

---

## 6. Sprite Art Exemption Policy

**CRITICAL RULE:**
Sprite-local pixel art colors used to render characters, animations, and decorative landscape scenery are **strictly exempt** from the UI-chrome token enforcement.

The following sprite palettes must remain as sprite constants:
1. **Founder / Mascot Sprite Art:**
   - Skin tones: `#FFD1A4`, `#FFC49A`, `#E09870`, `#C07850`, `#8D5524`, `#C68642`, `#E0AC69`
   - Hair & Mustache: `#8B2500`, `#451A03`, `#5A1E00`, `#3A1400`
   - Cap & Overalls: `#E52521` (Mario red signature), `#1E3A8A` / `#0000AA` (Blue overalls)
   - Accents: `#FFE600` (Buttons), `#000000` (Pupils, outlines)
2. **Environment & Scenery Pixels:**
   - Pixel clouds, trees, pipes, terrain tiles where multi-tone pixel shading is essential for authentic dithering and rendering.

These colors are artistic content, not application chrome, and are not to be flattened or replaced by UI tokens.

---

## 7. Deprecation Timeline

- **Phase 2:** Canonical tokens defined in `src/index.css` `@theme` and `:root`. Backward-compatibility aliases created.
- **Phases 3–5:** Progressive migration of UI components, Admin views, Team dashboard, and Public routes.
- **Phase 6:** Complete removal of deprecated aliases (`--color-nes-*`, old ad-hoc tokens) from `src/index.css`.
