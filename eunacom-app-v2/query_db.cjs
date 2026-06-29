const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  const rs = await client.execute({ sql: "SELECT answers, current_question_index, tutor_state FROM tests WHERE id = '8144611f-3400-4dff-a6b8-11f5bc6212cf'", args: [] });
  console.log(rs.rows[0]);
}
run();
