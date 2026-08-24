import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

async function run() {
  await db.execute("DELETE FROM user_profiles WHERE id = 'screenshot-mock' OR email = 'test@test.com'")
  console.log("Deleted test account")
}

run().catch(console.error)
