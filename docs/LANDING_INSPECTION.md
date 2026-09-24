# STARTUPOLY Landing Page — Inspection & Zone Map (Phase 0)

> Generated: September 2026  
> Purpose: Architectural, animation, and behavioral baseline for the Landing Page "Living World" Plan.  
> Status: Phase 0 Complete — No visual or functional changes introduced.

---

## 1. Component Map

The landing route (`/`) is rooted at `src/routes/public/LandingPage.tsx` and wrapped in `src/App.tsx` by `SceneTransition`.

```text
LandingPage (src/routes/public/LandingPage.tsx)
├── Hooks:
│   ├── useFirstVisit (src/lib/useFirstVisit.ts) -> isFirstVisit, markSeen
│   └── usePageVisibility (src/lib/usePageVisibility.ts) -> document.dataset.paused
│
├── Layer 0: Sky Atmosphere
│   └── SkyLayer (src/routes/public/SkyLayer.tsx)
│       └── PixelCloudFluffy (src/ui/pixel/PixelCloudFluffy.tsx) [Track 1: far; Track 2: mid]
│
├── Layer 1: Distant Background
│   └── DistantHillsAndCastle (src/routes/public/DistantHillsAndCastle.tsx)
│       ├── SVG Blue Mountains (inline vector)
│       ├── SVG Green Hills (inline vector)
│       └── Castle Fortress Silhouette (hidden < sm)
│           └── Flag SVG (.anim-flag-flutter)
│
├── Layer 2: Floating Upper Platforms (hidden < sm)
│   └── FloatingPlatforms (src/routes/public/FloatingPlatforms.tsx)
│       ├── Upper-Left Island:
│       │   ├── PixelCoin (src/ui/pixel/PixelCoin.tsx) (.anim-coin-idle)
│       │   ├── PixelQuestionBlock (src/ui/pixel/PixelQuestionBlock.tsx) (.anim-block-cycle)
│       │   └── PixelGrassTuft (src/ui/pixel/PixelGrassTuft.tsx)
│       └── Upper-Right Island:
│           ├── 3x PixelCoin (.anim-coin-idle with staggered delays)
│           └── Winged Flying Critter (.anim-winged-hover)
│
├── Layer 3: Main Title Screen UI (Hero & Portals)
│   ├── Header:
│   │   ├── Wordmark: 2x PixelCoin (.anim-coin-idle) + <h1>STARTUPOLY</h1> (.anim-entrance-logo)
│   │   ├── Subtitle Badge: DREAM (.anim-entrance-word-1) · BUILD (.anim-entrance-word-2) · GROW (.anim-entrance-word-3)
│   │   ├── LiveIndicator (src/routes/public/LiveIndicator.tsx) (.anim-live-dot)
│   │   └── Tagline Plaque: "THE BOARD IS PHYSICAL..." (.anim-entrance-tagline)
│   │
│   ├── Main Portals Container (.anim-entrance-ctas):
│   │   ├── Team Phone Signboard (Wooden Checkpoint):
│   │   │   ├── PixelPhoneIcon (src/ui/pixel/PixelPhoneIcon.tsx)
│   │   │   ├── ArcadeLink (src/ui/ArcadeLink.tsx) -> to="/join" [ctaType="join"]
│   │   │   │   └── Hover/focus coin pop: 2x PixelCoin (.anim-pop-coins)
│   │   │   └── Timber Posts (hidden < sm)
│   │   │
│   │   ├── Event Admin Console (Metal Billboard):
│   │   │   ├── Battlements & Waving Flag (hidden < sm) (.anim-flag-flutter)
│   │   │   ├── PixelTerminalIcon (src/ui/pixel/PixelTerminalIcon.tsx)
│   │   │   ├── ArcadeLink (src/ui/ArcadeLink.tsx) -> to="/admin" [ctaType="admin"]
│   │   │   │   └── Blinking cursor on hover/focus (▮)
│   │   │   └── Stone Pillar Posts (hidden < sm)
│   │   │
│   │   └── Grounded Stage Platform (hidden < sm):
│   │       ├── Grass Strip with PixelGrassTuft + PixelFlower
│   │       └── Chunky Brick Foundation with root footings
│
└── Layer 4: Living Pixel World Ground & Scene
    └── PixelWorld (src/routes/public/PixelWorld.tsx)
        ├── Hook: usePointerParallax (src/lib/usePointerParallax.ts) -> sets --px, --py
        ├── Layer 1: Sky canvas backdrop (data-layer="1-sky")
        ├── Layer 2: Far Clouds (data-layer="2-clouds-far", .anim-cloud-drift-far)
        │   └── PixelCloudFluffy
        ├── Layer 3: Near Clouds (data-layer="3-clouds-near", .anim-cloud-drift-near)
        │   └── PixelCloudFluffy
        ├── Layer 4: Ground Foliage Decor (data-layer="4-ground-deco")
        │   ├── PixelHill
        │   ├── PixelGrassTuft (.anim-grass-sway)
        │   └── PixelSparkle (.anim-sparkle-cycle)
        ├── Layer 5: Ground Interactive Objects (data-layer="5-objects")
        │   ├── Left Group:
        │   │   ├── Daisy & Grass (hidden < sm)
        │   │   ├── PixelPipe (Left Warp Pipe, 56x50 mobile / 68x58 desktop) (.anim-pipe-highlight)
        │   │   └── Stepped Podium with PixelCoin + PixelQuestionBlock + PixelBug (hidden < sm)
        │   └── Right Group:
        │       ├── Question Block + Coins (hidden < md)
        │       ├── Founder Mascot Poly:
        │       │   └── Founder (src/routes/public/Founder.tsx)
        │       │       ├── Hook: useFirstVisit -> 'enter' | 'idle'
        │       │       ├── Speech Bubbles (.founder-bubble-intro, -join, -admin)
        │       │       └── PixelPoly (src/ui/pixel/PixelPoly.tsx) (.founder-character-container)
        │       ├── CRT Monitor (hidden < lg) (.world-admin-monitor)
        │       ├── Grass tuft (hidden < sm)
        │       ├── PixelPipe (Right Warp Pipe, 56x50 mobile / 68x54 desktop) (.anim-pipe-highlight)
        │       └── Daisy & Grass (hidden < sm)
        └── Layer 6: Ground Brick Tile & Metadata Footer (data-layer="6-ground")
            ├── PixelBrickTile (src/ui/pixel/PixelBrickTile.tsx)
            └── World 01 Copyright Bar
```

