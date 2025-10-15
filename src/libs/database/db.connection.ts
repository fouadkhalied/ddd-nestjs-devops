import { Pool } from 'pg'; // normal Postgres Pool
import { drizzle } from 'drizzle-orm/node-postgres'; // normal Drizzle client
import * as schema from './drizzle.schema';
import { appConfig } from '../config/app.config';

const config = appConfig();

if (!config.DATABASE_URL) {
  throw new Error('❌ Missing DATABASE_URL');
}

// DATABASE_URL example: postgres://user:password@host:port/dbname?sslmode=require
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
