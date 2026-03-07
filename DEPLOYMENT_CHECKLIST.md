# Deployment Checklist

Use this checklist to ensure everything is configured correctly before deploying.

## Pre-Deployment

- [ ] Firebase project created
- [ ] Anonymous Authentication enabled in Firebase Console
- [ ] Firestore Database created in Firebase Console
- [ ] Web app registered in Firebase Console
- [ ] `.env` file created with all Firebase config values
- [ ] `.firebaserc` updated with correct project ID
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged into Firebase CLI (`firebase login`)

## Icons & Branding

- [ ] Replace `public/icon-192.png` with actual 192x192 icon
- [ ] Replace `public/icon-512.png` with actual 512x512 icon
- [ ] Update app name in `public/manifest.json` (optional)
- [ ] Update theme colors in `vite.config.ts` (optional)

## Security

- [ ] Firestore security rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Environment variables NOT committed to git (check `.gitignore`)
- [ ] `.env` file contains correct Firebase credentials

## Testing

- [ ] App runs locally (`npm run dev`)
- [ ] Can sign in anonymously
- [ ] Can create sessions
- [ ] Can edit sessions
- [ ] Can delete sessions
- [ ] Data persists after refresh
- [ ] No console errors

## Build & Deploy

- [ ] Build succeeds (`npm run build`)
- [ ] Preview build works (`npm run preview`)
- [ ] Deploy to Firebase (`npm run deploy`)
- [ ] Visit deployed URL and test all features
- [ ] Test PWA installation on mobile device
- [ ] Test offline functionality

## Post-Deployment

- [ ] Share app URL with users
- [ ] Monitor Firebase Console for usage
- [ ] Check Firebase quota usage (stay within free tier)
- [ ] Set up custom domain (optional)

## Firebase Free Tier Limits

Keep these in mind:
- **Authentication**: 10,000 verifications/month
- **Firestore Reads**: 50,000/day
- **Firestore Writes**: 20,000/day
- **Firestore Storage**: 1 GB
- **Hosting Storage**: 10 GB
- **Hosting Transfer**: 360 MB/day

## Useful Commands

```bash
# Login to Firebase
firebase login

# Deploy everything
npm run deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# View deployment history
firebase hosting:channel:list

# Open Firebase Console
firebase open
```
