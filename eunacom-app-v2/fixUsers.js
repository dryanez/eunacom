import { getTurso } from './api/_turso.js';

async function run() {
  const db = getTurso();
  try {
    console.log('1. Deleting test@test.com...');
    await db.execute({
      sql: 'DELETE FROM user_profiles WHERE email = ?',
      args: ['test@test.com']
    });

    console.log('2. Deleting TESTANN...');
    await db.execute({
      sql: 'DELETE FROM user_profiles WHERE first_name LIKE ? OR email LIKE ?',
      args: ['%TESTANN%', '%testann%']
    });

    console.log('3. Updating existing users to have onboarding_done = 1...');
    // We update anyone who already has a non-empty first_name so they don't get asked again.
    const res = await db.execute({
      sql: 'UPDATE user_profiles SET onboarding_done = 1 WHERE first_name IS NOT NULL AND first_name != ""',
      args: []
    });
    console.log(`Updated ${res.rowsAffected} existing users.`);

    // Just in case, also mark the admin explicitly
    await db.execute({
      sql: 'UPDATE user_profiles SET onboarding_done = 1 WHERE email = ?',
      args: ['dr.felipeyanez@gmail.com']
    });
    
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
