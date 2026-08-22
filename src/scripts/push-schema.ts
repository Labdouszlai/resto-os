import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set in environment");
  process.exit(1);
}

async function main() {
  console.log("Connecting to Supabase...");
  console.log("URL (redacted):", url.replace(/:[^:@]+@/, ":***@"));
  const client = postgres(url, { ssl: { rejectUnauthorized: false } });

  // Test connection
  try {
    const result = await client.unsafe("SELECT 1 as test");
    console.log("Connection test:", result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Connection test failed:", msg);
    await client.end();
    return;
  }

  const sqlPath = join(process.cwd(), "drizzle", "0000_cute_maginty.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  const statements = sql
    .split("--> statement-breakpoint")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Executing ${statements.length} SQL statements...`);

  let ok = 0, skip = 0, fail = 0;
  for (let i = 0; i < statements.length; i++) {
    try {
      await client.unsafe(statements[i]);
      ok++;
      process.stdout.write(`\r  [${i + 1}/${statements.length}] OK       `);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists")) {
        skip++;
        process.stdout.write(`\r  [${i + 1}/${statements.length}] SKIP     `);
      } else {
        fail++;
        console.error(`\n  [${i + 1}/${statements.length}] ERROR: ${msg.slice(0, 200)}`);
      }
    }
  }

  console.log(`\n\nDone! ${ok} ok, ${skip} skipped, ${fail} failed`);
  await client.end();
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
