import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore();
const auth = getAuth(app);
const adminCollection = collection(db, "Admin");
const studentCollection = collection(db, "Students");
const teacherCollection = collection(db, "Teachers");

// password
const showPassword = document.getElementById("check");
showPassword
  ? showPassword.addEventListener("click", () => {
      var x = document.getElementById("myInput");
      if (x.type === "password") {
        x.type = "text";
        showPassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16" style="position: absolute; top: 50%; right: 5px; transform: translateY(-50%);">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>`;
      } else {
        x.type = "password";
        showPassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"id="" width="20" height="20" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16"  style="position: absolute; top: 50%; right: 5px; transform: translateY(-50%);">
        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
      </svg>`;
      }
    })
  : null;

// login
const login = document.querySelector(".login");
if(login){
  login.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("loader").style.display = "block";
    document.querySelector(".loginBtn").style.visibility  = "hidden";
    let email = login.email.value;
    let password = login.password.value;
  
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
    
      if (cred.user) {
        console.log("Login successful", cred.user.email);
        swal({
          title: "Success",
          text: "User Loged In Successfully",
          type: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
          timer:5000
        });
        const admin = query(adminCollection, where("email", "==", email));
        const student = query(studentCollection, where("email", "==", email));
        const teacher = query(teacherCollection, where("email", "==", email));
        let userId;
    
        onSnapshot(admin, (adminSnapshot) => {
          if (adminSnapshot.size > 0) {
            adminSnapshot.forEach((doc) => {
              userId = doc.id;
            });
            console.log("UserId from Firestore:", userId);
    
            localStorage.setItem(
              "user-info",
              JSON.stringify({
                id: userId,
                email: email,
                type: "admin",
              })
            );
            console.log("User info stored in localStorage");
            window.location.href = "./admin/adminDash.html";
            history.replaceState(null, "", "./admin/adminDash.html");
          }
        });
        onSnapshot(student, (studentSnapshot) => {
          if (studentSnapshot && studentSnapshot.size > 0) {
            studentSnapshot.forEach((doc) => {
              userId = doc.id;
            });
            console.log("UserId from Firestore:", userId);
            localStorage.setItem(
              "user-info",
              JSON.stringify({
                id: userId,
                email: email,
                type: "student",
              })
            );
            console.log("User info stored in localStorage");
            window.location.href = "./user/stuDashboard.html";
            history.replaceState(null, "", "./user/stuDashboard.html");
          }
        });
        onSnapshot(teacher, (teacherSnapshot) => {
          if (teacherSnapshot && teacherSnapshot.size > 0) {
            teacherSnapshot.forEach((doc) => {
              userId = doc.id;
            });
            console.log("teacherId from Firestore:", userId);
    
            localStorage.setItem(
              "user-info",
              JSON.stringify({
                id: userId,
                email: email,
                type: "teacher",
              })
            );
            console.log("teacher info stored in localStorage");
            window.location.href = "./techer/teacherDash.html";
            history.replaceState(null, "", "./techer/teacherDash.html");
          }
        });
      }
    } catch (error) {
      swal({
        title: "Error!",
        text: "Invalid Credentials. Please check your email and password.",
        type: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6"
      });
      document.getElementById("loader").style.display = "none";
      document.querySelector(".loginBtn").style.visibility = "visible";
    }
    
  });
}

// forget
const resetPassword = document.querySelector(".forget");
if (resetPassword) {
  resetPassword.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = resetPassword.email.value;

    const teacherQuery = query(teacherCollection, where("email", "==", email));
    const adminQuery = query(adminCollection, where("email", "==", email));
    const studentQuery = query(studentCollection, where("email", "==", email));

    sendPasswordResetEmail(auth, email).then(() => {
      Promise.all([getDocs(teacherQuery), getDocs(adminQuery), getDocs(studentQuery)])
        .then(([teacherSnapshot, adminSnapshot, studentSnapshot]) => {
          if (teacherSnapshot.size > 0 || adminSnapshot.size > 0 || studentSnapshot.size > 0) {
            let msg = "Email has been sent";
            let div = document.querySelector(".msg");
            div.innerHTML = msg;
            div.style.color = "blue";
            resetPassword.reset();
          } else {
            let msg = "Email doesn't exist";
            let div = document.querySelector(".msg");
            div.innerHTML = msg;
            div.style.color = "red";
          }
        })
        .catch((error) => {
          console.error("Error querying collections:", error);
        });
    });
  });
}
