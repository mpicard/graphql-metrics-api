import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

export const db = new Pool({ connectionString });
