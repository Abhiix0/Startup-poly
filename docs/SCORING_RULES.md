# Scoring and Ranking Rules

Single reference for how a match is ranked (owner decision D1, with the Debt Recovery rules of the player handbook).

## Sources

| Source | Where |
|--------|-------|
| Public player handbook | `src/routes/public/RulesPage.tsx` and `src/routes/public/rules/GameRulesModal.tsx` |
| Operator runbook | `docs/RUNBOOK.md`, Step 9 (Ranking and Ties) |
| Implementation | `public.room_standings` (latest definition: `supabase/migrations/0031_debt_recovery.sql`), `admin_finalize` (0031) |

## Rules

Teams are ranked by, in order:

1. **Highest remaining Cash.**
2. **Highest total original purchase cost** of the businesses the team still owns.
3. **Highest total number of upgrades** across owned businesses.
4. Teams equal on all three **share a rank**.

Company Value no longer exists: it is not used for ranking, tie-breaks or anything else. No judged pitch or Game Master order decides ranks.

**Ineligible teams.** A team that is eliminated (bankrupt flag) or still in debt at the end ranks below every eligible team and can never be the winner. Such a team is stored in `final_results` with `is_bankrupt = true` (it scores nothing). Debt-first rules: any incoming cash (START, rent, cards, sale proceeds) clears debt before it becomes cash.

**Winner.** The winner is the eligible team at rank 1. If two or more eligible teams share rank 1 there is no single winner and `rooms.winner_team_id` stays NULL. It is also NULL when every team is ineligible.

## Implementation

`room_standings` orders by `(is_bankrupt OR debt > 0) ASC, cash DESC, business_cost DESC, upgrade_count DESC` using `rank()`, so equal teams get the same rank and the next rank skips (1, 2, 2, 4). `slot` only keeps the row order stable.

## Open points

- The rulebook says nothing about how two ineligible teams rank against each other; they use the same criteria (their cash is 0 while in debt).
- Teams sharing rank 1 produce no winner name in the history list; a prize decision between them is left to the Game Master.

## Tests

`supabase/tests/0012_final_integrity_test.sql` (cash, purchase cost, upgrades, shared rank, bankrupt-last, all-bankrupt), `0014_standings_ranking_test.sql`, `0018_no_company_value_test.sql` (shared first place finalizes with no winner) and `0020_debt_recovery_test.sql` (a team in debt ranks last and cannot win).
