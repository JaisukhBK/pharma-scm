import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Dynamic API route loader
const modules = ['auth','dashboard','warehouses','inventory','shipments','orders','carriers','analytics','ai-chat','forecast','reorders','tracking'];

for (const mod of modules) {
  const handler = await import(`./api/${mod}.js`);
  const route = `/api/${mod}`;
  app.all(route, (req, res) => handler.default(req, res));
  console.log(`  ✓ ${route}`);
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`\n  SupplyFlow API running → http://localhost:${PORT}\n`);
});
