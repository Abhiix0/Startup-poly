# Scoring and Tiebreak Rules

Single reference for how a match is ranked. Sources are quoted so a change to either can be diffed here.

## Sources

| Source | Where |
|--------|-------|
| Public rules page | `src/routes/public/RulesSection.tsx` (`victory-tiebreak`, `forced-sale-bankrupt`) |
| Operator runbook | `docs/RUNBOOK.md`, Step 9 (Tie-Break Entry) and the Tie-Break Hierarchy line |
| Implementation | `public.room_standings` in `supabase/migrations/0010_standings_finalize.sql`, finalize in `0021_final_snapshot.sql` |

## Rules as written

**Winner (RulesSection.tsx, `victory-tiebreak`):** "Match Finalization (at 00:00): All dice movement stops immediately. The team with the Highest Company Value (CV) is crowned Champion."

**Tiebreaker hierarchy (RulesSection.tsx):** "If two or more teams finish tied on Company Value:
- Tiebreaker 1: Highest Cash balance.
- Tiebreaker 2: Most Businesses Held in portfolio.
- Tiebreaker 3: 30-Second Physical Pitch judged live by the Game Master."

**Runbook (Step 9):** "1. Highest Company Value (CV). 2. If CV is equal: Highest Cash. 3. If Cash is equal: Most Businesses Held. 4. If still tied: 30-Second Pitch judged by Game Master. ... Enter the Game Master's judged ranking order. Click SAVE TIE-BREAK ORDER."

**Bankruptcy (RulesSection.tsx, `forced-sale-bankrupt`):** "If a team has 0 cash, has liquidated all 3 businesses, and still has unpaid debt: The team is declared BANKRUPT and eliminated from the tournament."

## Implementation

`room_standings` orders by, in this sequence:

1. not bankrupt first (`is_bankrupt ASC`): an eliminated team ranks below every active team and can never be the winner
2. `cv DESC`
3. `cash DESC`
4. `business_count DESC`
5. `tiebreak_order ASC` (the Game Master's judged order, NULLs last)
6. `slot ASC` (only to keep the row order stable; never decides a tie)

`tie_unresolved` is true for a group of teams that share bankruptcy flag, CV, cash and business count unless **every** team in the group has a `tiebreak_order` and the orders are all different. `admin_finalize` refuses with `UNRESOLVED_TIE` while any team is unresolved, so a result is never decided by slot number.

The winner is rank 1 among non-bankrupt teams; it is NULL when every team is bankrupt.

## Behaviours worth knowing

- Tied **bankrupt** teams are also "unresolved", so finalize asks for a tiebreak order for them even though they cannot win. This is existing behaviour and is covered by a test; whether eliminated teams should be exempt is an owner decision.
- The rulebook says nothing about how two eliminated teams rank against each other, so the same CV, cash, business count, then judged order is used.

## Tests

`supabase/tests/0012_final_integrity_test.sql` has one assertion per rule above: CV order, cash tiebreak, business-count tiebreak, three-way tie, partial order, duplicate orders, resolved order, bankrupt-last, all-bankrupt.
