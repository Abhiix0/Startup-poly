-- Migration 0019: Join and PIN abuse resistance
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- WHY THE RETURN VALUE CHANGED
-- Through 0018 join_team INSERTed a failed attempt and then RAISEd. A RAISE aborts the transaction, so the
-- INSERT was rolled back: no failure was ever recorded and the throttle never fired (audit finding N1).
-- Failures of kind BAD_CODE_OR_PIN / TEAM_ALREADY_CLAIMED now COMMIT the attempt row and RETURN
--   {"error": "<CODE>"}
-- instead of raising. The client (rpcJoinTeam) turns that payload into the same AppError code, so error
-- codes are unchanged for users. TOO_MANY_ATTEMPTS and NOT_AUTHENTICATED still RAISE (nothing to record).
--
-- THROTTLE (failures in the last 60 s; successes never count)
--   per user : 5   (unchanged)
--   per team : 10  - once tripped, TOO_MANY_ATTEMPTS is returned whatever PIN is sent, so the lockout is no oracle
--   per room : 30
--   unknown room codes, all callers: 60 (hashed bucket; blocks code enumeration)
-- Sizing: six phones that each mistype up to 4 times produce at most 24 failures per room and 4 per team per
-- minute, under every limit. A 4-digit PIN (10,000 values) at 10 guesses/min/team would take ~16 h to
-- exhaust, whatever number of anonymous sessions the attacker mints. Residual risk: someone holding a room
-- code can lock joins for that room for 60 s at a time; organisers can use admin release / wait.
--
-- Lock order (docs/OPERATIONS.md): room (FOR SHARE here, joins only read it) then team (FOR UPDATE).
-- Joins to a TIME_EXPIRED room are still allowed: the dashboard shows the game-over view to a late
-- reconnect, so behaviour is unchanged. Open owner question: whether a first-time claim should be refused.
--
-- PINs stay plaintext in team_secrets on purpose: organisers must read them out. See docs/OPERATIONS.md.

ALTER TABLE public.join_attempts
  ADD COLUMN IF NOT EXISTS room_id uuid,
  ADD COLUMN IF NOT EXISTS code_hash text;

CREATE INDEX IF NOT EXISTS idx_join_attempts_team_time ON public.join_attempts (team_id, attempted_at);
CREATE INDEX IF NOT EXISTS idx_join_attempts_user_time ON public.join_attempts (user_id, attempted_at);
CREATE INDEX IF NOT EXISTS idx_join_attempts_room_time ON public.join_attempts (room_id, attempted_at) WHERE success = false;
CREATE INDEX IF NOT EXISTS idx_join_attempts_unknown_code ON public.join_attempts (attempted_at) WHERE success = false AND room_id IS NULL;

