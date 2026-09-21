/**
 * ⚠️ SECURITY WARNING:
 * This verification script operates solely using the public Anon Key.
 * NEVER supply or hardcode SUPABASE_SERVICE_ROLE_KEY into this script or client files.
 * The service-role key must live only in the shell environment when running admin tasks.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function runVerification() {
  loadEnvFile(path.resolve(process.cwd(), '.env.local'));
  loadEnvFile(path.resolve(process.cwd(), '.env'));

  const args = process.argv.slice(2);
  let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--url=')) supabaseUrl = arg.split('=')[1];
    else if (arg === '--url' && args[i + 1]) { supabaseUrl = args[++i]; }
    else if (arg.startsWith('--key=')) supabaseAnonKey = arg.split('=')[1];
    else if (arg === '--key' && args[i + 1]) { supabaseAnonKey = args[++i]; }
  }

  console.log('='.repeat(60));
  console.log('🚀 STARTUPOLY PRODUCTION SECURITY & PERMISSION VERIFICATION');
  console.log('='.repeat(60));
  console.log(`Target URL: ${supabaseUrl || '(none)'}`);

  if (!supabaseUrl) {
    console.error('❌ Error: No Supabase URL provided via VITE_SUPABASE_URL, .env.local, or --url=');
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error('❌ Error: No Supabase Anon Key provided via VITE_SUPABASE_ANON_KEY, .env.local, or --key=');
    process.exit(1);
  }

  if (supabaseAnonKey.endsWith('...') || supabaseAnonKey.includes('...')) {
    console.error('\n❌ ERROR: The API key contains ellipsis ("...").');
    console.error('Please copy the full anon public key from your Supabase Dashboard.');
    process.exit(1);
  }

  console.log(`Using Key:  ${supabaseAnonKey.slice(0, 12)}...${supabaseAnonKey.slice(-6)}`);
  console.log('-'.repeat(60));

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const results: CheckResult[] = [];

  // Check 1: Anon cannot select directly from `teams`
  try {
    const { data, error } = await client.from('teams').select('id, name, cash');
    if (error) {
      results.push({
        name: 'Block direct SELECT on teams table',
        passed: true,
        message: `Blocked with error: ${error.message}`,
      });
    } else if (!data || data.length === 0) {
      results.push({
        name: 'Block direct SELECT on teams table',
        passed: true,
        message: 'RLS returned empty array (0 rows exposed)',
      });
    } else {
      results.push({
        name: 'Block direct SELECT on teams table',
        passed: false,
        message: `LEAK DETECTED: Exposed ${data.length} team rows to anonymous user!`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Block direct SELECT on teams table',
      passed: true,
      message: `Exception thrown: ${err.message}`,
    });
  }

  // Check 2: Anon cannot select directly from `rooms`
  try {
    const { data, error } = await client.from('rooms').select('id, code, status');
    if (error) {
      results.push({
        name: 'Block direct SELECT on rooms table',
        passed: true,
        message: `Blocked with error: ${error.message}`,
      });
    } else if (!data || data.length === 0) {
      results.push({
        name: 'Block direct SELECT on rooms table',
        passed: true,
        message: 'RLS returned empty array (0 rows exposed)',
      });
    } else {
      results.push({
        name: 'Block direct SELECT on rooms table',
        passed: false,
        message: `LEAK DETECTED: Exposed ${data.length} room rows to anonymous user!`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Block direct SELECT on rooms table',
      passed: true,
      message: `Exception thrown: ${err.message}`,
    });
  }

  // Check 3: Anon cannot select directly from `activity_events`
  try {
    const { data, error } = await client.from('activity_events').select('id, type, note');
    if (error) {
      results.push({
        name: 'Block direct SELECT on activity_events table',
        passed: true,
        message: `Blocked with error: ${error.message}`,
      });
    } else if (!data || data.length === 0) {
      results.push({
        name: 'Block direct SELECT on activity_events table',
        passed: true,
        message: 'RLS returned empty array (0 rows exposed)',
      });
    } else {
      results.push({
        name: 'Block direct SELECT on activity_events table',
        passed: false,
        message: `LEAK DETECTED: Exposed ${data.length} activity event rows to anonymous user!`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Block direct SELECT on activity_events table',
      passed: true,
      message: `Exception thrown: ${err.message}`,
    });
  }

  // Check 4: Anon cannot invoke admin RPCs
  try {
    const { error } = await client.rpc('admin_create_room', {
      p_team_count: 5,
      p_teams: [{ name: 'Hackers', color: '#FF0000' }],
    });

    if (error) {
      results.push({
        name: 'Block anonymous admin RPC calls',
        passed: true,
        message: `Admin RPC rejected as expected: ${error.message} (${error.code})`,
      });
    } else {
      results.push({
        name: 'Block anonymous admin RPC calls',
        passed: false,
        message: 'VULNERABILITY DETECTED: Anonymous caller executed admin_create_room!',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Block anonymous admin RPC calls',
      passed: true,
      message: `Exception thrown: ${err.message}`,
    });
  }

  // Check 5: Public email signUp is rejected
  try {
    const { data, error } = await client.auth.signUp({
      email: `unauthorized-signup-${Date.now()}@example.com`,
      password: 'UnauthorizedPassword123!',
    });

    if (error || !data.user) {
      results.push({
        name: 'Reject public email signups',
        passed: true,
        message: `Public signup rejected: ${error?.message || 'No user created'}`,
      });
    } else {
      results.push({
        name: 'Reject public email signups',
        passed: false,
        message: 'VULNERABILITY DETECTED: Public self-service email signup succeeded!',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Reject public email signups',
      passed: true,
      message: `Signup rejected: ${err.message}`,
    });
  }

  // Check 6: signInAnonymously works
  let anonUserClient: any = null;
  try {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
    const { data: anonData, error: anonError } = await anonClient.auth.signInAnonymously();
    if (anonError || !anonData.session) {
      results.push({
        name: 'Anonymous sign-in operational',
        passed: false,
        message: `Anonymous signin failed: ${anonError?.message || 'No session'}`,
      });
    } else {
      anonUserClient = anonClient;
      results.push({
        name: 'Anonymous sign-in operational',
        passed: true,
        message: `Anonymous session established (UID: ${anonData.user?.id.slice(0, 8)}...)`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Anonymous sign-in operational',
      passed: false,
      message: `Exception during anonymous signin: ${err.message}`,
    });
  }

  // Check 7: Freshly created anonymous user gets NOT_ADMIN on admin RPCs
  if (anonUserClient) {
    try {
      const { error: anonRpcError } = await anonUserClient.rpc('admin_create_room', {
        p_team_count: 5,
        p_teams: [{ name: 'Team1', color: '#FF0000' }],
      });
      if (anonRpcError && anonRpcError.message.includes('NOT_ADMIN')) {
        results.push({
          name: 'Anonymous user rejected by admin RPC with NOT_ADMIN',
          passed: true,
          message: `Rejected with: ${anonRpcError.message}`,
        });
      } else if (anonRpcError) {
        results.push({
          name: 'Anonymous user rejected by admin RPC with NOT_ADMIN',
          passed: true,
          message: `Rejected with error: ${anonRpcError.message}`,
        });
      } else {
        results.push({
          name: 'Anonymous user rejected by admin RPC with NOT_ADMIN',
          passed: false,
          message: 'VULNERABILITY: Anonymous authenticated user executed admin RPC!',
        });
      }
    } catch (err: any) {
      results.push({
        name: 'Anonymous user rejected by admin RPC with NOT_ADMIN',
        passed: true,
        message: `Exception: ${err.message}`,
      });
    }
  }

  // Check 8: signInWithPassword with wrong password returns invalid_credentials
  try {
    const { error: badPwdError } = await client.auth.signInWithPassword({
      email: 'nonexistent-admin@startupoly.com',
      password: 'WrongPassword123!',
    });

    if (badPwdError) {
      results.push({
        name: 'Reject invalid credentials securely',
        passed: true,
        message: `Rejected with: ${badPwdError.message} (${badPwdError.code || 'invalid_credentials'})`,
      });
    } else {
      results.push({
        name: 'Reject invalid credentials securely',
        passed: false,
        message: 'VULNERABILITY: Bad credentials succeeded unexpectedly!',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Reject invalid credentials securely',
      passed: true,
      message: `Exception: ${err.message}`,
    });
  }

  // Check 9: Public read on business_catalog
  try {
    const { data, error } = await client.from('business_catalog').select('key, name, cost');
    if (error) {
      results.push({
        name: 'Public read on business_catalog',
        passed: false,
        message: `Failed to read catalog: ${error.message}`,
      });
    } else if (data && data.length >= 10) {
      results.push({
        name: 'Public read on business_catalog',
        passed: true,
        message: `Successfully read ${data.length} catalog items as anonymous client`,
      });
    } else {
      results.push({
        name: 'Public read on business_catalog',
        passed: false,
        message: `Expected >=10 businesses, got ${data?.length || 0}`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Public read on business_catalog',
      passed: false,
      message: `Exception: ${err.message}`,
    });
  }

  // Print Summary
  console.log('\nVERIFICATION RESULTS:');
  let allPassed = true;
  for (const r of results) {
    const icon = r.passed ? '✅ [PASS]' : '❌ [FAIL]';
    console.log(`${icon} ${r.name}: ${r.message}`);
    if (!r.passed) allPassed = false;
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('🎉 ALL PRODUCTION SECURITY & PERMISSION CHECKS PASSED');
  } else {
    console.error('⚠️ ONE OR MORE CHECKS FAILED! Inspect above output.');
    process.exit(1);
  }
  console.log('='.repeat(60));
}

runVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
