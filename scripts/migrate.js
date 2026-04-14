const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Skipping Supabase migrations: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(0);
}

try {
  console.log('🚀 Running Supabase migrations...');
  
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.warn('⚠️  No migrations directory found at', migrationsDir);
    process.exit(0);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('✅ No migration files found');
    process.exit(0);
  }

  console.log(`Found ${migrationFiles.length} migration files`);

  // If Supabase CLI is available, use it
  try {
    execSync('supabase migration up', { 
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    console.log('✅ Migrations completed successfully via Supabase CLI');
  } catch (cliError) {
    console.warn('ℹ️  Supabase CLI not available, attempting alternative method...');
    console.log('⚠️  Manual migration execution not yet implemented. Please ensure migrations are run via Supabase dashboard or CLI.');
    // In production, you might want to fail here or implement direct DB access
  }
} catch (error) {
  console.error('❌ Migration error:', error.message);
  process.exit(1);
}