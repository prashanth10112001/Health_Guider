import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyC6KE-DrDKHHl8PcDDDMDlvWBVhnYCzbv4",
  authDomain: "mtech-project-a7835.firebaseapp.com",
  projectId: "mtech-project-a7835",
  storageBucket: "mtech-project-a7835.firebasestorage.app",
  messagingSenderId: "17005197841",
  appId: "1:17005197841:web:881b65c1c24573c1860fb0",
  measurementId: "G-G2CEPTSMYL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firebaseApp = initializeApp(firebaseConfig);