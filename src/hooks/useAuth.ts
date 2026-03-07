import { useState, useEffect } from 'react';
import { 
  User, 
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      console.log('Attempting to sign in with Google...');
      const provider = new GoogleAuthProvider();
      
      // Add custom parameters for better Safari compatibility
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      console.log('Sign in successful:', result.user.uid);
    } catch (error: any) {
      console.error('Sign in failed:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup before completing sign in');
      } else if (error.code === 'auth/popup-blocked') {
        alert('Popup was blocked by the browser. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Multiple popup requests detected, only the latest will be processed');
      } else {
        alert('Sign in failed. Please try again or check the browser console for details.');
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return { user, loading, signIn, signOut };
}
