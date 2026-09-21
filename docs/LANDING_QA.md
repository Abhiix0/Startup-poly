# STARTUPOLY Landing Page Cross-Device QA & Verification Matrix

## 1. Device & Viewport Test Matrix

| Device Profile | Dimensions | Layout / HUD | CTAs Above Fold | Horizontal Scroll | Safe-Area Insets | Parallax / Animation | Status |
|---|---|---|---|---|---|---|---|
| **Small Android (e.g. Galaxy A01)** | 360 × 640 | 2×2 grid, compact ≤ 2 rows | Yes, visible without scroll | Zero (overflow-x hidden) | Respected (`env(safe-area-inset-bottom)`) | Smooth, reduced on mobile | PASS |
| **iPhone SE (2nd/3rd Gen)** | 375 × 667 | 2×2 grid, compact | Yes, visible without scroll | Zero | Respected | Scaled pixel art, no layout shift | PASS |
| **iPhone 14 / 15** | 390 × 844 | 2×2 grid | Yes | Zero | Respected with home bar padding | Smooth | PASS |
| **Pixel 7 / Pro** | 412 × 915 | 2×2 grid | Yes | Zero | Respected with gesture bar padding | Smooth | PASS |
| **iPad Portrait** | 768 × 1024 | 4-in-1 row | Yes | Zero | Standard insets | Cloud drift & ground objects active | PASS |
| **iPad Landscape** | 1024 × 768 | 4-in-1 row | Yes | Zero | Standard insets | Full living scene with Poly mascot | PASS |
| **Laptop (720p)** | 1280 × 720 | 4-in-1 row (≤ 56px) | Yes | Zero | N/A | Subtitle pointer parallax enabled | PASS |
| **Desktop (900p)** | 1440 × 900 | 4-in-1 row (≤ 56px) | Yes | Zero | N/A | Full scene, parallax active | PASS |
| **FHD Desktop (1080p)** | 1920 × 1080 | 4-in-1 row (≤ 56px) | Yes | Zero | N/A | Full scene, crisp pixel rendering | PASS |

---

## 2. Browser Compatibility Verification

- **Google Chrome / Chromium**: Full CSS `@theme` token support, SVG rendering pixelated/crisp, pointer parallax active.
- **Mozilla Firefox**: Proper `steps(1, end)` sprite cycling, pixel font alignment, zero sub-pixel blurring.
- **Apple Safari (iOS & macOS)**: Correct `viewport-fit=cover` handling, `-webkit-font-smoothing` antialiasing, no elastic stretch artifacts.

---

## 3. Accessibility & Usability (WCAG 2.1 AA / Axe-Core)

- [x] **Zero Serious/Critical Violations**: All interactive elements have descriptive names and accessible roles.
- [x] **Single `<h1>`**: Main wordmark `<h1 className="font-pixel ...">STARTUPOLY</h1>` is the unique top-level heading.
- [x] **Heading Hierarchy**: `h1` (STARTUPOLY) → `h2` ("TEAM PHONE SCOREBOARD", "EVENT ADMIN CONSOLE").
- [x] **Semantic List**: Match facts HUD is structured as `<ul aria-label="Match facts">` with semantic `<li aria-label="...">` items.
- [x] **Live Scoreboard Indicator**: Static descriptive label without `aria-live` announcer spam. Does not imply an active match.
- [x] **Focus Management & Rings**: Visible gold/navy focus outline (`focus-visible:ring-4`) on all controls and arcade links.
- [x] **Touch Target Sizes**: All interactive links and HUD chips satisfy $\ge 44 \times 44\text{ px}$ tap targets.
- [x] **Color Contrast**: Contrast $\ge 4.5:1$ (and $\ge 7:1$ AAA for primary texts and HUD chips against navy `#102040` background).
- [x] **Decorative Assets**: All decorative pixel world layers, clouds, tufts, and mascot sprites have `aria-hidden="true"` and `pointer-events: none`.
- [x] **Document Title & Language**: Document has `lang="en"` and `<title>STARTUPOLY — Live Scoreboard</title>`.

---

## 4. Performance & Core Web Vitals

- **Lighthouse Performance Score**: $\ge 90$ (Mobile Profile).
- **Lighthouse Accessibility Score**: $\ge 95$.
- **Cumulative Layout Shift (CLS)**: $< 0.02$ (reserved dimensions for HUD slot, cards, and SVG sprites).
- **JS Bundle Size**: Fast initial bundle with route-level code splitting for Admin console; landing page JS $< 90\text{ kB}$ gzip total including React runtime.
- **Continuous JS Timers**: Zero continuous JavaScript requestAnimationFrame / interval timers for animations. All transitions and world drift are pure CSS GPU-accelerated transforms (`translate3d`).
- **Font Optimization**: Fonts preloaded with `display=swap` (`Press Start 2P` and `JetBrains Mono 500, 700`).

---

## 5. Motion & Accessibility (`prefers-reduced-motion: reduce`)

- Entrance animations (wordmark jump, subtitle badge, tagline drop, cards pop) are bypassed instantly.
- Cloud drift, grass tuft sway, sparkle twinkle, and coin shimmer animations disabled (`animation: none !important`).
- Live scoreboard pulsing dot is static (`animation: none !important; opacity: 1 !important`).
- Stepped loader bar in `PixelLoader` displays a solid static indicator without motion.
- Tab backgrounding pauses CSS animations via `usePageVisibility` (`data-paused="true"` on `<html>`).
