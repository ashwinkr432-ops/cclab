import { getFirestore } from "firebase/firestore";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC4rd_82kmVCE3TFnOh6RXX8r4vdFl-rOo",
  authDomain: "ashwin-900d0.firebaseapp.com",
  projectId: "ashwin-900d0",
  storageBucket: "ashwin-900d0.firebasestorage.app",
  messagingSenderId: "518725901780",
  appId: "1:518725901780:web:bd5b00d3f1f6c67d0eca41",
  measurementId: "G-1G3RMT09E3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export {app,analytics,db};