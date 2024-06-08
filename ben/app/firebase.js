import { getApps, initializeApp } from "firebase/app";
import fb from "firebase/app"
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAUORJKoiUJnzlSOXDHRGkjefSVRQSRFKo",
    authDomain: "orbital-ben.firebaseapp.com",
    projectId: "orbital-ben",
    storageBucket: "orbital-ben.appspot.com",
    messagingSenderId: "817178875865",
    appId: "1:817178875865:web:b2b2c060297aeecb686bc8",
    measurementId: "G-GQTGMQ1LRX"
  };

  const isFirebaseRunning = () => !!(getApps().length);
// initialise firebase
// const firebase_app = initializeApp(firebaseConfig);

// initialise firebase authentication

let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export default firebase_app;