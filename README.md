# SupplyFlow — AI-Powered Supply Chain Management Platform

Full-stack SCM platform with **Agentic AI** (xAI Grok) built into every module.

## Tech Stack

| Layer      | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS 3      |
| Backend   | Node.js serverless (Vercel)          |
| Database  | Neon (Serverless PostgreSQL)         |
| AI        | xAI Grok API (per-module agents)     |
| Auth      | JWT + bcrypt (self-contained)        |
| Deploy    | Vercel (CI/CD from GitHub)           |

## Modules

- **WMS** — Warehouse Management (inventory, zones, pick/pack, receiving)
- **TMS** — Transportation Management (shipments, carriers, routes, tracking)
- **OMS** — Order Management (order lifecycle, fulfillment, returns)
- **Analytics** — Cross-module dashboards and KPIs
- **AI Agents** — Dedicated Grok-powered AI assistant per module

## Quick Start

```bash
# 1. Install
cd client && npm install
cd ../server && npm install

# 2. Create .env files (see .env.example in each folder)

# 3. Run schema + seed SQL in Neon SQL Editor

# 4. Run
cd client && npm run dev          # Terminal 1
cd server && npx vercel dev --listen 3001  # Terminal 2

# 5. Open http://localhost:5173
```
