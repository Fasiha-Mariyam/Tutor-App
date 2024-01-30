import {
  onAuthStateChanged,
  getAuth,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

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

let storedData = localStorage.getItem("user-info");
let type = storedData ? JSON.parse(storedData)?.type : null;
console.log(type);

const currentPage = window.location.pathname;

export function authenticationRedirection() {
  console.log("working");
  debugger;
  if (type === "student" && currentPage.indexOf("/pages/user/stuDashboard.html") === -1) {
    if (currentPage.indexOf("/pages/user/userSignup.html") !== -1 ||
        currentPage.indexOf("/pages/user/userSignup2.html") !== -1 ) 
        {
      window.location.href = "./stuDashboard.html";
    } else if(currentPage.indexOf("/pages/login.html") !== -1){
      window.location.href = "./user/stuDashboard.html";
    }
    else{
      window.location.href = "./pages/user/stuDashboard.html";
    }
  } 
  else if (type === "admin" && currentPage.indexOf("/pages/admin/adminDash.html") === -1) 
  {
    window.location.href = "./pages/admin/adminDash.html";
  } 
  else if (type === "teacher" && (currentPage === "/pages/techer/teacherDash.html") !== 1) {
   if (
      currentPage.indexOf("/pages/techer/teacherSignup.html") !== -1 ||
      currentPage.indexOf("/pages/techer/teacherSignup2.html") !== -1
    ) {
      window.location.href = "./teacherDash.html";
      } 
      else if(currentPage.indexOf("/pages/login.html") !== -1){
        window.location.href = "./techer/teacherDash.html";
      }
      else{
        window.location.href = "./pages/techer/teacherDash.html";
      }
  } 
  else if ( (type === null &&
      (currentPage.indexOf("/pages/user/userSignup.html") !== -1 ||
      currentPage.indexOf("/pages/user/userSignup2.html") !== -1)) ||
    currentPage.indexOf("/pages/techer/teacherSignup2.html") !== -1 ||
    currentPage.indexOf("/pages/techer/teacherSignup.html") !== -1  ||
    currentPage.indexOf("/index.html") !== -1 
  ) {
    window.location.href = "/pages/login.html";
  }
}
