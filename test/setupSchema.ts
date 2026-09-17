import pg from 'pg';

const { Client } = pg;
const projectRef = 'dbmswyjkpkvxshwikrpn';
const password = 'startupoly@123';
const poolerHost = 'aws-0-ap-southeast-1.pooler.supabase.com';

async function setupSchema() {
  const client = new Client({
    connectionString: `postgresql://postgres.${projectRef}:${password}@${poolerHost}:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL!');

    console.log('Creating matches and match_events tables...');

    await client.query(`
      -- Create matches table
      CREATE TABLE IF NOT EXISTS public.matches (
        id text PRIMARY KEY,
        status text NOT NULL DEFAULT 'waiting',
        seconds_remaining integer NOT NULL DEFAULT 3000,
        timer_running boolean NOT NULL DEFAULT false,
        active_team_index integer NOT NULL DEFAULT 0,
        turn_rolls integer NOT NULL DEFAULT 0,
        settings jsonb NOT NULL DEFAULT '{}'::jsonb,
        pending_landing jsonb,
        pending_sale jsonb,
        latest_roll_animation jsonb,
        state_json jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      -- Create match_events table
      CREATE TABLE IF NOT EXISTS public.match_events (
        id text PRIMARY KEY,
        match_id text NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
        time_formatted text NOT NULL,
        action_type text NOT NULL,
        team_index integer NOT NULL,
        team_name text NOT NULL,
        description text NOT NULL,
        cash_delta integer,
        cv_delta integer,
        snapshot_before jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      -- Enable RLS
      ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if any
      DROP POLICY IF EXISTS "Allow public read matches" ON public.matches;
      DROP POLICY IF EXISTS "Allow public insert matches" ON public.matches;
      DROP POLICY IF EXISTS "Allow public update matches" ON public.matches;
      DROP POLICY IF EXISTS "Allow public delete matches" ON public.matches;
      DROP POLICY IF EXISTS "Allow public all on matches" ON public.matches;

      DROP POLICY IF EXISTS "Allow public all on match_events" ON public.match_events;

      -- Create permissive policies for match synchronization
      CREATE POLICY "Allow public all on matches" ON public.matches
        FOR ALL TO public
        USING (true)
        WITH CHECK (true);

      CREATE POLICY "Allow public all on match_events" ON public.match_events
        FOR ALL TO public
        USING (true)
        WITH CHECK (true);

      -- Enable Realtime for matches and match_events
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'matches'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'match_events'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
        END IF;
      END $$;
    `);

    console.log('Schema created successfully!');

    // Verify
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Public tables in Supabase:', tablesRes.rows.map(r => r.table_name));

    const pubTables = await client.query(`
      SELECT tablename 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime';
    `);
    console.log('Tables in supabase_realtime publication:', pubTables.rows.map(r => r.tablename));

    await client.end();
  } catch (err) {
    console.error('Schema setup error:', err);
  }
}

setupSchema();