---

## 2. Animation Inventory

| Animation / Class | CSS Keyframe Name | Source File & Line | Applied By | Duration / Loop | Layer Type | Notes / Duplication |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `.anim-cloud-drift-far` | `@keyframes cloud-drift` | `index.css:507` | `SkyLayer`, `PixelWorld` | `110s linear infinite` | Layer 1 (Ambient) | Shared keyframe `cloud-drift` (0% to -50% translateX) |
| `.anim-cloud-drift-mid` | `@keyframes cloud-drift` | `index.css:507` | `SkyLayer` | `70s linear infinite` | Layer 1 (Ambient) | Reuses `cloud-drift` keyframe with 70s duration |
| `.anim-cloud-drift-near` | `@keyframes cloud-drift` | `index.css:507` | `PixelWorld` | `45s linear infinite` | Layer 1 (Ambient) | Reuses `cloud-drift` keyframe with 45s duration |
| `.anim-coin-idle` | `@keyframes coin-shimmer` | `index.css:589` | `PixelCoin` (Wordmark, Platforms, World) | `1.4s infinite ease-in-out` | Layer 1 (Ambient) | Subtle 3D coin flip / Y-scale compression |
| `.anim-block-cycle` | `@keyframes block-cycle` | `index.css:771` | `FloatingPlatforms`, `PixelWorld` | `4s steps(1) infinite` | Layer 1 (Ambient) | Questions block color alternation |
| `.anim-pipe-highlight` | `@keyframes pipe-sweep` | `index.css:780` | `PixelPipe` wrapper in `PixelWorld` | `6s ease-in-out infinite` | Layer 1 (Ambient) | Specular sheen swipe across pipe body |
| `.anim-grass-sway` | `@keyframes grass-step` | `index.css:789` | `PixelGrassTuft` in `PixelWorld` | `3s steps(1) infinite` | Layer 1 (Ambient) | 2-step retro grass skew |
| `.anim-sparkle-cycle` | `@keyframes sparkle-cycle` | `index.css:798` | `PixelSparkle` in `PixelWorld` | `2.5s steps(1) infinite` | Layer 1 (Ambient) | 4-step sparkle twinkle |
| `.anim-winged-hover` | `@keyframes winged-hover` | `index.css:825` | Flying Critter in `FloatingPlatforms` | `2s ease-in-out infinite` | Layer 1 (Ambient) | 4px sinusoidal float |
| `.anim-flag-flutter` | `@keyframes flag-flutter` | `index.css:834` | Castle Tower, Admin Card Header | `1.8s steps(3) infinite` | Layer 1 (Ambient) | Stepped flag flutter skew |
| `.anim-founder-idle-bob`| `@keyframes founder-bob` | `index.css:889` | `Founder.tsx` (.founder-motion-track) | `1.2s steps(2) infinite` | Layer 1 (Ambient) | Subtle 1px vertical breathing step |
| `.anim-founder-roam` | `@keyframes founder-ground-roam` | `index.css:956` & `index.css:1136` | `Founder.tsx` (.founder-motion-track) | `24s linear infinite` | Layer 1 (Ambient) | Ground patrol + perched pipe jumps (has desktop & mobile keyframe blocks) |
| `.founder-character-container` | `@keyframes founder-turn-facing` | `index.css:1312` | `Founder.tsx` (container) | `24s steps(1) infinite` | Layer 1 (Ambient) | Syncs sprite scaleX(1) vs scaleX(-1) |
| `.poly-sprite-strip` | `@keyframes founder-legs-patrol` | `index.css:1324` | `PixelPoly.tsx` (when mounted in Founder) | `24s steps(1) infinite` | Layer 1 (Ambient) | Steps through 7-frame sprite strip |
| `.anim-live-dot` | `@keyframes live-dot-pulse` | `index.css:1584` | `LiveIndicator.tsx` | `1.5s ease-in-out infinite` | Layer 1 (Ambient) | Green dot opacity pulsing |
| `.anim-scene-transition`| `@keyframes scene-fade-slide` | `index.css:1771` | `LandingPage.tsx` root div | `0.3s ease-out` | Entrance / Page | One-shot page transition |
| `.anim-entrance-logo` | `@keyframes entrance-drop` | `index.css:648` | `LandingPage.tsx` Wordmark div | `0.6s cubic-bezier(0.22,1,0.36,1)` | Entrance-only | Y: -40px -> 0 drop with slight overshoot |
| `.anim-entrance-word-1` | `@keyframes entrance-word-reveal` | `index.css:667` | "DREAM" span | `0.35s ease-out (delay: 0.15s)` | Entrance-only | Scale/fade word pop |
| `.anim-entrance-word-2` | `@keyframes entrance-word-reveal` | `index.css:667` | "BUILD" span | `0.35s ease-out (delay: 0.3s)` | Entrance-only | Scale/fade word pop |
| `.anim-entrance-word-3` | `@keyframes entrance-word-reveal` | `index.css:667` | "GROW" span | `0.35s ease-out (delay: 0.45s)` | Entrance-only | Scale/fade word pop |
| `.anim-entrance-tagline`| `@keyframes entrance-fade-slide` | `index.css:678` | Tagline Plaque | `0.5s ease-out (delay: 0.35s)` | Entrance-only | Y: 12px -> 0 fade-in |
| `.anim-entrance-ctas` | `@keyframes entrance-fade-slide` | `index.css:678` | Main Portals Grid container | `0.5s ease-out (delay: 0.5s)` | Entrance-only | Y: 16px -> 0 fade-in |
| `.anim-founder-walk-in` | `@keyframes founder-walk-in` | `index.css:880` | `Founder.tsx` (.founder-motion-track) | `1.2s linear forwards` | Entrance-only | Walk-in from stage right to base position |
| `.anim-pop-coins` | `@keyframes pop-coins` | `index.css:633` | `ArcadeLink.tsx` (JOIN CTA) | `0.4s ease-out forwards` | Layer 2 (Interaction) | Two coins pop upward on hover/focus |
| `hover:ring-2` / `focus` | N/A (Tailwind) | `ArcadeLink.tsx:84` | `ArcadeLink.tsx` (ADMIN CTA) | 75ms transition | Layer 2 (Interaction) | Blinking cursor ▮ + green ring |

