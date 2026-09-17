# STARTUPOLY — The Equinox E-Summit 2K26 Digital Control Console

> **THE EQUINOX E-SUMMIT 2K26** · Live Physical Startup Simulation Console

STARTUPOLY is a live physical startup simulation played outdoors on a giant physical board. Every team uses their own mobile phone (~390px mobile-first interface), while the Game Master controls the match from an interactive Admin Dashboard.

---

## 🎨 Equinox Visual Identity System

- **Dark Surfaces**: `#2A2A2A` base, `#181818` deep background, `#222222` elevated cards.
- **Primary Blue**: `#7484FE` (team identity, active turn banners, company value metrics).
- **Signal Green**: `#33FF67` (cash gains, confirmed actions, verified live states).
- **Off-White**: `#F7F2F6` (high-contrast outdoor sunlight typography).
- **Design Benchmark**: iOS Control Center, Apple Wallet, Linear, Arc, modern fintech dashboards with 16–20px rounded cards and generous tap targets (≥44px).

---

## 📱 User Experiences

### 1. Player Experience (Mobile-First ~390px)
- **Zero Configuration**: Join via Match Code (e.g. `EQX-4821`) and 4-digit Team PIN.
- **Strict Privacy**: Players see **only their own team's financial metrics** (Cash, Company Value, Portfolio, Private Activity Log, Board space). Competitor balances are strictly hidden.
- **Instant Glanceability**: Answers "How much cash do we have?", "What is our Company Value?", "Whose turn is it?", and "What just happened?" within 2 seconds without horizontal scrolling.
- **Sticky Bottom Navigation**:
  - `HOME`: Hero metrics, live turn indicator, compact timer, latest transaction.
  - `PORTFOLIO`: Stacked luxury venture cards with upgrade progression and rent yields.
  - `ACTIVITY`: Private chronological transaction feed.
  - `RULES`: Interactive offline/online rulebook, card database, and rent calculator.
- **Emergency Overlays**: Automatic Forced Sale liquidation and Bankruptcy screens.

### 2. Admin / Game Master Experience (Desktop & Mobile Cockpit)
- **Physical Dice Roll Controller**: One-tap `[1]` to `[6]` roll entry.
- **Contextual Resolution**: Automatically calculates and triggers the exact transaction for the landed space (Unowned Acquisition, Upgrades, Rent calculation, Bonus/Crisis cards, Pitch challenges, Forced Sales).
- **Extra Roll on 6 & Three 6s Rollback**: Automatic rollback of turn snapshot upon rolling three consecutive 6s.
- **1-Click Transactional Undo**: Instant rollback of any action using immutable transaction snapshots.
- **Teams Grid & Quick Control Sheet**: Granular manual +/- adjustments, turn skips, and business reassignments.
- **24-Space Board Track**: Real-time visual tracking of physical token coordinates.
- **Rule Configuration Guard**: Business economics database protected by a deliberate "Unlock Rules" safety toggle.
- **50:00 Server-Authoritative Clock**: Warning states at 05:00 and 01:00, freezing gameplay state at 00:00.
- **Tie-Breaker Rankings & Match Archive**: Automated leaderboard sorting (CV → Cash → Businesses → Pitch).

---

## 🚀 Quick Start

### Development Server
```bash
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

### Run Automated Game Engine Test Suite
```bash
npx tsx test/gameEngine.test.ts
```

---

## 🕹️ Match Simulation Arena
Click **"Arena"** or **"Launch Multi-View Arena"** on the landing page to open the integrated multi-device testing simulator. This displays the **Game Master Cockpit** side-by-side with two live **390px Mobile Player Devices** for complete end-to-end match testing in real time.
