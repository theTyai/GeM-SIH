import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gothic-pen-htxfk",
  appId: "1:713098920736:web:ff2c570994a6d1ba638d45",
  apiKey: "AIzaSyC5yd9u5cq9FLJajnXZbTMOInc5b-qYjAM",
  authDomain: "gothic-pen-htxfk.firebaseapp.com",
  storageBucket: "gothic-pen-htxfk.firebasestorage.app",
  messagingSenderId: "713098920736",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
