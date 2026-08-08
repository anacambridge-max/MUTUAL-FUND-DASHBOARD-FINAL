# 🚀 Deploying Your AI Fund Engine PRO — Permanent Link Guide

The dashboard runs entirely **client-side + API routes** — it does NOT depend on the
sandbox database for the decision engine, so it deploys to any Node.js host as-is.

---

## Option A — Vercel (FREE, recommended, ~3 minutes)

1. Create a free account: **https://vercel.com/signup** (sign in with GitHub/Google)
2. On this machine, in the project folder, run:

```bash
npm install -g vercel
vercel login        # browser opens once — sign in
vercel deploy --prod
```

3. Done. You get a **PERMANENT URL** like `https://ai-fund-engine.vercel.app`
   which never changes and works 24/7.

Or use the automated script:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Option B — Netlify (FREE)

1. Account: **https://app.netlify.com/signup**
2. Install CLI: `npm install -g netlify-cli`
3. Run: `netlify deploy --prod` → link the folder, framework preset: **Next.js**

---

## Option C — Render (FREE)

1. Account: **https://render.com**
2. **New → Web Service** → connect this repo (GitHub/GitLab)
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Region: `Mumbai (ap-south-1)` for India-optimized speed

---

## Important Notes

| Item | Status |
|---|---|
| Database | Optional — the AI engine generates scores deterministically. The `DATABASE_URL` in `.env` works locally; on Vercel it's optional for the dashboard. |
| Auto-refresh | Dashboard auto-refreshes every 5 minutes + manual **Refresh All Data** button |
| The 15 funds | Hard-coded permanent list — never changes, no other funds ever recommended |

---

## Sandbox Preview (this environment)

While you work in this sandbox, use the platform preview link (shown in the
`build_and_start` result). It stays alive while the sandbox session is running —
restart it anytime from this conversation and the app comes right back up.
