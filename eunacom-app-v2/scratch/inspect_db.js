import { createClient } from '@libsql/client';
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
client.execute("SELECT name FROM sqlite_master WHERE type='table'").then(res => {
  console.log(res.rows);
}).catch(err => console.error(err));
