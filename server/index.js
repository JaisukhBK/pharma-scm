import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// CORS — allow all origins in dev, specific origin in prod
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['*'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now during testing
    }
  },
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'SupplyFlow API', version: '1.0.0' });
});

// Dynamic API route loader
const modules = ['auth', 'dashboard', 'warehouses', 'inventory', 'shipments', 'orders', 'carriers', 'analytics', 'ai-chat', 'forecast', 'reorders', 'tracking'];

for (const mod of modules) {
  const handler = await import(`./api/${mod}.js`);
  const route = `/api/${mod}`;
  app.all(route, (req, res) => handler.default(req, res));
  console.log(`  ✓ ${route}`);
}

// For local development
const PORT = process.env.PORT || 3002;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n  SupplyFlow API running → http://localhost:${PORT}\n`);
  });
}

// For Vercel serverless
export default app;
