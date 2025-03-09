// utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAMmoPur5spAY-NxOkqYXTsoeSRBFjK_LI",
  authDomain: "goofies.firebaseapp.com",
  projectId: "goofies",
  storageBucket: "goofies.firebasestorage.app",
  messagingSenderId: "825953319756",
  appId: "1:825953319756:web:1dd7a151955dca828bede9"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

export { storage };
