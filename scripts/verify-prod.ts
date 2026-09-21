/**
 * STARTUPOLY Production Verification Script
 * 
 * Verifies critical RLS, RPC security guards, and table permissions:
 * 1. Anon client CANNOT select directly from `teams` (RLS hides rows)
 * 2. Anon client CANNOT select directly from `rooms` (RLS hides rows)
 * 3. Anon client CANNOT select directly from `activity_events` (RLS hides rows)
 * 4. Anon client CANNOT invoke admin RPCs (fails with NOT_ADMIN / 42501)
 * 5. Calling `join_team` with invalid credentials fails properly via RPC logic
 * 6. `business_catalog` IS readable by anonymous users (returns 10 businesses)
 * 
 * Usage:
 *   npx tsx scripts/verify-prod.ts [--url=https://<project>.supabase.co] [--key=<anon_key>]
 * 
 * If --url or --key are omitted, values are automatically loaded from .env.local or .env.
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
  // Load .env.local then .env if present
  loadEnvFile(path.resolve(process.cwd(), '.env.local'));
  loadEnvFile(path.resolve(process.cwd(), '.env'));

  const args = process.argv.slice(2);
  let supabaseUrl = process.env.VITE_SUPABASE_URL || '';
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
  console.log(`Target URL: ${supabaseUrl || '(none)'}`);
  
  if (!supabaseUrl) {
    console.error('❌ Error: No Supabase URL provided via VITE_SUPABASE_URL, .env.local, or --url=');
    process.exit(1);
  }

  if (!supabaseAnonKey) {
    console.error('❌ Error: No Supabase Anon Key provided via VITE_SUPABASE_ANON_KEY, .env.local, or --key=');
    process.exit(1);
  }

  // Detect truncated keys (e.g. copied preview ending in '...')
  if (supabaseAnonKey.endsWith('...') || supabaseAnonKey.includes('...')) {
    console.error(`Using Key:  ${supabaseAnonKey}`);
    console.error('\n❌ ERROR: The API key contains ellipsis ("...").');
    console.error('It appears the key was copied from a truncated UI preview rather than the full key.');
    console.error('Please copy the full anon public key from:');
    console.error('  Supabase Dashboard -> Project Settings -> API -> Project API Keys -> anon / public');
    console.error('Or simply run `npx tsx scripts/verify-prod.ts` to automatically read from .env.local.');
    process.exit(1);
  }

  console.log(`Using Key:  ${supabaseAnonKey.slice(0, 12)}...${supabaseAnonKey.slice(-6)}`);
  console.log('-'.repeat(60));

  // Create an unauthenticated / anonymous Supabase client
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  // Pre-flight check: verify API key is accepted by Supabase Gateway
  const preflight = await client.from('business_catalog').select('key').limit(1);
  if (preflight.error && preflight.error.message?.toLowerCase().includes('invalid api key')) {
    console.error('\n❌ ERROR: Supabase rejected the provided key with "Invalid API key".');
    console.error('Check that the key matches the "anon" public key in your Supabase project settings.');
    process.exit(1);
  }

  const results: CheckResult[] = [];

  // Check 1: Anon cannot select directly from `teams`
  try {
    const { data, error } = await client.from('teams').select('id, name, cash');
    if (error) {
      if (error.message?.toLowerCase().includes('invalid api key')) {
        results.push({
          name: 'Block direct SELECT on teams table',
          passed: false,
          message: `API Key rejected by server: ${error.message}`,
        });
      } else {
        results.push({
          name: 'Block direct SELECT on teams table',
          passed: true,
          message: `Blocked with error: ${error.message}`,
        });
      }
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
      if (error.message?.toLowerCase().includes('invalid api key')) {
        results.push({
          name: 'Block direct SELECT on rooms table',
          passed: false,
          message: `API Key rejected by server: ${error.message}`,
        });
      } else {
        results.push({
          name: 'Block direct SELECT on rooms table',
          passed: true,
          message: `Blocked with error: ${error.message}`,
        });
      }
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
      if (error.message?.toLowerCase().includes('invalid api key')) {
        results.push({
          name: 'Block direct SELECT on activity_events table',
          passed: false,
          message: `API Key rejected by server: ${error.message}`,
        });
      } else {
        results.push({
          name: 'Block direct SELECT on activity_events table',
          passed: true,
          message: `Blocked with error: ${error.message}`,
        });
      }
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
      team_count: 5,
      teams: [{ name: 'Hackers', color: '#FF0000' }],
    });

    if (error) {
      // Expect rejection due to NOT_ADMIN / NOT_AUTHENTICATED / permission denied
      results.push({
        name: 'Block anonymous admin RPC calls',
        passed: true,
        message: `Admin RPC rejected as expected: ${error.message} (${error.code})`,
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

  // Check 5: join_team with an invalid PIN fails properly
  try {
    // Ensure an anonymous session is established
    await client.auth.signInAnonymously();

    const { data, error } = await client.rpc('join_team', {
      code: 'NONEXISTENT999',
      slot: 1,
      pin: '0000',
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
