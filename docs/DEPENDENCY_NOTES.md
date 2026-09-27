# Dependency Version Notes (Phase 1 Audit)

This document tracks suspicious or implausible package version declarations identified in `package.json` during the Phase 1 dead-code and dependency cleanup. These pins are recorded for thorough investigation and resolution in **Phase 4 (Security & Config Hardening / Dependency Version Audit)**.

---

## 1. Removed Dead Dependencies (Phase 1)
- **`lucide-react`**: Was declared as `^1.46.0` (lucide-react only ships `0.x` releases). Confirmed 0 usages across `src/`. Removed in Phase 1.
- **`tailwind-merge`**: Was declared as `^3.7.0` (tailwind-merge 3.x is not a standard release). Confirmed 0 usages across `src/`. Removed in Phase 1.
- **`clsx`**: Was declared as `^2.1.1`. Confirmed 0 usages across `src/`. Removed in Phase 1.

---

## 2. Investigated Version Pins (Phase 4 Resolution)

| Package | Declared Version | Installed in node_modules | Resolution & Notes |
|---|---|---|---|
| `typescript` | `^7.0.2` | `7.0.2` | **Preserved**. Confirmed installed and active in `node_modules` and `package-lock.json`. Typechecking succeeds without errors. |
| `@types/node` | `^26.6.2` | `26.6.2` | **Preserved**. Typings match installed project environment and tsconfig. |
| `vite` | `^8.3.0` | `8.3.0` | **Preserved**. Rolldown-backed Vite release present in `node_modules`. Builds cleanly in < 1 second. |
| `@vitejs/plugin-react` | `^6.1.1` | `6.1.1` | **Preserved**. Compatible with Vite 8 and React 19.3.0. |
| `@supabase/supabase-js` | `^2.116.0` | `2.116.0` | **Preserved**. Active package installed and communicating properly with database/realtime client. |
| `tailwindcss` | `^4.3.3` | `4.3.3` | **Preserved**. Tailwind CSS v4 pipeline working seamlessly with `@tailwindcss/postcss`. |

---

## 3. Pruned Unused Dependencies (Phase 4)
- **`autoprefixer`**: Was declared as `^10.6.1`. In Tailwind CSS v4, `@tailwindcss/postcss` handles vendor prefixing natively. Verified `postcss.config.js` does not reference autoprefixer and no build/runtime dependency exists. Removed from `package.json` and pruned 10 packages from `package-lock.json`.

---

## 4. Content Security Policy Hardening (Phase 4)
- `vercel.json` `connect-src` previously contained `http://127.0.0.1:*`, `ws://127.0.0.1:*`, `http://localhost:*`, `ws://localhost:*`.
- Removed all loopback and local development origins from `connect-src`.
- Production CSP `connect-src` is now strictly: `'self' https://*.supabase.co wss://*.supabase.co`.
- Verified that local development via `vite` dev server is unaffected, as Vercel platform headers are only enforced on deployed Vercel environments.

