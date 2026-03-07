# Quick Start Guide

Get FilmFlow running in 5 minutes!

## Prerequisites

```bash
# Install Firebase CLI globally
npm install -g firebase-tools
```

## 1. Firebase Setup (2 minutes)

1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable **Authentication** → **Anonymous** sign-in
4. Enable **Firestore Database** (production mode)
5. Register a **Web App** and copy the config

## 2. Configure App (1 minute)

```bash
# Create environment file
cp .env.example .env

# Edit .env and paste your Firebase config
# Update .firebaserc with your project ID
```

## 3. Install & Run (1 minute)

```bash
# Install dependencies
npm install

# Run locally
npm run dev
```

Open http://localhost:5173 🎉

## 4. Deploy (1 minute)

```bash
# Login to Firebase
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Build and deploy
npm run deploy
```

Your app is now live at `https://YOUR-PROJECT-ID.web.app`!

## What You Get

✅ Progressive Web App (installable)  
✅ Anonymous authentication  
✅ Cloud database (Firestore)  
✅ Offline support  
✅ Free hosting with HTTPS  
✅ Global CDN  

## Customize

- Replace icons in `public/` (see `generate-icons.md`)
- Update colors in `vite.config.ts`
- Modify app name in `public/manifest.json`

## Need Help?

- Full guide: `README.md`
- Setup steps: `SETUP.md`
- Deployment checklist: `DEPLOYMENT_CHECKLIST.md`

## Common Issues

**"Permission denied" in Firestore**
→ Deploy security rules: `firebase deploy --only firestore:rules`

**Build fails**
→ Check `.env` has all Firebase config values

**Can't deploy**
→ Run `firebase login` and verify project ID in `.firebaserc`
