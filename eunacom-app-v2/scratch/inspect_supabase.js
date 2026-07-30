import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser since dotenv is not installed
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Using Key starting with:", supabaseKey ? supabaseKey.substring(0, 15) + "..." : "undefined");

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log("\n--- Checking for classes in Supabase ---");
  const { data: clases, error: clasesError } = await supabase
    .from('clases')
    .select('*')
    .limit(5);
  
  if (clasesError) {
    console.error("Error fetching clases from Supabase:", clasesError.message);
  } else {
    console.log(`Successfully fetched ${clases?.length || 0} clases.`);
    if (clases && clases.length > 0) {
      console.log("Sample clase:", JSON.stringify(clases[0], null, 2));
    }
  }

  console.log("\n--- Checking for other tables (e.g. profiles, questions) ---");
  const { data: schemas, error: schemasError } = await supabase
    .rpc('get_tables'); // standard RPC sometimes defined
  
  if (schemasError) {
    console.log("get_tables RPC not available. Trying direct selects on common tables...");
    for (const table of ['profiles', 'questions', 'tests', 'progress', 'clase_progress']) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table '${table}': Error (${error.message})`);
      } else {
        console.log(`Table '${table}': EXISTS (sample data fetched)`);
      }
    }
  } else {
    console.log("Tables in DB:", schemas);
  }
}

inspect().catch(err => console.error("Unhandled error:", err));
