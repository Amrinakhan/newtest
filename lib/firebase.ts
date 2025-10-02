import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCZEkci4tbwNN72GpO9YQMwmYAn1PXxrpg",
  authDomain: "fortesting-826e9.firebaseapp.com",
  projectId: "fortesting-826e9",
  storageBucket: "fortesting-826e9.firebasestorage.app",
  messagingSenderId: "854432403647",
  appId: "1:854432403647:web:ae1a5c6c5f5463373af60a"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
