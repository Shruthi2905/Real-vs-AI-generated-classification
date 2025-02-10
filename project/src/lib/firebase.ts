import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA1YwSHIG3JmL4gW8ReC5dJN9Oqjz50c4k",
    authDomain: "mlprojectapi-9dc62.firebaseapp.com",
    projectId: "mlprojectapi-9dc62",
    storageBucket: "mlprojectapi-9dc62.firebasestorage.app",
    messagingSenderId: "306843491387",
    appId: "1:306843491387:web:43a68a45f3346f1548d01e",
    measurementId: "G-4FPVD33ZJ7"
  };

let app;
let auth;
export const googleProvider = new GoogleAuthProvider();

export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "";
};

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth };