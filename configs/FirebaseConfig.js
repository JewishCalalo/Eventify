// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
