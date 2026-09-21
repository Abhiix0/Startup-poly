/**
 * ⚠️ SECURITY WARNING:
 * The SUPABASE_SERVICE_ROLE_KEY possesses full superuser privileges and bypasses
 * Row Level Security (RLS). It MUST ONLY be supplied via shell environment variables
 * during intentional administrative operations. NEVER commit service keys to git,
 * NEVER store them in .env files, and NEVER prefix them with VITE_.
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SECURITY ERROR: VITE_SUPABASE_SERVICE_ROLE_KEY detected. Service role keys must never use VITE_ prefix.');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run admin:revoke -- --email <email> [--delete-user]');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let email = '';
  let allowRemote = false;
  let deleteUser = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1].trim();
    } else if (arg === '--email' && args[i + 1]) {
      email = args[i + 1].trim();
      i++;
    } else if (arg === '--allow-remote') {
      allowRemote = true;
    } else if (arg === '--delete-user') {
      deleteUser = true;
    }
  }

  if (!email || !email.includes('@')) {
    console.error('❌ ERROR: A valid --email argument is required.');
    process.exit(1);
  }

  const urlObj = new URL(supabaseUrl);
  const isLocal = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';

  if (!isLocal) {
    if (!allowRemote) {
      console.error(`⛔ SAFETY ABORT: Target URL "${supabaseUrl}" is not localhost. Pass --allow-remote to proceed.`);
      process.exit(1);
    }
    const hostConfirm = await askQuestion(`⚠️ You are targeting a REMOTE host [${urlObj.host}]. Type host name to confirm: `);
    if (hostConfirm !== urlObj.host) {
      console.error('❌ Hostname confirmation mismatch. Aborting.');
      process.exit(1);
    }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`\nLocating user for: ${email}...`);

  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to list users:', listError.message);
    process.exit(1);
  }

  const targetUser = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!targetUser) {
    console.error(`❌ User not found for email: ${email}`);
    process.exit(1);
  }

  const userId = targetUser.id;

  // 1. Delete from public.admins
  console.log(`[1/3] Removing user from public.admins table...`);
  const { error: dbError } = await supabase
    .from('admins')
    .delete()
    .eq('user_id', userId);

  if (dbError) {
    console.error('❌ Failed to delete from public.admins:', dbError.message);
    process.exit(1);
  }

  // 2. Globally sign out user across all devices/browsers
  console.log(`[2/3] Terminating all active user sessions globally...`);
  const { error: signOutError } = await supabase.auth.admin.signOut(userId, 'global');
  if (signOutError) {
    console.warn('⚠️ Warning: Failed to invalidate active sessions:', signOutError.message);
  }

  // 3. Optionally delete auth user
  if (deleteUser) {
    console.log(`[3/3] Deleting user from auth.users...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('❌ Failed to delete auth user:', deleteError.message);
      process.exit(1);
    }
  } else {
    console.log(`[3/3] Auth account retained (admin access revoked).`);
  }

  console.log('\n✅ Admin privileges revoked successfully!');
  console.log(`Email:   ${email}`);
  console.log(`User ID: ${userId}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
