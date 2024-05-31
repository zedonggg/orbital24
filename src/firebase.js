import { initializeApp } from "firebase/app";
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

// initialise firebase
const app = initializeApp(firebaseConfig);

// initialise firebase authentication
export const auth = getAuth(app);
export default app;