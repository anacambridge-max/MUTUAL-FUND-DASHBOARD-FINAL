#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  AI Mutual Fund Investment Decision Engine PRO — PERMANENT DEPLOY
#  Deploy to Vercel free tier in one command.
#
#  REQUIREMENTS:
#   - Node.js 18+ installed on your machine
#   - A free Vercel account (https://vercel.com/signup)
#
#  USAGE:
#   1) Open a terminal on THIS machine (where you run this script)
#   2) Run:  ./deploy.sh
#   3) First run asks you to log in to Vercel (browser opens once)
#   4) When finished, you get a PERMANENT URL like:
#      https://ai-fund-engine.vercel.app
# ═══════════════════════════════════════════════════════════════════

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   AI MUTUAL FUND INVESTMENT DECISION ENGINE PRO — DEPLOYER   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Install dependencies
echo "[1/5] Installing dependencies..."
npm install --silent

# 2. Build check
echo "[2/5] Verifying production build..."
npm run build

# 3. Install Vercel CLI
echo "[3/5] Installing Vercel CLI..."
npm install -g vercel

# 4. Login (first time only)
echo "[4/5] Checking Vercel login..."
if ! vercel whoami >/dev/null 2>&1; then
  echo "  → Opening browser for one-time login to Vercel..."
  vercel login
fi

# 5. Deploy to production
echo "[5/5] Deploying to production..."
vercel deploy --prod

echo ""
echo "✅ DEPLOY COMPLETE!"
echo "   Your PERMANENT dashboard URL is shown above (e.g. https://ai-fund-engine.vercel.app)"
echo ""
echo "   TIP: To update the dashboard later, just run:  ./deploy.sh"
echo ""
