# 🎬 FilmFlow - Decision Analytics Engine

> Track, analyze, and visualize your movie decision-making process with beautiful real-time analytics.

A Progressive Web App that helps you understand your movie selection patterns, identify decision fatigue, and optimize your viewing choices through data-driven insights.

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

## 📸 Screenshots

<img width="1510" height="823" alt="Screenshot 2026-03-18 at 22 00 36" src="https://github.com/user-attachments/assets/999a6c29-706f-4694-be92-374d7b421dc0" />

<img width="1510" height="823" alt="Screenshot 2026-03-18 at 22 18 16" src="https://github.com/user-attachments/assets/3bc821dc-5777-46a4-aace-1ab4f8b82781" />

<img width="1510" height="823" alt="Screenshot 2026-03-18 at 22 18 20" src="https://github.com/user-attachments/assets/3f4cbe2c-1dc9-4d72-aca8-c22e698df6bc" />

<img width="1510" height="823" alt="Screenshot 2026-03-18 at 22 18 39" src="https://github.com/user-attachments/assets/3220b554-81d0-4744-b5ef-0dc31ddf7de7" />

## ✨ Features

### 📊 Analytics & Insights
- **Decision Time Tracking** - Monitor how long it takes to pick a movie
- **Trend Analysis** - See if you're getting faster or slower over time
- **Fatigue Score** - Identify decision fatigue patterns (0-10 scale)
- **Temporal Distribution** - Discover which days you take longest to decide
- **Visual Charts** - Beautiful area and bar charts with Recharts

### 🔐 Authentication & Security
- **Google Sign-In** - Secure authentication via Firebase Auth
- **User Isolation** - Each user's data is completely private
- **Firestore Rules** - Server-side security enforcement
- **Safari Compatible** - Fixed React hooks for Safari/iOS support

### 📱 Progressive Web App
- **Install Anywhere** - Works on desktop, mobile, and tablet
- **Offline Support** - Service workers cache data for offline viewing
- **Responsive Design** - Beautiful UI that adapts to any screen size
- **Fast Loading** - Optimized with Vite for instant page loads

### 🎨 User Experience
- **Cinematic Design** - Film-inspired aesthetic with grain effects
- **Smooth Animations** - Framer Motion for delightful interactions
- **Dark Theme** - Easy on the eyes for late-night browsing
- **Real-time Updates** - Instant feedback on all actions

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Firebase CLI**: `npm install -g firebase-tools`
- **Firebase Account** (free tier works perfectly)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/filmflow.git
cd filmflow

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase credentials
# (See Firebase Setup section below)

# Start development server
npm run dev
```

Visit `http://localhost:5173` and you're ready to go! 🎉

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "filmflow")
4. Follow the setup wizard

### 2. Enable Authentication

1. Navigate to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Google** provider
4. Add your domain to **Authorized domains** (for production)

### 3. Enable Firestore Database

1. Navigate to **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose a location close to your users
4. Go to **Rules** tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Create Firestore Index

**Important:** You need a composite index for queries to work.

Click this link after deploying (replace with your project ID):
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes
```

Or create manually:
- Collection: `sessions`
- Fields: `userId` (Ascending), `date` (Descending)

### 5. Register Web App

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** → Click web icon (`</>`)
3. Register app with nickname "FilmFlow"
4. Copy the config object

### 6. Configure Environment

Edit `.env` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run lint

# Deploy to Firebase
npm run deploy
```

### Project Structure

```
filmflow/
├── src/
│   ├── App.tsx              # Main application component
│   ├── firebase.ts          # Firebase configuration
│   ├── hooks/
│   │   └── useAuth.ts       # Authentication hook
│   ├── services/
│   │   └── sessionService.ts # Firestore CRUD operations
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # Helper functions
├── public/                  # Static assets
├── firestore.rules          # Firestore security rules
├── firebase.json            # Firebase hosting config
└── .env                     # Environment variables (not in git)
```

## 🚢 Deployment

### Deploy to Firebase Hosting

```bash
# Login to Firebase (first time only)
firebase login

# Build and deploy
npm run deploy
```

Your app will be live at: `https://your-project-id.web.app`

### Deploy to Other Platforms

The app is a standard Vite build, so you can deploy to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag `dist/` folder to Netlify
- **GitHub Pages**: Use `gh-pages` package

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Backend**: Firebase (Auth + Firestore)
- **Hosting**: Firebase Hosting
- **PWA**: Vite PWA Plugin

## 📊 How It Works

1. **Sign In** - Authenticate with Google
2. **Log Sessions** - Record movie title, decision time, and rating
3. **View Analytics** - See trends, patterns, and fatigue scores
4. **Track Progress** - Monitor if you're getting faster or slower
5. **Optimize** - Use insights to improve your decision-making

### Data Tracked

- **Duration**: Time spent deciding (MM:SS format)
- **Title**: Movie name (optional)
- **Rating**: Your rating 1-10 (optional)
- **Date**: When the decision was made
- **Trends**: Calculated automatically from your history

## 🔒 Security & Privacy

- **User Isolation**: Each user can only access their own data
- **Firestore Rules**: Server-side security enforcement
- **No Tracking**: No analytics or third-party tracking
- **Open Source**: Audit the code yourself

### Are Firebase API Keys Secret?

**No** - Firebase API keys in client code are designed to be public. Security comes from:
- Firestore security rules (not the API key)
- Authentication requirements
- Authorized domains configuration

Read more: [Firebase API Keys Documentation](https://firebase.google.com/docs/projects/api-keys)

## 🐛 Troubleshooting

### "Failed to fetch sessions" Error

Create the required Firestore index:
1. Check browser console for the index creation link
2. Click the link and create the index
3. Wait 1-2 minutes for it to build

### Black Screen After Login (Safari)

This was fixed in the latest version. Make sure you:
1. Have the latest code
2. Rebuilt with `npm run build`
3. Cleared browser cache

### Charts Not Displaying

Charts show "No data to display" until you log your first session. Add a session to see the visualizations.

## 📚 Additional Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Fast setup guide
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [GITHUB_SAFETY_CHECKLIST.md](./GITHUB_SAFETY_CHECKLIST.md) - Security guidelines

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for the excellent backend platform
- Recharts for beautiful data visualizations
- The React and Vite communities

## 💬 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [Firebase Documentation](https://firebase.google.com/docs)

---

Made with ❤️ for movie lovers who want to optimize their decision-making process.
