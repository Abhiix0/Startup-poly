-- Migration 0023: Total Company Value Ranking Reconciliation
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- Official Notion Rulebook (Sections 3 & 12):
-- Total Company Value = Cash + Company Value.
-- The active team with the highest Total Company Value wins.
-- Tiebreakers:
-- 1. Highest Cash
-- 2. Most Businesses Held
-- 3. Judged 30-Second Physical Pitch

CREATE OR REPLACE FUNCTION public.room_standings(p_room_id uuid)
RETURNS TABLE (
  team_id uuid,
  slot smallint,
  name text,
  rank int,
  is_bankrupt boolean,
  cv int,
  cash int,
  business_count int,
  tiebreak_order smallint,
  tie_unresolved boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH team_biz AS (
    SELECT t.id AS tid, count(tb.id)::int AS b_count
    FROM public.teams t
    LEFT JOIN public.team_businesses tb ON t.id = tb.team_id
    WHERE t.room_id = p_room_id
    GROUP BY t.id
  ),
  base AS (
    SELECT
      t.id AS tid,
      t.slot,
      t.name,
      t.is_bankrupt,
      t.cv,
      t.cash,
      tbz.b_count AS business_count,
      t.tiebreak_order,
      count(*) OVER (PARTITION BY t.is_bankrupt, (t.cv + t.cash), t.cash, tbz.b_count) AS tie_group_size,
      count(t.tiebreak_order) OVER (PARTITION BY t.is_bankrupt, (t.cv + t.cash), t.cash, tbz.b_count) AS count_with_order
    FROM public.teams t
    JOIN team_biz tbz ON t.id = tbz.tid
    WHERE t.room_id = p_room_id
  ),
  tie_distinct AS (
    SELECT
      b.is_bankrupt AS td_bankrupt,
      (b.cv + b.cash) AS td_total_val,
      b.cash        AS td_cash,
      b.business_count AS td_biz,
      count(DISTINCT b.tiebreak_order) AS distinct_orders
    FROM base b
    GROUP BY b.is_bankrupt, (b.cv + b.cash), b.cash, b.business_count
  )
  SELECT
    b.tid AS team_id,
    b.slot,
    b.name,
    row_number() OVER (
      ORDER BY
        b.is_bankrupt ASC,
        (b.cv + b.cash) DESC,
        b.cash DESC,
        b.business_count DESC,
        b.tiebreak_order ASC NULLS LAST,
        b.slot ASC
    )::int AS rank,
    b.is_bankrupt,
    b.cv,
    b.cash,
    b.business_count,
    b.tiebreak_order,
    (b.tie_group_size > 1 AND (b.count_with_order < b.tie_group_size OR td.distinct_orders < b.tie_group_size)) AS tie_unresolved
  FROM base b
  JOIN tie_distinct td
    ON b.is_bankrupt = td.td_bankrupt
   AND (b.cv + b.cash) = td.td_total_val
   AND b.cash = td.td_cash
   AND b.business_count = td.td_biz
  ORDER BY rank ASC;
END;
$$;