### Identified Duplications / Observations:
- `.anim-entrance-tagline` and `.anim-entrance-ctas` both call `@keyframes entrance-fade-slide`. They differ only in `animation-delay` (0.35s vs 0.5s) and start translation (12px vs 16px).
- `.anim-entrance-word-1`, `-2`, `-3` all call `@keyframes entrance-word-reveal` with hardcoded inline delay classes.
- Keyframes `cloud-drift` is already shared between far, mid, and near tracks using parameterized durations (110s, 70s, 45s).

---

## 3. Current Entrance Flow (First Visit vs Repeat)

### A. First Visit (`isFirstVisit === true`):
1. **t = 0ms**: Page mounts. `useFirstVisit` initializes `isFirstVisit = true` from `sessionStorage.getItem('startupoly:landing-seen') === null`.
2. **t = 0ms**:
   - Wordmark logo container receives `.anim-entrance-logo` (drops from -40px, 600ms).
   - Founder receives `phase = 'enter'`, applying `.anim-founder-walk-in` (walks in 1.2s).
   - Wordmark subtitle words receive `.anim-entrance-word-1` (delay 150ms), `-2` (delay 300ms), `-3` (delay 450ms).
   - Tagline plaque receives `.anim-entrance-tagline` (delay 350ms, duration 500ms).
   - Portals container receives `.anim-entrance-ctas` (delay 500ms, duration 500ms).
   - `LiveIndicator` mounts immediately with `.anim-live-dot` pulsing (no entrance animation of its own).
