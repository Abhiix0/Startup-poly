/**
 * ⚠️ SECURITY WARNING:
 * This script is intended for rehearsal and mock match simulation only.
 * Admin credentials must be supplied via CLI flags or shell environment variables.
 * Never commit admin passwords or hardcode credentials in source control.
 */

import { createClient } from '@supabase/supabase-js';

const DEMO_TEAMS = [
  { name: 'FinFlow', color: '#FFCC00' },
  { name: 'CloudScale', color: '#5C94FC' },
  { name: 'HealthPulse', color: '#22B14C' },
  { name: 'EduSpark', color: '#B84418' },
  { name: 'NeuroAI', color: '#8B5CF6' },
  { name: 'RoboTrack', color: '#0EA5E9' },
];

async function seedRehearsal() {
  const args = process.argv.slice(2);
  let supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
  let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  let adminEmail = process.env.STARTUPOLY_ADMIN_EMAIL || '';
  let adminPassword = process.env.STARTUPOLY_ADMIN_PASSWORD || '';
  let allowRemote = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--url=')) supabaseUrl = arg.split('=')[1];
    else if (arg === '--url' && args[i + 1]) { supabaseUrl = args[++i]; }
    else if (arg.startsWith('--key=')) supabaseAnonKey = arg.split('=')[1];
    else if (arg === '--key' && args[i + 1]) { supabaseAnonKey = args[++i]; }
    else if (arg.startsWith('--email=')) adminEmail = arg.split('=')[1];
    else if (arg === '--email' && args[i + 1]) { adminEmail = args[++i]; }
    else if (arg.startsWith('--password=')) adminPassword = arg.split('=')[1];
    else if (arg === '--password' && args[i + 1]) { adminPassword = args[++i]; }
    else if (arg === '--allow-remote' || arg === '--force-staging') allowRemote = true;
  }

  const urlObj = new URL(supabaseUrl);
  const isLocal = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';

  if (!isLocal && !allowRemote) {
    console.error(`⛔ SAFETY ABORT: Target URL "${supabaseUrl}" is not localhost. Pass --allow-remote to proceed.`);
    process.exit(1);
  }

  if (!adminEmail || !adminPassword) {
    console.error('❌ ERROR: Admin credentials required.');
    console.error('Usage: npx tsx scripts/seed-rehearsal.ts --email <email> --password <password>');
    console.error('   or: STARTUPOLY_ADMIN_EMAIL=... STARTUPOLY_ADMIN_PASSWORD=... npx tsx scripts/seed-rehearsal.ts');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('🎮 STARTUPOLY REHEARSAL & MOCK MATCH GENERATOR');
  console.log('='.repeat(60));
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Admin Email:  ${adminEmail}`);

  const client = createClient(supabaseUrl, supabaseAnonKey);

  // 1. Authenticate as Admin
  console.log('\n[1/5] Authenticating as Event Admin...');
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (authError || !authData?.user) {
    console.error(`❌ Admin auth failed: ${authError?.message || 'No user returned'}`);
    console.log('Please ensure the admin user exists in your local/staging environment.');
    process.exit(1);
  }

  console.log(`✔ Logged in as ${authData.user.email} (ID: ${authData.user.id})`);

  // 2. Create Room with 6 Teams
  console.log('\n[2/5] Creating room with 6 startup teams...');
  const { data: createData, error: createError } = await client.rpc('admin_create_room', {
    p_team_count: 6,
    p_teams: DEMO_TEAMS,
  });

  if (createError) {
    console.error(`❌ admin_create_room failed: ${createError.message}`);
    process.exit(1);
  }

  const roomId = createData.room_id;
  const roomCode = createData.code;
  console.log(`✔ Room created! ID: ${roomId} | Code: ${roomCode}`);

  // 3. Open Lobby
  console.log('\n[3/5] Opening match lobby...');
  const { error: lobbyError } = await client.rpc('admin_open_lobby', {
    p_room_id: roomId,
  });

  if (lobbyError) {
    console.error(`❌ admin_open_lobby failed: ${lobbyError.message}`);
    process.exit(1);
  }
  console.log('✔ Lobby is OPEN. Players can connect.');

  // Fetch created teams snapshot to get PINs
  const { data: snapshotData, error: snapshotError } = await client.rpc('get_admin_snapshot', {
    p_room_id: roomId,
  });

  if (snapshotError) {
    console.error(`❌ get_admin_snapshot failed: ${snapshotError.message}`);
    process.exit(1);
  }

  console.log('\n📋 GENERATED TEAMS & PINS:');
  console.table(
    snapshotData.teams.map((t: any) => ({
      Slot: t.slot,
      Name: t.name,
      PIN: t.pin,
      Color: t.color,
    }))
  );

  // 4. Start Game
  console.log('\n[4/5] Starting match (force start with rehearsal teams)...');
  const { error: startError } = await client.rpc('admin_start_game', {
    p_room_id: roomId,
    p_force: true,
  });

  if (startError) {
    console.error(`❌ admin_start_game failed: ${startError.message}`);
    process.exit(1);
  }
  console.log('✔ Match STARTED! 50-minute authoritative clock active.');

  // 5. Simulate initial board activity
  console.log('\n[5/5] Simulating realistic initial board events...');
  try {
    const teams = snapshotData.teams;

    // Team 1 buys 'fintech'
    await client.rpc('admin_add_business', {
      p_team_id: teams[0].id,
      p_business_key: 'fintech',
      p_apply_purchase: true,
      p_expected_version: teams[0].version,
      p_request_id: `rehearsal-buy-${Date.now()}-1`,
      p_note: 'Initial board landing purchase',
    });
    console.log(`✔ FinFlow bought FinTech (-₹400, +200 CV)`);

    // Team 2 buys 'saas'
    await client.rpc('admin_add_business', {
      p_team_id: teams[1].id,
      p_business_key: 'saas',
      p_apply_purchase: true,
      p_expected_version: teams[1].version,
      p_request_id: `rehearsal-buy-${Date.now()}-2`,
      p_note: 'Initial board landing purchase',
    });
    console.log(`✔ CloudScale bought SaaS (-₹300, +180 CV)`);

    // Team 3 passes START lap
    await client.rpc('admin_adjust', {
      p_changes: [
        {
          team_id: teams[2].id,
          cash_delta: 200,
          cv_delta: 0,
          expected_version: teams[2].version,
        },
      ],
      p_label: 'START LAP REWARD',
      p_note: 'Completed board loop',
      p_request_id: `rehearsal-start-${Date.now()}`,
    });
    console.log(`✔ HealthPulse completed START lap (+₹200)`);
  } catch (err: any) {
    console.warn(`Simulated activity warning: ${err.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 REHEARSAL MATCH READY!');
  console.log(`Room Code:    ${roomCode}`);
  console.log(`Admin URL:    http://localhost:3000/admin/room/${roomId}`);
  console.log(`Phone URL:    http://localhost:3000/join`);
  console.log('='.repeat(60));
}

seedRehearsal().catch((err) => {
  console.error('Fatal rehearsal setup error:', err);
  process.exit(1);
});
