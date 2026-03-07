# FilmFlow - Decision Analytics Engine

A Progressive Web App (PWA) for tracking and analyzing your movie decision-making process. Built with React, Firebase, and deployed on Firebase Hosting.

## Features

- 📱 Progressive Web App - Install on any device
- 🔐 Firebase Authentication (Anonymous)
- 💾 Cloud Firestore for data storage
- 📊 Real-time analytics and visualizations
- 🎨 Beautiful, cinematic UI
- ⚡ Offline support with service workers

## Prerequisites

- Node.js (v18 or higher)
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project (free tier works perfectly)

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Google Analytics (optional)

### 2. Enable Firebase Services

#### Enable Authentication:
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Anonymous" authentication

#### Enable Firestore:
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in "production mode"
4. Choose a location close to your users
5. Update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. Register Web App

1. In Firebase Console, click the gear icon → "Project settings"
2. Scroll to "Your apps" section
3. Click the web icon (`</>`)
4. Register your app with a nickname (e.g., "FilmFlow")
5. Copy the Firebase configuration object

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration from step 3:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### 5. Update Firebase Project ID

Edit `.firebaserc` and replace `your-project-id` with your actual Firebase project ID.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Deployment to Firebase

### First-time Setup

1. Login to Firebase CLI:
   ```bash
   firebase login
   ```

### Deploy

Deploy to Firebase Hosting:
```bash
npm run deploy
```

Your app will be live at: `https://your-project-id.web.app`

## PWA Features

The app uses service workers to cache assets and enable offline functionality. Users can install it on their devices and view previously loaded data even without internet.

## Firebase Free Tier

The app works within Firebase's free tier:
- Authentication: 10K verifications/month
- Firestore: 50K reads/day, 20K writes/day, 1 GB storage
- Hosting: 10 GB storage, 360 MB/day transfer

## License

Apache-2.0
