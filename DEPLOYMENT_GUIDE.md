# QualiSight AI — Cloud Deployment Guide

This guide walks you through deploying **QualiSight AI** completely free on **Vercel** (Frontend), **Render/Railway** (Backend), and **Supabase/SQLite** (Database).

---

## 1. Prerequisites
- A free [GitHub](https://github.com/) account
- A free [Render](https://render.com/) or [Railway](https://railway.app/) account
- A free [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) account
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) *(optional for live AI, app has built-in simulation fallback)*

---

## 2. Push Code to GitHub
1. In the root directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - QualiSight AI platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/qualisight-ai.git
   git push -u origin main
   ```

---

## 3. Backend Deployment (Render.com)

1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Configure the settings:
   - **Name:** `qualisight-api`
   - **Region:** Any close region (e.g. Frankfurt, Oregon, Singapore)
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
5. Add **Environment Variables**:
   - `PORT`: `5000`
   - `JWT_SECRET`: `<any_secure_random_string>`
   - `GEMINI_API_KEY`: `<your_google_gemini_api_key>`
   - `SQLITE_DB_PATH`: `./database.sqlite`
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://qualisight-api.onrender.com`).

---

## 4. Frontend Deployment (Vercel)

1. Log in to [vercel.com](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit and select `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add **Environment Variables**:
   - `VITE_API_URL`: `https://qualisight-api.onrender.com` *(your Render backend URL)*
6. Click **Deploy**.
7. Your app is now live at `https://qualisight-ai.vercel.app`!

---

## 5. Alternative Database: Cloud PostgreSQL (Supabase / Neon)
If you wish to switch from local SQLite to Supabase PostgreSQL:
1. Create a free project at [supabase.com](https://supabase.com/).
2. In Supabase SQL Editor, run the schema creation scripts found in `server/config/db.js`.
3. Provide your Supabase database connection string in your backend environment variables.

---

## 6. Verification Checklist
- [ ] Visit `https://<your-render-url>/api/health` — should return `status: "healthy"`.
- [ ] Open the frontend URL on Vercel.
- [ ] Click **"1-Click Instant Demo Access"** on the login page.
- [ ] Run an inspection with the sample specimen or upload an image.
- [ ] Confirm results and verify that the inspection appears in **Audit History**.
