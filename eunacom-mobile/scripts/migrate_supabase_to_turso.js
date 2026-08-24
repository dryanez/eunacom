require('dotenv').config({ path: '.env' });
const { createClient: createSupabase } = require('@supabase/supabase-js');
const { createClient: createTurso } = require('@libsql/client');

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const tursoUrl = process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
  }

  if (!tursoUrl || !tursoToken) {
    console.error('❌ Missing Turso credentials in .env. Please add VITE_TURSO_DATABASE_URL and VITE_TURSO_AUTH_TOKEN.');
    process.exit(1);
  }

  console.log('✅ Connected to Supabase and Turso');

  const supabase = createSupabase(supabaseUrl, supabaseKey);
  const turso = createTurso({ url: tursoUrl, authToken: tursoToken });

  // 1. Migrate user_progress
  console.log('Fetching user_progress from Supabase...');
  const { data: progressData, error: progressErr } = await supabase.from('user_progress').select('*');
  if (progressErr) {
    console.error('❌ Error fetching user_progress:', progressErr);
    process.exit(1);
  }

  console.log(`Found ${progressData.length} progress records. Migrating...`);
  
  // Ensure table exists in Turso (Turso tables are usually created on the fly in dev or via API)
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      question_id TEXT,
      is_correct INTEGER,
      is_omitted INTEGER DEFAULT 0,
      is_flagged INTEGER DEFAULT 0,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, question_id)
    )
  `);

  let progressCount = 0;
  for (const row of progressData) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO user_progress (id, user_id, question_id, is_correct, is_omitted, is_flagged, answered_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          row.id, 
          row.user_id, 
          row.question_id, 
          row.is_correct ? 1 : 0, 
          row.is_omitted ? 1 : 0, 
          row.is_flagged ? 1 : 0,
          row.answered_at
        ]
      });
      progressCount++;
    } catch (e) {
      console.error(`❌ Failed to insert progress for ${row.id}:`, e.message);
    }
  }
  console.log(`✅ Migrated ${progressCount} / ${progressData.length} progress records.`);

  // 2. Migrate tests
  console.log('Fetching tests from Supabase...');
  const { data: testsData, error: testsErr } = await supabase.from('tests').select('*');
  if (testsErr) {
    console.error('❌ Error fetching tests:', testsErr);
    process.exit(1);
  }

  console.log(`Found ${testsData.length} test records. Migrating...`);

  await turso.execute(`
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      mode TEXT,
      time_limit_seconds INTEGER,
      total_questions INTEGER,
      questions TEXT,
      answers TEXT,
      status TEXT,
      current_question_index INTEGER,
      score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);

  let testsCount = 0;
  for (const row of testsData) {
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO tests (
                id, user_id, mode, time_limit_seconds, total_questions, 
                questions, answers, status, current_question_index, score, created_at, completed_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          row.id,
          row.user_id,
          row.mode || 'exam',
          row.time_limit_seconds || null,
          row.total_questions || 0,
          JSON.stringify(row.questions || []),
          JSON.stringify(row.answers || {}),
          row.status || 'completed',
          row.current_question_index || 0,
          row.score || 0,
          row.created_at,
          null
        ]
      });
      testsCount++;
    } catch (e) {
      console.error(`❌ Failed to insert test ${row.id}:`, e.message);
    }
  }
  console.log(`✅ Migrated ${testsCount} / ${testsData.length} test records.`);

  console.log('🎉 Migration complete!');
}

main().catch(e => {
  console.error('Unhandled error:', e);
  process.exit(1);
});
