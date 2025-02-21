import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA1YwSHIG3JmL4gW8ReC5dJN9Oqjz50c4k",
  authDomain: "mlprojectgoogleapi.firebaseapp.com",
  projectId: "mlprojectapi-9dc62",
  storageBucket: "mlprojectapi-9dc62.appspot.com",
  messagingSenderId: "306843491387",
  appId: "1:306843491387:web:xxx-xxx-xxx"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();