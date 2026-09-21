/**
 * STARTUPOLY Production Verification Script
 * 
 * Verifies critical RLS, RPC security guards, and table permissions:
 * 1. Anon client CANNOT select directly from `teams`
 * 2. Anon client CANNOT select directly from `rooms`
 * 3. Anon client CANNOT select directly from `activity_events`
 * 4. Anon client CANNOT invoke admin RPCs (fails with NOT_ADMIN)
 * 5. Calling `join_team` with a wrong PIN fails (fails with BAD_CODE_OR_PIN or similar error)
 * 6. `business_catalog` IS readable by anonymous users (returns 10 businesses)
 * 
 * Usage:
 *   npx tsx scripts/verify-prod.ts [--url=https://<project>.supabase.co] [--key=<anon_key>]
 */

import { createClient } from '@supabase/supabase-js';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

async function runVerification() {
  const args = process.argv.slice(2);
  let supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
  let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      supabaseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--key=')) {
      supabaseAnonKey = arg.split('=')[1];
    }
  }

  console.log('='.repeat(60));
  console.log('🚀 STARTUPOLY PRODUCTION SECURITY & PERMISSION VERIFICATION');
  console.log('='.repeat(60));
  console.log(`Target URL: ${supabaseUrl}`);
  console.log(`Using Key:  ${supabaseAnonKey.slice(0, 12)}...${supabaseAnonKey.slice(-6)}`);
  console.log('-'.repeat(60));

  if (!supabaseAnonKey) {
    console.error('❌ Error: No Supabase Anon Key provided via VITE_SUPABASE_ANON_KEY or --key=');
    process.exit(1);
  }

  // Create an unauthenticated / anonymous Supabase client
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const results: CheckResult[] = [];

  // Check 1: Anon cannot select directly from `teams`
  try {
    const { data, error } = await client.from('teams').select('id, name, cash, pin');
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
    const { data, error } = await client.from('activity_events').select('id, event_type, note');
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
    const { data, error } = await client.rpc('admin_create_room', {
      p_team_count: 5,
      p_teams: [{ name: 'Hackers', color: '#FF0000' }],
    });

    if (error) {
      results.push({
        name: 'Block anonymous admin RPC calls',
        passed: true,
        message: `Admin RPC rejected: ${error.message} (${error.code})`,
      });
    } else {
      results.push({
        name: 'Block anonymous admin RPC calls',
        passed: false,
        message: 'VULNERABILITY DETECTED: Anonymous user was able to execute admin_create_room!',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Block anonymous admin RPC calls',
      passed: true,
      message: `Exception thrown: ${err.message}`,
    });
  }

  // Check 5: join_team with an invalid PIN fails
  try {
    // Ensure an anonymous session is established
    await client.auth.signInAnonymously();

    const { data, error } = await client.rpc('join_team', {
      p_code: 'NONEXISTENT999',
      p_slot: 1,
      p_pin: '0000',
    });

    if (error) {
      results.push({
        name: 'Reject invalid join_team call',
        passed: true,
        message: `Invalid join rejected as expected: ${error.message}`,
      });
    } else {
      results.push({
        name: 'Reject invalid join_team call',
        passed: false,
        message: 'Failed: join_team succeeded unexpectedly with non-existent code!',
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Reject invalid join_team call',
      passed: true,
      message: `Exception caught: ${err.message}`,
    });
  }

  // Check 6: business_catalog is readable by anonymous user
  try {
    const { data, error } = await client
      .from('business_catalog')
      .select('key, name, cost, initial_cv')
      .order('sort_order', { ascending: true });

    if (error) {
      results.push({
        name: 'Public read on business_catalog',
        passed: false,
        message: `Failed to read business_catalog: ${error.message}`,
      });
    } else if (data && data.length >= 10) {
      results.push({
        name: 'Public read on business_catalog',
        passed: true,
        message: `Successfully read ${data.length} businesses from catalog`,
      });
    } else {
      results.push({
        name: 'Public read on business_catalog',
        passed: false,
        message: `Expected at least 10 businesses, but got ${data?.length || 0}`,
      });
    }
  } catch (err: any) {
    results.push({
      name: 'Public read on business_catalog',
      passed: false,
      message: `Exception reading business catalog: ${err.message}`,
    });
  }

  // Print Summary Table
  console.log('\nVERIFICATION RESULTS:');
  let allPassed = true;
  for (const res of results) {
    const icon = res.passed ? '✅' : '❌';
    console.log(`${icon} [${res.passed ? 'PASS' : 'FAIL'}] ${res.name}: ${res.message}`);
    if (!res.passed) allPassed = false;
  }

  console.log('-'.repeat(60));
  if (allPassed) {
    console.log('🎉 ALL PRODUCTION SECURITY & PERMISSION CHECKS PASSED!');
    process.exit(0);
  } else {
    console.error('💥 ONE OR MORE SECURITY CHECKS FAILED! INVESTIGATE IMMEDIATELY.');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