3. **t = 1000ms**: Portals container animation finishes (`0.5s delay + 0.5s duration = 1.0s`), triggering `handleEntranceEnd` via `onAnimationEnd` -> calls `markSeen()`.
4. **t = 1200ms**: Fallback timer fires if `onAnimationEnd` never fired (e.g. background tab) -> calls `markSeen()`.
5. **t = 1200ms - 1500ms**: `Founder.tsx` completes its walk-in animation (or safety timer at 1500ms) and switches from `phase = 'enter'` to `phase = 'idle'`, transitioning to `.anim-founder-idle-bob .anim-founder-roam`.

### B. Repeat Visit (`isFirstVisit === false`):
- All `.anim-entrance-*` classes evaluate to empty strings `''`.
- Elements render directly in their final stationary positions with zero delay.
- `Founder.tsx` starts in `phase = 'idle'` immediately without walking in.

---

## 4. Interaction Wiring

### A. Active CTA State:
- `LandingPage` holds `activeCta: 'join' | 'admin' | null`.
- On pointer enter/leave on the Team Phone card or focus/blur on its `ArcadeLink`, `activeCta` is set to `'join'`.
- On pointer enter/leave on the Event Admin card or focus/blur on its `ArcadeLink`, `activeCta` is set to `'admin'`.
- `LandingPage` root element renders `data-cta={activeCta || undefined}`.

