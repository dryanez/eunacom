import { createClient } from '@libsql/client';

const client = createClient({
  url: "libsql://eunacom-felipeyanez270.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN // Need to get this or I can use the edge function
});

// Since I don't have the auth token easily available, I'll write a quick Next.js api route and curl it.
