import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
export const sql = neon(DATABASE_URL || '');

export async function query(text, params = []) {
  try {
    const rows = await sql(text, params);
    return { data: rows, error: null };
  } catch (err) {
    console.error('DB query error:', err.message);
    return { data: null, error: err };
  }
}

export async function queryOne(text, params = []) {
  const { data, error } = await query(text, params);
  if (error) return { data: null, error };
  return { data: data?.[0] || null, error: null };
}
