/**
 * ⚠️ SECURITY WARNING:
 * The SUPABASE_SERVICE_ROLE_KEY possesses full superuser privileges and bypasses
 * Row Level Security (RLS). It MUST ONLY be supplied via shell environment variables
 * during intentional administrative operations. NEVER commit service keys to git,
 * NEVER store them in .env files, and NEVER prefix them with VITE_.
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

function askHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    const isRaw = stdin.isRaw;
    if (stdin.setRawMode) {
      stdin.setRawMode(true);
    }

    process.stdout.write(query);
    let password = '';

    const onData = (chunk: Buffer) => {
      const char = chunk.toString();
      if (char === '\n' || char === '\r' || char === '\u0004') {
        if (stdin.setRawMode) stdin.setRawMode(isRaw);
        stdin.removeListener('data', onData);
        rl.close();
        process.stdout.write('\n');
        resolve(password);
      } else if (char === '\u0003') {
        // Ctrl+C
        process.stdout.write('\n');
        process.exit(1);
      } else if (char === '\b' || char === '\x7f') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
        }
      } else {
        password += char;
      }
    };

    stdin.on('data', onData);
  });
}

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
  // Reject VITE_ prefixed keys to avoid accidental frontend exposure
  if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SECURITY ERROR: VITE_SUPABASE_SERVICE_ROLE_KEY detected. Service role keys must never use VITE_ prefix.');
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run admin:create -- --email <email>');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let email = '';
  let allowRemote = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--email=')) {
      email = arg.split('=')[1].trim();
    } else if (arg === '--email' && args[i + 1]) {
      email = args[i + 1].trim();
      i++;
    } else if (arg === '--allow-remote') {
      allowRemote = true;
    }
  }

  if (!email || !email.includes('@')) {
    console.error('❌ ERROR: A valid --email argument is required.');
    process.exit(1);
  }

  // Safety guard for remote databases
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

  // Read password interactively without echo (minimum 12 chars, confirmed twice)
  const password = await askHidden('Enter new admin password (min 12 characters): ');
  if (password.length < 12) {
    console.error('❌ Password must be at least 12 characters long.');
    process.exit(1);
  }

  const confirmPassword = await askHidden('Confirm admin password: ');
  if (password !== confirmPassword) {
    console.error('❌ Passwords do not match.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log(`\nProvisioning admin: ${email}...`);

  let userId: string;

  // 1. Create or retrieve auth user
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    if (createError.message.toLowerCase().includes('already') || createError.message.toLowerCase().includes('exists')) {
      console.log('ℹ️ Auth user already exists. Fetching existing user ID...');
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('❌ Failed to list users:', listError.message);
        process.exit(1);
      }
      const existingUser = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (!existingUser) {
        console.error('❌ Could not locate existing user record.');
        process.exit(1);
      }
      userId = existingUser.id;
      // Update password if requested
      await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
    } else {
      console.error('❌ Failed to create auth user:', createError.message);
      process.exit(1);
    }
  } else {
    userId = createData.user.id;
  }

  // 2. Ensure public.admins entry exists
  const { error: dbError } = await supabase
    .from('admins')
    .upsert({ user_id: userId }, { onConflict: 'user_id' });

  if (dbError) {
    console.error('❌ Failed to insert into public.admins table:', dbError.message);
    process.exit(1);
  }

  console.log('\n✅ Admin provisioned successfully!');
  console.log(`Email:   ${email}`);
  console.log(`User ID: ${userId}`);
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
