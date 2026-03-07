# FilmFlow Setup Guide

Quick start guide to get your FilmFlow PWA running on Firebase.

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Create Firebase Project

1. Visit https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name (e.g., "filmflow-app")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 3: Enable Required Services

### Enable Anonymous Authentication

1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Anonymous"
5. Toggle "Enable"
6. Click "Save"

### Enable Firestore Database

1. In Firebase Console, click "Firestore Database" in left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location (select closest to your users)
5. Click "Enable"

## Step 4: Register Web App

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon (`</>`)
5. Enter app nickname: "FilmFlow"
6. Check "Also set up Firebase Hosting"
7. Click "Register app"
8. Copy the firebaseConfig object

## Step 5: Configure Your App

1. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```

2. Paste your Firebase config into `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=filmflow-app.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=filmflow-app
   VITE_FIREBASE_STORAGE_BUCKET=filmflow-app.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "filmflow-app"
     }
   }
   ```

## Step 6: Deploy Firestore Rules

```bash
firebase login
firebase deploy --only firestore:rules
```

## Step 7: Test Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 and test the app.

## Step 8: Deploy to Firebase

```bash
npm run deploy
```

Your app will be live at: `https://filmflow-app.web.app`

## Step 9: Install as PWA

### On Mobile (iOS/Android)
1. Open the app URL in Safari/Chrome
2. Tap the Share button
3. Tap "Add to Home Screen"

### On Desktop (Chrome/Edge)
1. Open the app URL
2. Click the install icon in the address bar
3. Click "Install"

## Troubleshooting

### "Permission denied" errors
- Check that Anonymous auth is enabled
- Verify Firestore rules are deployed
- Make sure user is signed in before accessing data

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check that all environment variables are set in `.env`

### Can't deploy
- Run `firebase login` to authenticate
- Verify project ID in `.firebaserc` matches your Firebase project
- Check that you have Owner/Editor role in Firebase project

## Next Steps

- Replace placeholder icons in `public/` with your own 192x192 and 512x512 PNG images
- Customize theme colors in `vite.config.ts`
- Add more features to the app
- Monitor usage in Firebase Console

## Support

- Firebase Docs: https://firebase.google.com/docs
- Vite PWA: https://vite-pwa-org.netlify.app/
