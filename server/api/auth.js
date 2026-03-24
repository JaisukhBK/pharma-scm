import bcrypt from 'bcryptjs';
import { query, queryOne } from '../lib/db.js';
import { apiSuccess, apiError, parseBody, signToken } from '../lib/middleware.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return apiError(res, 405, 'Method not allowed');

  const body = await parseBody(req);
  const { action, email, password, full_name } = body;

  if (!email || !password) {
    return apiError(res, 400, 'Email and password required');
  }

  try {
    // ─── SIGN UP ──────────────────────────────────
    if (action === 'signup') {
      // Check if user exists
      const { data: existing } = await queryOne(
        'SELECT id FROM profiles WHERE email = $1', [email.toLowerCase()]
      );
      if (existing) {
        return apiError(res, 400, 'Email already registered');
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 12);

      // Insert user
      const { data: user, error } = await queryOne(
        `INSERT INTO profiles (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, 'viewer')
         RETURNING id, email, full_name, role, created_at`,
        [email.toLowerCase(), password_hash, full_name || email.split('@')[0]]
      );

      if (error) return apiError(res, 500, 'Failed to create account');

      const token = signToken({ id: user.id, email: user.email, role: user.role });

      return apiSuccess(res, { user, token }, 201);
    }

    // ─── SIGN IN ──────────────────────────────────
    if (action === 'signin') {
      const { data: user, error } = await queryOne(
        'SELECT id, email, full_name, role, password_hash FROM profiles WHERE email = $1',
        [email.toLowerCase()]
      );

      if (error || !user) {
        return apiError(res, 401, 'Invalid email or password');
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return apiError(res, 401, 'Invalid email or password');
      }

      // Don't send password_hash to client
      const { password_hash: _, ...safeUser } = user;
      const token = signToken({ id: safeUser.id, email: safeUser.email, role: safeUser.role });

      return apiSuccess(res, { user: safeUser, token });
    }

    return apiError(res, 400, 'Invalid action. Use "signup" or "signin"');
  } catch (err) {
    console.error('Auth error:', err);
    return apiError(res, 500, 'Authentication failed');
  }
}
