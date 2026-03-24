import { neon } from '@neondatabase/serverless';

// Neon serverless driver — uses HTTP, perfect for Vercel
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️  Missing DATABASE_URL — database calls will fail');
}

// Create a SQL query function
export const sql = neon(DATABASE_URL || '');

// Helper: run a query and return rows
export async function query(text, params = []) {
  try {
    const rows = await sql(text, params);
    return { data: rows, error: null };
  } catch (err) {
    console.error('DB query error:', err.message);
    return { data: null, error: err };
  }
}

// Helper: run a query and return first row
export async function queryOne(text, params = []) {
  const { data, error } = await query(text, params);
  if (error) return { data: null, error };
  return { data: data?.[0] || null, error: null };
}
