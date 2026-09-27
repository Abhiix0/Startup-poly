# Visual Language Architecture Decision

## Context

STARTUPOLY features two distinct visual scenery environments:
1. **The Open-Air World (Landing Page)**: Built with `SkyLayer`, `PixelWorld`, `DistantHillsAndCastle`, `FloatingPlatforms`, and the roaming `Founder` character. Designed as a living, expansive Mario-style landscape that greets visitors and invites them into the game universe.
2. **Specific Game Chambers (Join & Admin Pages)**: Built with `WoodenSignboard`, `WoodenActionButton`, `CastleBackground` (admin login), `PlainsBackground` (team join), and `RoamingCharacter`. Designed as tactile, grounded board-game entry checkpoints.

---

## Decision: Retain Distinct Scenery Systems (Intentional Game Metaphor)

**Decision**: The two visual systems are **intentionally kept distinct** rather than merged into a single generic layout.

### Rationale
- **The "Entering a Room in the World" Metaphor**:
  - The landing page represents the broad, open-air world map.
  - The **Team Join** page represents approaching a physical signpost on the edge of the competition grounds (`PlainsBackground`), where players enter their room code to step onto the game board.
  - The **Admin Login** page represents arriving at the fortified castle keep / control tower (`CastleBackground`), where the match arbitrator enters the control center.
- **Physical Board Game Thematic Fit**: STARTUPOLY is a digital companion for a physical board game. Moving from the open landing world to a tactile wooden signboard posted outside the arena creates an immersive, purposeful narrative transition for participants.
- **Component Specialization**: The signboard components (`WoodenSignboard`, `PixelInputSlots`, `WoodenActionButton`) solve specific user flows (entering 6-character PIN codes, authenticating) that require a focused, contained UI canvas rather than sprawling full-viewport world layers. Merging them into the landing page's scenery stack would clutter both without visual or functional benefit.

---

## Objective Inconsistencies Identified & Remediated

Regardless of keeping the scenery distinct, several objective inconsistencies in tactile physics, design tokens, reduced-motion accessibility, and project conventions were identified and fixed:

### 1. Button Press Physics Harmonization (`WoodenActionButton` vs `ArcadeLink`)
- **Issue**: `WoodenActionButton` translated *downward* on hover (`hover:translate-y-0.5`) and cleared its shadow diagonally on active (`active:translate-x-1 active:translate-y-1 active:shadow-none`), diverging from `ArcadeLink`. Additionally, inline `style={{ boxShadow: ... }}` superseded hover/active shadow classes.
- **Remediation**:
  - Hover lifts upward with depth: `hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#102040]`.
  - Active compresses downward: `active:translate-y-[2px] active:shadow-[2px_2px_0px_#102040]`.
  - Full keyboard accessibility: `focus-visible:-translate-y-[2px] focus-visible:shadow-[6px_6px_0px_#102040]` and `focus-visible:ring-4 focus-visible:ring-[#FFCC00]`.
  - Transition timing harmonized to `transition-all duration-75 ease-out`.
  - Explicit reduced-motion escape hatches added: `motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none`.

### 2. Palette Token Alignment
- **Issue**: `WoodenActionButton` used ad-hoc hex values for hover states:
  - `green` hover used `#2ED15C` (unvetted neon green).
  - `brick` hover used `#D9531E` (off-palette bright orange).
- **Remediation**:
  - `green` hover aligned to `#1fa145` (matching `ArcadeLink`'s primary hover token).
  - `brick` hover aligned to `#9E350F` (consistent dark hover within brick token spectrum).
  - `gold` hover aligned to `#f5c400` (matching `ArcadeLink`'s secondary hover token).

### 3. Reduced-Motion Coverage (`src/index.css`)
- **Issue**: While global `* { animation: none !important; }` exists, elements with entrance keyframes (`anim-signboard-enter`, `anim-signboard-error`, `anim-signboard-success`, `anim-slot-active`, `anim-flag`, `anim-torch`, `anim-gate-open`, `anim-block-cycle`, `anim-coin-idle`, `anim-pipe-highlight`) require explicit reset to `opacity: 1 !important; transform: none !important;` to ensure they render immediately and statically when reduced motion is preferred.
- **Remediation**: Added all signboard, castle, and plains ambient classes to the dedicated `@media (prefers-reduced-motion: reduce)` block in `src/index.css`.

### 4. Test File Casing and Organization
- **Issue**: `woodenSignboard.test.tsx` (lowercase) conflicted with PascalCase component naming, and conflated tests for `WoodenSignboard`, `PixelInputSlots`, and `WoodenActionButton`. `pixelSprites.test.tsx` used camelCase.
- **Remediation**:
  - Renamed `woodenSignboard.test.tsx` to `WoodenSignboard.test.tsx` via `git mv`.
  - Extracted `PixelInputSlots.test.tsx` and `WoodenActionButton.test.tsx` to adhere to the project's standard 1-component-per-test-file convention.
  - Renamed `pixelSprites.test.tsx` to `PixelSprites.test.tsx` via `git mv`.
