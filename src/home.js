import {
    getAuth,
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { authenticationRedirection } from "./utils.js";
  
  const firebaseConfig = {
    apiKey: "AIzaSyAcd7-tBzI0-SOCBI_p3ou3ZmKOdEWG3YM",
    authDomain: "tutor-application-932d2.firebaseapp.com",
    projectId: "tutor-application-932d2",
    storageBucket: "tutor-application-932d2.appspot.com",
    messagingSenderId: "682564598691",
    appId: "1:682564598691:web:500472571c13fd27abf816",
  };
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  let loader = document.querySelector('.loader')
  let mainContent = document.querySelector('body')

  onAuthStateChanged(auth, (user) => {

    console.log("Auth state changed:", user);
    if (
      user !== null
    ) {
      debugger;
      authenticationRedirection();
    }
  });