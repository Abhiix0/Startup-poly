# STARTUPOLY Scoreboard

> **Rebuild in progress — see docs/BLUEPRINT.md if present**

STARTUPOLY is a physical startup board game played live (one board, 5–6 teams, 50-minute match). This application is the **live digital scoreboard and game management system** used during the event, not the game itself.

---

## 👥 User Roles

1. **Event Admin (Laptop)**: Authenticated dashboard used by Tech Runners / Game Master to configure teams, track the server-authoritative 50:00 timer, record cash and Company Value (CV) transactions, manage businesses and upgrades, and inspect the immutable activity log.
2. **Teams (Mobile Phone)**: One anonymous mobile browser per team (PIN-gated). Strictly read-only display showing only the team's own cash, Company Value, owned businesses with levels, and the match countdown.

---

## 🛠️ Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🚀 Available Scripts

- `npm run dev`: Start local Vite development server
- `npm run build`: Typecheck and produce production bundle
- `npm run preview`: Preview production build locally
- `npm run typecheck`: Run TypeScript compiler check without emitting files
- `npm test`: Run tests via Vitest
- `npm run test:legacy`: Run legacy game engine test script

