# 🚀 Render.com Backend Deployment Guide

Follow these step-by-step instructions to deploy the backend API on Render.com (free tier).

---

## Prerequisites

- Your code is already on GitHub ✅
- You have a Render PostgreSQL database (already created at story-app-db)

---

## Step 1: Sign in to Render

1. Go to **https://render.com**
2. Click **"Get Started for Free"** or **"Sign In"**
3. Sign in with **GitHub** (recommended - easiest option)

---

## Step 2: Create a New Web Service

1. Click the **"New +"** button in the top right
2. Select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Click **"Connect"** next to your GitHub account
5. Find and select **`mini-project.github.io`** repository
6. Click **"Connect"**

---

## Step 3: Configure the Web Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `story-app-backend` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `master` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Instance Type** | Free |

---

## Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** and click **"Add Environment Variable"** for each:

### Required Variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | `postgresql://story_app_db_user:YOUR_PASSWORD@dpg-YOUR_ID.oregon-postgres.render.com/story_app_db` |
| `JWT_SECRET` | Generate a random string (click "Generate" button) |
| `JWT_REFRESH_SECRET` | Generate another random string |
| `FRONTEND_URL` | `https://nathanellevy-di.github.io` |

### To get your DATABASE_URL:
1. Go to Render Dashboard
2. Click on your PostgreSQL database (story-app-db)
3. Scroll down to **"Connections"**
4. Copy the **"External Database URL"**

---

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (3-5 minutes)
3. Once deployed, copy your backend URL (e.g., `https://story-app-backend.onrender.com`)

---

## Step 6: Update Frontend

After backend is deployed, you need to rebuild the frontend with the API URL:

### Option 1: Rebuild locally
```bash
# Set the API URL
export VITE_API_URL=https://story-app-backend.onrender.com/api

# Build and redeploy
npm run build --workspace=frontend
cd frontend/dist
git init && git checkout -b gh-pages
git add -A && git commit -m "Update API URL"
git remote add origin https://github.com/YOUR_USERNAME/mini-project.github.io.git
git push -f origin gh-pages
```

### Option 2: Use GitHub Actions (already set up)
1. Go to your repo → Settings → Secrets and variables → Actions
2. Add a new **Repository Variable**: `VITE_API_URL` = `https://story-app-backend.onrender.com/api`
3. Go to Actions tab and re-run the deployment workflow

---

## Step 7: Test Your Live Site

1. Visit: `https://nathanellevy-di.github.io/mini-project.github.io/`
2. Try registering a new account
3. Create a story
4. Share it!

---

## Troubleshooting

### Backend not responding
- Check the Render logs for errors
- Make sure DATABASE_URL is correct
- Verify the database tables exist (run setup script)

### CORS errors
- Make sure FRONTEND_URL is set correctly in Render
- The URL should NOT have a trailing slash

### Free tier limitations
- Backend spins down after 15 min of inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to paid tier for always-on service

---

## Your URLs

| Service | URL |
|---------|-----|
| Frontend (GitHub Pages) | `https://nathanellevy-di.github.io/mini-project.github.io/` |
| Backend (Render) | `https://story-app-backend.onrender.com` |
| API Base URL | `https://story-app-backend.onrender.com/api` |
