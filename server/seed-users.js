// Run this from the server folder: node seed-users.js
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const USERS = [
  { email: 'admin@supplyflow.com', password: 'Admin@123', full_name: 'Alex Morgan', role: 'admin', department: 'Executive' },
  { email: 'warehouse@supplyflow.com', password: 'Warehouse@123', full_name: 'Sam Rivera', role: 'manager', department: 'Warehouse Operations' },
  { email: 'transport@supplyflow.com', password: 'Transport@123', full_name: 'Jordan Lee', role: 'manager', department: 'Transportation' },
  { email: 'orders@supplyflow.com', password: 'Orders@123', full_name: 'Taylor Chen', role: 'operator', department: 'Order Fulfillment' },
  { email: 'viewer@supplyflow.com', password: 'Viewer@123', full_name: 'Casey Brooks', role: 'viewer', department: 'Analytics' },
];

async function seedUsers() {
  console.log('\n  Seeding default users...\n');

  for (const user of USERS) {
    const hash = await bcrypt.hash(user.password, 12);
    try {
      await sql`
        INSERT INTO profiles (email, password_hash, full_name, role, department)
        VALUES (${user.email}, ${hash}, ${user.full_name}, ${user.role}, ${user.department})
        ON CONFLICT (email) DO NOTHING
      `;
      console.log(`  ✓ ${user.role.padEnd(8)} | ${user.email.padEnd(30)} | Password: ${user.password}`);
    } catch (err) {
      console.log(`  ✗ ${user.email} — ${err.message}`);
    }
  }

  console.log('\n  Done! You can now sign in with any of the above credentials.\n');
}

seedUsers();