### B. CSS Selectors Consuming `data-cta`:
- `[data-cta="join"] .founder-bubble-join`: Displays "Let's go!" speech bubble above Founder.
- `[data-cta="admin"] .founder-bubble-admin`: Displays "Control room" speech bubble above Founder.
- `[data-cta="admin"] .world-admin-monitor`: Highlights the CRT admin monitor in `PixelWorld`.
- When `data-cta` is undefined: Intro speech bubble "Let's build!" is shown during initial entrance/idle.

### C. ArcadeLink Press-Physics:
- **Element**: `<Link>` from `react-router-dom`.
- **Default classes**:
  - `border-4 border-[#102040] shadow-[4px_4px_0px_#102040]`
  - `transition-all duration-75 ease-out`
- **Hover / Focus-visible state**:
  - `hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#102040]`
  - `focus-visible:-translate-y-[2px] focus-visible:shadow-[6px_6px_0px_#102040]`
  - Clear focus ring: `focus-visible:ring-4 focus-visible:ring-[#FFCC00]`
- **Active / Pressed state**:
  - `active:translate-y-[2px] active:shadow-[2px_2px_0px_#102040]`
- **Join Micro-reaction**:
  - Spawns 2 `.anim-pop-coins` (`-top-3 left-1/2`) when hovered or focused.
- **Admin Micro-reaction**:
  - Spawns blinking cursor `▮` (`.animate-pulse`) when hovered or focused.
- **Reduced Motion Handling**:
  - `motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:transform-none motion-reduce:active:transform-none`

---

## 5. Mobile Behavior Today

### A. Viewport Layout (360×640 & 390×844):
- The landing page is a **single-screen viewport experience** (`min-h-screen flex flex-col justify-between overflow-x-hidden`).
- There are **no scrollable content sections below the fold**.
- All interactive content (Wordmark, Tagline, LIVE indicator, Team Phone card, Admin Console card, and ground world with roaming Poly mascot) fits comfortably in the viewport without page scroll.

### B. Responsive Visibility Map:

| Element / Component | Mobile (< 640px) | Tablet (640px - 1023px) | Desktop (≥ 1024px) |
| :--- | :--- | :--- | :--- |
| **Upper Sky Clouds** (`SkyLayer`) | Visible (H: 192px) | Visible (H: 240px) | Visible (H: 288px) |
| **Distant Castle Silhouette** (`DistantHillsAndCastle`) | **Hidden** (`hidden sm:block`) | Visible | Visible |
| **Floating Platforms** (`FloatingPlatforms`) | **Hidden** (`hidden sm:block`) | Visible | Visible |
| **Signboard Timber/Stone Posts** (`LandingPage`) | **Hidden** (`hidden sm:flex`) | Visible | Visible |
| **Castle Battlements on Admin Card** (`LandingPage`) | **Hidden** (`hidden sm:flex`) | Visible | Visible |
| **Grounded Stage Platform under cards** (`LandingPage`)| **Hidden** (`hidden sm:flex`) | Visible | Visible |
| **Portals Grid Layout** | 1 Column (`grid-cols-1`) | 2 Columns (`grid-cols-[1.15fr_0.85fr]`) | 2 Columns |
| **Ground Foliage Decor** (`PixelWorld`) | Grass tufts hidden | Grass tufts hidden | Visible (`hidden lg:block`) |
| **Left Stepped Podium & Bug** (`PixelWorld`) | **Hidden** (`hidden sm:flex`) | Visible | Visible |
| **Left Warp Pipe** (`PixelWorld`) | Visible (`56x50`) | Visible (`68x58`) | Visible (`68x58`) |
| **Right Question Block + Coins** (`PixelWorld`) | **Hidden** (`hidden md:flex`) | **Hidden** (`hidden md:flex`) | Visible (`md:flex`) |
| **Right Warp Pipe** (`PixelWorld`) | Visible (`56x50`) | Visible (`68x54`) | Visible (`68x54`) |
| **Right CRT Monitor** (`PixelWorld`) | **Hidden** (`hidden lg:block`) | **Hidden** (`hidden lg:block`) | Visible (`hidden lg:block`) |
| **Right Daisy & Grass** (`PixelWorld`) | **Hidden** (`hidden sm:flex`) | Visible | Visible |
| **Founder Mascot Poly** (`Founder`) | Visible (scale-90, perched pipe jumps) | Visible (scale-100) | Visible (scale-100) |
| **Ground Brick & Copyright Bar** (`PixelWorld`) | Visible | Visible | Visible |

