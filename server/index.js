import express from 'express';
import cors from 'cors';

import authHandler from './api/auth.js';
import dashboardHandler from './api/dashboard.js';
import warehousesHandler from './api/warehouses.js';
import inventoryHandler from './api/inventory.js';
import shipmentsHandler from './api/shipments.js';
import ordersHandler from './api/orders.js';
import carriersHandler from './api/carriers.js';
import analyticsHandler from './api/analytics.js';
import aiChatHandler from './api/ai-chat.js';
import forecastHandler from './api/forecast.js';
import reordersHandler from './api/reorders.js';
import trackingHandler from './api/tracking.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', service: 'SupplyFlow API', version: '1.0.0' }));

// API routes — all in one function
app.all('/api/auth', authHandler);
app.all('/api/dashboard', dashboardHandler);
app.all('/api/warehouses', warehousesHandler);
app.all('/api/inventory', inventoryHandler);
app.all('/api/shipments', shipmentsHandler);
app.all('/api/orders', ordersHandler);
app.all('/api/carriers', carriersHandler);
app.all('/api/analytics', analyticsHandler);
app.all('/api/ai-chat', aiChatHandler);
app.all('/api/forecast', forecastHandler);
app.all('/api/reorders', reordersHandler);
app.all('/api/tracking', trackingHandler);

// Local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => console.log(`\n  SupplyFlow API → http://localhost:${PORT}\n`));
}

export default app;
