import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    if (process.env.DATABASE_URL) {
      const postgres = (await import("postgres")).default;
      const client = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 5 });
      await client`SELECT 1`;
      await client.end();
      checks.database = "ok";
    } else {
      checks.database = "not_configured";
    }
  } catch {
    checks.database = "error";
  }

  checks.timestamp = new Date().toISOString();
  checks.version = process.env.npm_package_version || "0.1.0";
  checks.env = process.env.NODE_ENV || "development";

  const healthy = checks.database === "ok" || checks.database === "not_configured";

  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks },
    { status: healthy ? 200 : 503 }
  );
}
