import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN
});

async function migrate() {
  try {
    await client.execute('ALTER TABLE tests ADD COLUMN time_left_seconds INTEGER DEFAULT NULL');
    console.log('Added time_left_seconds to tests table.');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('Column time_left_seconds already exists.');
    } else {
      console.error(e);
    }
  }
}
migrate();