---

## 6. Performance Baseline

- **Build Status**: `npm run build` succeeds in 5.13s.
- **Bundle Sizes**:
  - CSS Bundle: `dist/assets/index-CQNNi80T.css` = 97.87 kB (gzip: 17.27 kB)
  - Core App JS: `dist/assets/index-1hZYjl-A.js` = 282.63 kB (gzip: 81.85 kB)
  - UI Library JS: `dist/assets/ui-Bqkfww86.js` = 372.05 kB (gzip: 92.13 kB)
- **Timers in Landing Components**:
  - `setInterval`: **0 instances** in `src/routes/public/**`.
  - `requestAnimationFrame`: **0 instances** in `src/routes/public/**`. (`usePointerParallax.ts` uses rAF on fine-pointer mousemove only, fully bypassed on touch).
- **Reduced Motion Coverage**:
  - Lines 1788–1825 in `src/index.css` enforce:
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation: none !important;
        transition-duration: 0.01ms !important;
      }
    }
    ```
    This provides comprehensive universal suppression of all `@keyframes` across the app.
- **Tab Inactive Pausing**:
  - Lines 1575–1577 in `src/index.css` enforce:
    ```css
    [data-paused="true"] * {
      animation-play-state: paused !important;
    }
    ```
    Synchronized with `document.hidden` via `usePageVisibility()`.

---

## 7. Zone Map

| Zone Name | Layer & Purpose | Implemented By Component(s) | Current Visual Behavior |
| :--- | :--- | :--- | :--- |
| **Sky / Ambient** | Layer 1 (Continuous) | `SkyLayer.tsx`, `DistantHillsAndCastle.tsx`, `FloatingPlatforms.tsx` | High and mid clouds drift (110s, 70s); distant hills stationary; floating islands with idle coins & critter. |
| **Hero / Boot** | Entrance & Identity | `LandingPage.tsx` `<header>`, `LiveIndicator.tsx`, `PixelCoin.tsx` | Logo drops from top; DREAM-BUILD-GROW reveals; LiveIndicator pulses; Tagline slides in. |
| **Portals** | Entrance & Navigation | `LandingPage.tsx` `<main>`: Team Phone Card, Event Admin Card, Stage Platform | Wooden & Metal cards slide/fade into view; interactive links to `/join` and `/admin`. |
| **Ground World** | Layer 1 (Continuous) | `PixelWorld.tsx`, `Founder.tsx`, `PixelPoly.tsx`, `PixelPipe.tsx` | Continuous world scene: green warp pipes, brick ground, roaming mascot leaping onto pipes. |
| **Interaction Surface** | Layer 2 (Tactile Feedback) | `ArcadeLink.tsx`, buttons, touch targets | Chunky 3D button press physics, coin hover pop on JOIN, blinking cursor on ADMIN. |

---

## 8. Dead Code Candidates (Not removed in Phase 0)

1. **`src/ui/pixel/PixelLogo.tsx`**: Contains an unused SVG startup logo; landing page uses inline `<h1>STARTUPOLY</h1>` typography with dual `PixelCoin` elements. Zero imports outside of `src/ui/pixel/index.ts`.
2. **`src/routes/public/LandingHud.tsx`**: Compact match facts strip (`TIME`, `TEAMS`, `START CASH`, `BUSINESSES`). Rendered in `LandingHud.test.tsx` but currently unmounted from `LandingPage.tsx`. (May be incorporated into Phase 3).
3. **`src/ui/pixel/RetroPlatformerCharacters.tsx`**: Referenced in prompt context, but does not exist in `src/`. Zero references.
