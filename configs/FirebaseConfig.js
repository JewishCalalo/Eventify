import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATPFm_KvzDiLCONQ5lCdLfonT1uTD6hL8",
  authDomain: "react-native-9fa26.firebaseapp.com",
  projectId: "react-native-9fa26",
  storageBucket: "react-native-9fa26.appspot.com",
  messagingSenderId: "940559759156",
  appId: "1:940559759156:web:54062ffa57232869ce5761",
  measurementId: "G-3JCE5PDV8X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage for persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Check if Analytics is supported before initializing
isSupported().then((supported) => {
  if (supported) {
    const analytics = getAnalytics(app);
    // You can use analytics here
  } else {
    console.warn("Firebase Analytics is not supported in this environment.");
  }
});
