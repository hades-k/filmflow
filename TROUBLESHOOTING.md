# Troubleshooting Guide

## Issue: Redirects to `**` after deployment

If you see `**` in the URL after deploying, try these solutions:

### Solution 1: Clear Cache and Hard Refresh
1. Open your deployed URL
2. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. Or open DevTools → Network tab → Check "Disable cache" → Refresh

### Solution 2: Rebuild and Redeploy
```bash
# Clean old build
npm run clean

# Build fresh
npm run build

# Deploy again
firebase deploy --only hosting
```

### Solution 3: Check Firebase Hosting Status
```bash
# List your deployments
firebase hosting:channel:list

# Check if deployment completed
firebase hosting:sites:list
```

### Solution 4: Verify Build Output
Check that `dist/index.html` exists and contains your app:
```bash
ls -la dist/
cat dist/index.html
```

### Solution 5: Test Locally First
Before deploying, test the production build locally:
```bash
npm run build
npm run preview
```
Open http://localhost:4173 - if it works here, the issue is with Firebase deployment.

### Solution 6: Check Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your project
3. Go to "Hosting" in left sidebar
4. Check deployment status
5. Click on your domain to test

### Solution 7: Use Incognito/Private Window
Sometimes browser extensions or cached service workers cause issues:
1. Open an incognito/private window
2. Visit your Firebase URL
3. Test if it works there

### Solution 8: Check Environment Variables
Make sure your `.env` file has all Firebase config values:
```bash
cat .env
```

All these should be filled in:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

### Solution 9: Verify Firebase Project ID
Check that `.firebaserc` has your correct project ID:
```bash
cat .firebaserc
```

Should match your Firebase project ID (not "your-project-id").

### Solution 10: Check Browser Console
1. Open your deployed URL
2. Press F12 to open DevTools
3. Check Console tab for errors
4. Check Network tab for failed requests

## Common Error Messages

### "Failed to load resource"
- Build didn't complete properly
- Run `npm run build` again

### "Firebase: Error (auth/...)"
- Check `.env` has correct Firebase config
- Verify Anonymous auth is enabled in Firebase Console

### "Permission denied" in Firestore
- Deploy security rules: `firebase deploy --only firestore:rules`
- Check rules in Firebase Console → Firestore → Rules

### Blank white screen
- Check browser console for errors
- Verify all environment variables are set
- Test locally with `npm run preview`

## Still Having Issues?

1. Check Firebase status: https://status.firebase.google.com/
2. Review Firebase logs: `firebase hosting:logs`
3. Try deploying to a preview channel first:
   ```bash
   firebase hosting:channel:deploy preview
   ```

## Quick Reset

If nothing works, try a complete reset:

```bash
# Clean everything
npm run clean
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run build

# Redeploy
firebase deploy
```

## Get Your Deployment URL

```bash
firebase hosting:sites:list
```

Or check Firebase Console → Hosting → Your domain will be listed there.
