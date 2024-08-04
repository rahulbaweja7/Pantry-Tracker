// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "inventory-management-9ea83.firebaseapp.com",
  projectId: "inventory-management-9ea83",
  storageBucket: "inventory-management-9ea83.appspot.com",
  messagingSenderId: "776700726899",
  appId: "1:776700726899:web:34596af90c0f97fa9b6406",
  measurementId: "G-FYV8P2YBDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };›