import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged
  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { authenticationRedirection } from "../src/utils.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcd7-tBzI0-SOCBI_p3ou3ZmKOdEWG3YM",
  authDomain: "tutor-application-932d2.firebaseapp.com",
  projectId: "tutor-application-932d2",
  storageBucket: "tutor-application-932d2.appspot.com",
  messagingSenderId: "682564598691",
  appId: "1:682564598691:web:500472571c13fd27abf816"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);
const colref = collection(db, "Teachers");

// show password
const showPassword = document.getElementById("check");
showPassword? showPassword.addEventListener("click", () => {
      var x = document.getElementById("myInput");
      if (x.type === "password") {
        x.type = "text";
        showPassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16" style="position: absolute; top: 50%; right: 5px; transform: translateY(-50%);">
        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>`
      } else {
        x.type = "password";
        showPassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"id="" width="20" height="20" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16"  style="position: absolute; top: 50%; right: 5px; transform: translateY(-50%);">
        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
      </svg>`
      }
    })
  : null;

// get info of teacher
const teacherInfo = document.querySelector(".teacherInfo");
if (teacherInfo) {
  teacherInfo.addEventListener("submit", (e) => {
    e.preventDefault();

    let name = teacherInfo.name.value;
    let age = teacherInfo.age.value;
    let institute = teacherInfo.institude.value;
    let degree = teacherInfo.degree.value;
    let status = teacherInfo.select.value ;
    let genderElement = teacherInfo.querySelector('input[name="gender"]:checked');
    let gender = genderElement ? genderElement.value : null;

    teacherInfo.name.value = "";
    teacherInfo.age.value = "";
    teacherInfo.institude.value = "";
    teacherInfo.degree.value = "";
    genderElement.value = false
    teacherInfo.select.value = ''
    window.location.href = `./teacherSignup2.html?name=${name}&age=${age}&institute=${institute}&degree=${degree}&status=${status}&gender=${gender}`;
  });
}
// signup user , save user email and id in localStorage
const teacherEmailPass = document.querySelector(".register");
if (teacherEmailPass) {
  teacherEmailPass.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.getElementById("loader").style.display = "block";
    document.querySelector(".regBtn").style.visibility = "hidden";
    let email = teacherEmailPass.email.value;
    let password = teacherEmailPass.password.value; 
    let userID;

    // Continue with teacher registration using email and password
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      swal({
        title: "Success!",
        text: "SignUp Successful",
        type: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 5000,
      });
      if (user) {
        const teacherDocRef = await addDoc(colref, {
          email: email,
        });
        userID = teacherDocRef.id;
      }
      await saveToFirestore(userID);
      teacherEmailPass.email.value = "";
      teacherEmailPass.password.value = "";

      console.log("Teacher registered successfully:", userID);
      document.getElementById("loader").style.display = "none";
      document.querySelector(".regBtn").style.visibility = "visible";
      window.location.href = "../login.html";
      history.replaceState(null, "", "../login.html");
      authenticationRedirection();
     
    } 
    catch (error) {
      console.error("Error registering user:", error.message);
    }
  });
}
// add teacher information in personalInfo
async function saveToFirestore(userId) {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const age = params.get("age");
  const institute = params.get("institute");
  const degree = params.get("degree");
  const status = params.get("status")
  const gender = params.get("gender");

  const infoCollection = collection(colref, userId, "PersonalInfo");

  try {
    // Create a "students" collection and add a document for each student
    const teacherDocRef = await addDoc(infoCollection, {
      name: name,
      age: age,
      institute: institute,
      degree: degree,
      statusOfDegree: status,
      gender: gender,
      type: "teacher",
    });

    console.log("Document written with ID:", teacherDocRef.id);
  } catch (error) {
    console.error("Error adding document:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed:", user);
  if ( user && localStorage.getItem('user-info') !==  null) {
    debugger;
    authenticationRedirection();
  }
});