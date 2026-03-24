# SupplyFlow — Setup Guide

Your local path: `C:\Users\jaisukh\my-projects\pharma-scm`

---

## STEP 1: Extract & Replace

Download the new zip from this chat. Replace everything in your `pharma-scm\supplyflow\` folder with the new contents.

---

## STEP 2: Set Up Neon Database (FREE, no credit card)

1. Go to **https://console.neon.tech**
2. Sign up with **GitHub** (one click)
3. Click **"New Project"** → name it `supplyflow` → Create
4. Once created, you'll see your **Connection Details**
5. Copy the connection string — it looks like:
   ```
   postgresql://neondb_owner:AbCdEfG123@ep-cool-rain-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Run the Database Schema

1. In Neon dashboard, click **"SQL Editor"** (left sidebar)
2. Open `server\db\schema.sql` from your project in any text editor
3. Copy ALL contents → paste into Neon SQL Editor → click **"Run"**
4. You should see "Query executed successfully"
5. Now open `server\db\seed.sql` → copy ALL → paste → **"Run"**
6. Demo data is now loaded

---

## STEP 3: Get Your Grok API Key

1. Go to **https://console.x.ai**
2. Sign up / Log in
3. Create an API key
4. Copy it: `xai-xxxxxxxxxxxx...`

---

## STEP 4: Create .env Files

### server\.env

Create this file at `pharma-scm\supplyflow\server\.env`:

```
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
XAI_API_KEY=xai-your-grok-key-here
JWT_SECRET=my-super-secret-key-for-jwt-tokens-2026
CLIENT_URL=http://localhost:5173
```

Replace `DATABASE_URL` with your actual Neon connection string from Step 2.
Replace `XAI_API_KEY` with your actual Grok key from Step 3.
`JWT_SECRET` can be any random string (just make it long).

### client\.env

Create this file at `pharma-scm\supplyflow\client\.env`:

```
VITE_API_URL=http://localhost:3001/api
```

---

## STEP 5: Install Dependencies

Open PowerShell in the `supplyflow` folder:

```powershell
cd client
npm install

cd ..\server
npm install
```

---

## STEP 6: Run the Application

Open TWO PowerShell windows:

### Window 1 — Frontend
```powershell
cd C:\Users\jaisukh\my-projects\pharma-scm\supplyflow\client
npm run dev
```

### Window 2 — Backend
```powershell
cd C:\Users\jaisukh\my-projects\pharma-scm\supplyflow\server
npx vercel dev --listen 3001
```

If Vercel CLI asks to link a project, choose **"N"** or just press Enter.

---

## STEP 7: Test

1. Open **http://localhost:5173** in your browser
2. Click **"Sign up"** — create an account (any email/password, it's your own DB)
3. You're now in the **Command Center**

### Test Checklist

| Test | What to do |
|------|-----------|
| Dashboard loads | Check KPI cards show numbers from seed data |
| WMS works | Click "Warehouse (WMS)" → see 5 warehouse cards → click one for zone details |
| TMS works | Click "Transport (TMS)" → see shipments table → filter by status |
| OMS works | Click "Orders (OMS)" → see orders → click eye icon for detail |
| Analytics works | Click "Analytics" → charts render with revenue/order data |
| AI Chat works | On any module page, click the floating chat bubble (bottom-right) → ask "What items are low on stock?" |

---

## STEP 8: Push to GitHub

```powershell
cd C:\Users\jaisukh\my-projects\pharma-scm\supplyflow
git init
git add .
git commit -m "SupplyFlow SCM Platform - Neon + Grok"
git remote add origin https://github.com/YOUR_USERNAME/pharma-scm.git
git branch -M main
git push -u origin main
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm install` fails | Make sure Node 18+ is installed: `node --version` |
| Login fails with "fetch error" | Check that server is running on port 3001 in the second terminal |
| Dashboard shows zeros | Make sure you ran `seed.sql` in Neon SQL Editor |
| AI chat returns error | Check `XAI_API_KEY` in `server/.env` is correct |
| "Cannot find module" | Run `npm install` in both `client/` and `server/` folders |
| CORS error in browser | Check `CLIENT_URL=http://localhost:5173` in `server/.env` |
| Neon connection error | Check `DATABASE_URL` in `server/.env` — must include `?sslmode=require` |
