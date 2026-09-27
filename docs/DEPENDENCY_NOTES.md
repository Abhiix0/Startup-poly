# Dependency Version Notes (Phase 1 Audit)

This document tracks suspicious or implausible package version declarations identified in `package.json` during the Phase 1 dead-code and dependency cleanup. These pins are recorded for thorough investigation and resolution in **Phase 4 (Security & Config Hardening / Dependency Version Audit)**.

---

## 1. Removed Dead Dependencies (Phase 1)
- **`lucide-react`**: Was declared as `^1.46.0` (lucide-react only ships `0.x` releases). Confirmed 0 usages across `src/`. Removed in Phase 1.
- **`tailwind-merge`**: Was declared as `^3.7.0` (tailwind-merge 3.x is not a standard release). Confirmed 0 usages across `src/`. Removed in Phase 1.
- **`clsx`**: Was declared as `^2.1.1`. Confirmed 0 usages across `src/`. Removed in Phase 1.

---

## 2. Suspicious Version Pins to Investigate in Phase 4

| Package | Declared Version | Known Stable Line | Notes |
|---|---|---|---|
| `typescript` | `^7.0.2` | `5.7.x / 5.8.x` | TypeScript official releases are on `5.x`. `7.0.2` does not exist on npm registry. |
| `@types/node` | `^26.6.2` | `20.x / 22.x` | Node LTS is 20/22. `@types/node` 26.x is ahead of current Node release line. |
| `vite` | `^8.3.0` | `6.x` | Vite official major version is 6.x. Version `8.3.0` appears ahead of official line. |
| `@vitejs/plugin-react` | `^6.1.1` | `4.x` | Vite React plugin major version is 4.x. |
| `@supabase/supabase-js` | `^2.116.0` | `2.48.x / 2.49.x` | Version `2.116.0` appears ahead of known npm release line for supabase-js. |
| `tailwindcss` | `^4.3.3` | `4.0.x` | Tailwind v4 was launched at 4.0; investigate exact available releases. |

*Phase 4 will audit each against the active npm registry and safely normalize versions without breaking the build.*
