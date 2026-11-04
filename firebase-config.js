import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update, set } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAXbvtIH6HsWb0jduDabO9Qz8-UZkY0jOA",
  authDomain: "kansai-family-trip-2026.firebaseapp.com",
  databaseURL: "https://kansai-family-trip-2026-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kansai-family-trip-2026",
  storageBucket: "kansai-family-trip-2026.firebasestorage.app",
  messagingSenderId: "567305731001",
  appId: "1:567305731001:web:6d6f70d3294595a65c1468",
  measurementId: "G-ZKPNN1TE2S"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch(() => {});

window.db = db;
window.dbRef = ref;
window.dbPush = push;
window.dbSet = set;
window.dbOnValue = onValue;
window.dbRemove = remove;
window.dbUpdate = update;
window.auth = auth;
window.googleProvider = provider;
window.signInWithPopup = signInWithPopup;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;