CREATE OR REPLACE FUNCTION public.join_team(
  code text,
  slot int,
  pin text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_code text := upper(trim(coalesce(code, '')));
  v_pin text := trim(coalesce(pin, ''));
  v_now timestamptz := public.app_now();
  v_window timestamptz := public.app_now() - interval '60 seconds';
  v_room_id uuid;
  v_team_id uuid;
  v_name text;
  v_real_pin text;
  v_first_claim boolean;
BEGIN
  IF v_user_id IS NULL THEN
    PERFORM public.raise_error('NOT_AUTHENTICATED');
  END IF;

  -- Opportunistic retention: bounded so a join never pays for a big cleanup.
  DELETE FROM public.join_attempts
  WHERE id IN (SELECT id FROM public.join_attempts WHERE attempted_at < v_now - interval '1 hour' LIMIT 100);

  IF (SELECT count(*) FROM public.join_attempts WHERE user_id = v_user_id AND success = false AND attempted_at >= v_window) >= 5 THEN
    PERFORM public.raise_error('TOO_MANY_ATTEMPTS', jsonb_build_object('retry_after_seconds', 60));
  END IF;

  SELECT id INTO v_room_id
  FROM public.rooms
  WHERE public.rooms.code = v_code
    AND status IN ('LOBBY', 'ACTIVE', 'TIME_EXPIRED');

  IF NOT FOUND THEN
    IF (SELECT count(*) FROM public.join_attempts WHERE success = false AND room_id IS NULL AND attempted_at >= v_window) >= 60 THEN
      PERFORM public.raise_error('TOO_MANY_ATTEMPTS', jsonb_build_object('retry_after_seconds', 60));
    END IF;
    INSERT INTO public.join_attempts (user_id, team_id, room_id, code_hash, success, attempted_at)
    VALUES (v_user_id, NULL, NULL, encode(sha256(convert_to(v_code, 'UTF8')), 'hex'), false, v_now);
    RETURN jsonb_build_object('error', 'BAD_CODE_OR_PIN');
  END IF;

  -- Room first (shared), then team: same direction as every writer.
  PERFORM 1 FROM public.rooms WHERE id = v_room_id FOR SHARE;

  IF (SELECT count(*) FROM public.join_attempts WHERE room_id = v_room_id AND success = false AND attempted_at >= v_window) >= 30 THEN
    PERFORM public.raise_error('TOO_MANY_ATTEMPTS', jsonb_build_object('retry_after_seconds', 60));
  END IF;

  SELECT id, name INTO v_team_id, v_name
  FROM public.teams
  WHERE room_id = v_room_id AND teams.slot = join_team.slot;

  IF NOT FOUND THEN
    INSERT INTO public.join_attempts (user_id, team_id, room_id, success, attempted_at)
    VALUES (v_user_id, NULL, v_room_id, false, v_now);
    RETURN jsonb_build_object('error', 'BAD_CODE_OR_PIN');
  END IF;

  IF (SELECT count(*) FROM public.join_attempts WHERE team_id = v_team_id AND success = false AND attempted_at >= v_window) >= 10 THEN
    PERFORM public.raise_error('TOO_MANY_ATTEMPTS', jsonb_build_object('retry_after_seconds', 60));
  END IF;

  PERFORM 1 FROM public.teams WHERE id = v_team_id FOR UPDATE;

  SELECT join_pin INTO v_real_pin FROM public.team_secrets WHERE team_id = v_team_id;

  IF v_real_pin IS DISTINCT FROM v_pin THEN
    INSERT INTO public.join_attempts (user_id, team_id, room_id, success, attempted_at)
    VALUES (v_user_id, v_team_id, v_room_id, false, v_now);
    RETURN jsonb_build_object('error', 'BAD_CODE_OR_PIN');
  END IF;

  -- The PIN proves the invitation, but must not let a second phone take over a connected slot.
  IF EXISTS (SELECT 1 FROM public.team_claims WHERE team_id = v_team_id AND user_id <> v_user_id) THEN
    INSERT INTO public.join_attempts (user_id, team_id, room_id, success, attempted_at)
    VALUES (v_user_id, v_team_id, v_room_id, false, v_now);
    RETURN jsonb_build_object('error', 'TEAM_ALREADY_CLAIMED');
  END IF;

  v_first_claim := NOT EXISTS (SELECT 1 FROM public.team_claims WHERE team_id = v_team_id);

  BEGIN
    INSERT INTO public.team_claims (user_id, team_id, claimed_at)
    VALUES (v_user_id, v_team_id, v_now)
    ON CONFLICT (user_id, team_id) DO NOTHING;
  EXCEPTION WHEN unique_violation THEN
    -- Defense in depth: the team lock above already serialises claims.
    INSERT INTO public.join_attempts (user_id, team_id, room_id, success, attempted_at)
    VALUES (v_user_id, v_team_id, v_room_id, false, v_now);
    RETURN jsonb_build_object('error', 'TEAM_ALREADY_CLAIMED');
  END;

  INSERT INTO public.join_attempts (user_id, team_id, room_id, success, attempted_at)
  VALUES (v_user_id, v_team_id, v_room_id, true, v_now);

  IF v_first_claim THEN
    INSERT INTO public.activity_events (
      room_id, team_id, type, new, actor_id, created_at
    ) VALUES (
      v_room_id, v_team_id, 'TEAM_CLAIMED',
      jsonb_build_object('slot', slot, 'name', v_name),
      v_user_id, v_now
    );
  END IF;

  RETURN jsonb_build_object('team_id', v_team_id, 'room_id', v_room_id);
END;
$$;

REVOKE ALL ON FUNCTION public.join_team(text, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_team(text, int, text) TO anon, authenticated;
