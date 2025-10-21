/**
 * Neon-ready Postgres DB wrapper (TypeScript)
 * - Uses only DATABASE_URL environment variable (connection string)
 * - Enables TLS by default (Neon requires it)
 * - Exports connect(), query(), close()
 */
import dotenv from 'dotenv';
import postgres, { Sql } from 'postgres';

// Load .env in development if DATABASE_URL isn't already set
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

let sql: Sql | null = null;

function connect(): Sql {
  if (sql) return sql;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // Default TLS for Neon; allow overriding to disable in very specific cases
  const sslDisabled = (process.env.PGSSLMODE || '').toLowerCase() === 'disable' || process.env.PGSSLMODE === '0';
  const ssl = sslDisabled ? false : { rejectUnauthorized: false };

  sql = postgres(databaseUrl, {
    ssl,
    max: process.env.PG_MAX_CLIENTS ? Number(process.env.PG_MAX_CLIENTS) : 5,
  });

  console.log('🟢 Database client created');
  return sql;
}

async function query<T = any>(text: string, params?: any[]): Promise<T> {
  const client = connect();

  try {
    if (params && params.length) {
      // call as function with positional params
      const res = client(text, ...params);
      return res as unknown as Promise<T> as unknown as T;
    }

    const res = client(text);
    return res as unknown as Promise<T> as unknown as T;
  } catch (err: any) {
    console.error('DB query error:', err?.message ?? err);
    throw err;
  }
}

async function close(): Promise<void> {
  if (!sql) return;

  try {
    await sql.end({ timeout: 5 });
    sql = null;
    console.log('🟡 Database connection closed');
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
}

// Graceful shutdown
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((sig) => {
  try {
    process.on(sig, async () => {
      console.log(`Received ${sig}, closing DB connection...`);
      await close();
      process.exit(0);
    });
  } catch (e) {
    // ignore in environments that don't support signals
  }
});

export { connect, query, close };
