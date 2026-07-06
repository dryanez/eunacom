import { createClient } from '@libsql/client';
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
async function run() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
  await client.execute(`
    INSERT OR IGNORE INTO app_settings (key, value) VALUES ('freemium_mode', 'strict')
  `);
  const res = await client.execute("SELECT * FROM app_settings");
  console.log(res.rows);
}
run().catch(err => console.error(err));
