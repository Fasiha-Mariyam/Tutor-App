import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  query,
  doc,
  getDoc,
  orderBy,
  where,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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
const db = getFirestore();
const auth = getAuth(app);
const currentPage = window.location.pathname;
let loader = document.querySelector('.loader')
let mainContent = document.querySelector('.col-md-10')

// logout
const logOut = document.getElementById("teacherlogout");
if (logOut) {
  logOut.addEventListener("click", () => {
    signOut(auth).then(() => {
      console.log("logout");
      localStorage.removeItem("user-info");
      window.location.href = "../../index.html";
      history.replaceState(null, "", "../../index.html");
    });
  });
}

// hello teacher
let teacherInfo;
let name, qualification;
let teacher = document.querySelector(".nameOfTeacher");
let storedData = localStorage.getItem("user-info");
let id = storedData ? JSON.parse(storedData)?.id : null;
let email = storedData ? JSON.parse(storedData)?.email : null;
let infoCollection = collection(db, "Teachers", id, "PersonalInfo");
loader.style.display = "block"
mainContent.style.display = "none"
if(teacher){
  onSnapshot(infoCollection, (snapshot) => {
    if (snapshot.size > 0) {
      snapshot.docs.forEach((doc) => {
        teacherInfo = { ...doc.data() };
      });
    }
    
    loader.style.display = "none"
    mainContent.style.display = "block"
    name = teacherInfo.name;
    qualification = `${teacherInfo.degree}-${teacherInfo.statusOfDegree}`;
    teacher.innerHTML = "Teacher:" + name.toUpperCase();
  });
}

// show request in table
const tbody = document.querySelector(".reqTable");
const reqCollection = collection(db, "Requests");
let studentName, subject, studentId;
if (tbody) {
  let reqCount = 0;
onSnapshot(reqCollection, (Snapshot) => {
  reqCount++
    tbody.innerHTML = "";
    Snapshot.forEach((doc) => {
      const { type } = doc.data();

      if (type === "pending") {
        const newRow = tbody.insertRow(0);
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);
        const cell6 = newRow.insertCell(5);

        const { name, grade, subject, amount, time, StudentId } = doc.data();
        cell1.innerHTML = name;
        cell2.innerHTML = subject;
        cell3.innerHTML = grade;
        cell4.innerHTML = `Rs${amount}Pkr`;
        cell5.innerHTML = time;
        cell6.innerHTML = `<td>
        <button class="btn btn-outline-dark proposal-btn" data-bs-toggle="modal" data-student-name="${name}" data-subject="${subject}" 
        data-student-id="${StudentId}" data-req-id="${doc.id}" data-bs-target="#exampleModal">Proposal</button></td>`;
      }
    });
    console.log(reqCount);
    const proposalButtons = document.querySelectorAll(".proposal-btn");
    proposalButtons.forEach((button) => {
      button.addEventListener("click", () => {
        studentName = button.getAttribute("data-student-name");
        subject = button.getAttribute("data-subject");
        studentId = button.getAttribute("data-student-id");
      });
    });
  });
}
// proposal request send to proposal database
const proposalCollection = collection(db, "Proposal");
const submit = document.getElementById("submitBtn");
const currentDate = new Date();
const formattedDateTime = currentDate.toLocaleString("en-GB");
if (submit) {
  submit.addEventListener("click", async (e) => {
    e.preventDefault();
    let amountInput = document.getElementById("amountInput");
    let msgInput = document.getElementById("msgInput");
    let timeInput1 = document.getElementById("timeInput1");
    let timeInput2 = document.getElementById("timeInput2");
    let time = `${timeInput1.value} - ${timeInput2.value}`

    if (
      amountInput.value !== "" &&
      timeInput1.value !== "" &&
      msgInput.value !== ""  &&
      timeInput2.value !== ""
    ) {
      if (amountInput.value < 0) {
        swal({
          title: "Error!",
          text: "Amount Should Be Positive!",
          type: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6",
          timer: 5000,
        });
        amountInput.value = "";
        timeInput1.value = "";
        msgInput.value = "";
        timeInput2.value = "";
        return;
      }
    } else {
      swal({
        title: "Error!",
        text: "Fill all the Fields!",
        type: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 5000,
      });
      amountInput.value = "";
      timeInput1.value = "";
      msgInput.value = "";
      timeInput2.value = "";
      return;
    }
    const proposalInfo = {
      amount: amountInput.value,
      time: time,
      msg: msgInput.value,
      studentName: studentName,
      teacherQualification: qualification,
      teacherName: name,
      teacherEmail: email,
      teacherId: id,
      studentSubject: subject,
      studentID: studentId,
      date: formattedDateTime,
      type: "pending",
    };
    addDoc(proposalCollection, proposalInfo);
    swal({
      title: "Success!",
      text: "Proposal Send!",
      type: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
      timer: 5000,
    });
    amountInput.value = "";
    timeInput.value = "";
    msgInput.value = "";
  });
}

// show proposals in table
const proposalTable = document.querySelector(".proposalTable");
const proCollection = collection(db, "Proposal");
const selectFilter = document.querySelector(".selectFilter");
let filterValue;
// get selected value and filter table acc to it
if (selectFilter) {
  selectFilter.addEventListener("change", () => {
    filterValue = selectFilter.value;
    console.log(filterValue);
    updateTable(filterValue);
  });
}
function updateTable(filterValue) {
  let count = 0;
  const q = query(proCollection, where("teacherId", "==", id));
if(proposalTable){
  
  onSnapshot(q, (Snapshot) => {
    proposalTable.innerHTML = "";

    Snapshot.forEach((doc) => {
      const { studentName, studentSubject, msg, amount, time, type } =
        doc.data();

      // Check if the proposal matches the selected filter value
      if (filterValue === "All" || type === filterValue) {
        count++;
        const newRow = proposalTable.insertRow(0);
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);
        const cell6 = newRow.insertCell(5);

        cell1.innerHTML = studentName;
        cell2.innerHTML = studentSubject;
        cell3.innerHTML = `Rs${amount}Pkr`;
        cell4.innerHTML = time;
        cell5.innerHTML = msg;
        cell6.innerHTML = type;

        // Set color based on the type
        if (type === "pending") {
          cell6.style.color = "grey";
        } else if (type === "accepted") {
          cell6.style.color = "green";
        } else if (type === "rejected") {
          cell6.style.color = "red";
        }
      }
      loader.style.display = "none"
      mainContent.style.display = "block"
    });

    if (count === 0) {
      proposalTable.innerHTML = `<h4 class="text-secondary text-center">No Proposal to show</h4>`;
    }
  });
}
}
updateTable("All");

// count number of pending proposals
const pendingCount = document.getElementById("pendingCount");
if (pendingCount) {
  let count = 0;
  const q = query(proCollection, where("teacherId", "==", id));
  onSnapshot(q, (Snapshot) => {
    count = 0;
    Snapshot.forEach((doc) => {
      const { type } = doc.data();

      if (type === "pending") {
        count++;
      }
    });
    pendingCount.innerHTML = count;
  });
}
// count number of accepted proposals
const acceptedCount = document.getElementById("acceptedCount");
if (acceptedCount) {
  let count = 0;
  const q = query(proCollection, where("teacherId", "==", id));
  onSnapshot(q, (Snapshot) => {
    count = 0;
    Snapshot.forEach((doc) => {
      const { type } = doc.data();

      if (type === "accepted") {
        count++;
      }
    });
    acceptedCount.innerHTML = count;
  });
}
// count number of rejected proposals
const rejectedCount = document.getElementById("rejectedCount");
if (rejectedCount) {
  let count = 0;
  const q = query(proCollection, where("teacherId", "==", id));
  onSnapshot(q, (Snapshot) => {
    count = 0;
    Snapshot.forEach((doc) => {
      const { type } = doc.data();

      if (type === "rejected") {
        count++;
      }
    });
    rejectedCount.innerHTML = count;
  });
}
// profile update
const updateProfile = document.querySelector(".teacherInfo");
if (updateProfile) {
  loader.style.display = "block"
mainContent.style.display = "none"
  let teachName = updateProfile.name;
  let teachAge = updateProfile.age;
  let institute = updateProfile.institude;
  let degree = updateProfile.degree;
  let status = updateProfile.select;
  let genderElement = updateProfile.gender;
  let infoID;
  onSnapshot(infoCollection, async (snapshot) => {
    if (snapshot.size > 0) {
      snapshot.docs.forEach((doc) => {
        teacherInfo = { ...doc.data() };
        infoID = doc.id;
      });
    }
    teachName.value = teacherInfo.name;
    teachAge.value = teacherInfo.age;
    institute.value = teacherInfo.institute;
    degree.value = teacherInfo.degree;
    status.value = teacherInfo.statusOfDegree;
    genderElement.value = teacherInfo.gender;
    console.log(infoID);
    
  loader.style.display = "none"
  mainContent.style.display = "block"
  });
  // update doc in firestore
  const updateInfo = document.getElementById("updateInfo");
  updateInfo.addEventListener("click", (e) => {
    e.preventDefault();
    let docRef = doc(db, "Teachers", id, "PersonalInfo", infoID);
    updateDoc(docRef, {
      name: teachName.value,
      age: teachAge.value,
      institute: institute.value,
      degree: degree.value,
      statusOfDegree: status.value,
      gender: genderElement.value,
    }).then(() => {
      swal({
        title: "Success!",
        text: "Profile Updated Successfully!",
        type: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 5000,
      });
    });
  });
}
// recent requests
const Requests = document.querySelector('.Requests')
let reqQuery = query(reqCollection , orderBy("date", "desc"));
if(Requests){
  onSnapshot(reqQuery, (snapshots) => {
    Requests.innerHTML = "";
    let count = 0;
    snapshots.docs.forEach((doc) => {
      if (count < 3) {
        const {
          grade,
          name,
          time,
          type,
          amount,
          subject,
        } = doc.data();
 
        if(type == "pending"){
          Requests.innerHTML += `
          <div class="card cardwidth m-2" style="width: 18rem;">
            <div class="card-body">
              <h5 class="card-title">Student : ${name}</h5>
              <h6 class="card-subtitle mb-2 text-body-secondary">Class : ${grade}</h6>
              <p class="card-text">Time : ${time}<br> Amount : ${amount} <br> Subject : ${subject}<br></p>
            </div>
          </div>`;
        count++;
        }
      }
    });

    if (count === 0) {
      Requests.innerHTML = `<h5 class="text-secondary text-center">No Recent Request</h5>`;
    }
  });
}

// recent connection
const connection = document.querySelector(".connection");
const connectCollection = collection(db, "Connection");
const connectionTable = document.querySelector(".connectionTable")
let q = query(connectCollection,where("teacherID", "==", id),orderBy("date", "desc"));
if(connection){
  onSnapshot(q, (snapshots) => {
    let count = 0;
    snapshots.docs.forEach((doc) => {
      if(count < 3){
        const {
          userName,
          userEmail,
          teacherEmail,
          teacherName,
          time,
          amount,
          subject,
        } = doc.data();
        console.log(userEmail, userName, teacherEmail, teacherName);
        connection.innerHTML += `
        <div class="card cardwidth" style="width: 18rem;">
        <div class="card-body">
         <h5 class="card-title">Student : ${userName}</h5>
          <h6 class="card-subtitle mb-2 text-body-secondary">Email : ${userEmail}</h6>
          <p class="card-text">Time : ${time}<br> Amount : ${amount} <br> Subject : ${subject}<br></p>
        </div>
      `;
        count++;
      }
    });
    if (count === 0) {
      connection.innerHTML = `<h5 class="text-secondary text-center">No Student is in your Connection</h5>`;
    }
  });
}
// connection table
if(connectionTable){
  onSnapshot(q, (snapshots) => {
    let count = 0;
    connectionTable.innerHTML = ""
    snapshots.docs.forEach((doc) => {
      const {
        type,
        userName,
        userEmail,
        time,
        amount,
        subject,
      } = doc.data();
      if(connectionTable){
     
        if(type == "unpaid"){
          const newRow = connectionTable.insertRow(0);
          const cell1 = newRow.insertCell(0);
          const cell2 = newRow.insertCell(1);
          const cell3 = newRow.insertCell(2);
          const cell4 = newRow.insertCell(3);
          const cell5 = newRow.insertCell(4);
          const cell6 = newRow.insertCell(5);
          const cell7 = newRow.insertCell(6);
  
          cell1.innerHTML = userName;
          cell2.innerHTML = userEmail;
          cell3.innerHTML = subject;
          cell4.innerHTML = `Rs${amount}Pkr`;
          cell5.innerHTML = time;
          cell6.innerHTML = ` <h5 class='text-danger'>${type}</h5>`
          cell7.innerHTML = ` <button class="btn btn-outline-dark deleteConnection" 
                              data-id=${doc.id}>Remove Connection</button>`;
         }
         if(type == "paid"){
          let deduction = amount - (amount * 0.20);
  
          const newRow = connectionTable.insertRow(0);
          const cell1 = newRow.insertCell(0);
          const cell2 = newRow.insertCell(1);
          const cell3 = newRow.insertCell(2);
          const cell4 = newRow.insertCell(3);
          const cell5 = newRow.insertCell(4);
          const cell6 = newRow.insertCell(5);
          const cell7 = newRow.insertCell(6);
  
          cell1.innerHTML = userName;
          cell2.innerHTML = userEmail;
          cell3.innerHTML = subject;
          cell4.innerHTML = `Rs${amount}Pkr`;
          cell5.innerHTML = time;
          cell6.innerHTML = `<div class='d-flex align-items-center gap-2'><p class='text-success text-decoration-underline fw-bold'>${type} <span class='text-dark'>after 20% deduction</span> ${deduction}</p>
          <button class="btn btn-sm btn-outline-success text-center detailBtn"  data-id=${doc.id} data-bs-toggle="modal" data-bs-target="#detailsModal"
          ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
        </svg></button></div>`
          cell7.innerHTML = ` <button class="btn btn-outline-dark deleteConnection" 
                              data-id=${doc.id}>Remove Connection</button>`;
         }
       }
      count++;
    });
    console.log(count);
    loader.style.display = "none"
    mainContent.style.display = "block"
    // remove connection
    const disconnect = document.querySelectorAll(".deleteConnection");
    disconnect.forEach((button) => {
      button.addEventListener("click", () => {
        let proposalID;
        let docID = button.getAttribute("data-id");
        const docRef = doc(db, "Connection", docID);
        getDoc(docRef).then((snapshot) => {
          if (snapshot.exists()) {
            proposalID = { ...snapshot.data() };
            console.log(proposalID.proposalDocID);
          }
        });
        console.log(docID);
        swal(
          {
            title: "Are you sure?",
            text: "You Want to Remove This COnnection! Proposal will also  delete",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "red",
            confirmButtonText: "Yes, Remove Connection!",
            closeOnConfirm: false,
          },
          function (isConfirm) {
            if (isConfirm) {
              let docRef = doc(db, "Connection", docID);
              let proRef = doc(db, "Proposal", proposalID.proposalDocID);
              deleteDoc(docRef).then(() => console.log("Connection removed"));
              deleteDoc(proRef)
                .then(() => console.log("Proposal removed"))
                .then(() => {
                  swal("Connection removed!", "Proposal removed", "success");
                });
            }
          }
        );
      });
    });

    const details = document.querySelectorAll('.detailBtn')
    const totalAmount = document.getElementById('amount');
    const deductAmount = document.getElementById('deductAmount');
    details.forEach((button) => {
      button.addEventListener("click", () => {
        let fees;
        let amount;
        let docID = button.getAttribute("data-id");
        const docRef = doc(db, "Connection", docID);
        getDoc(docRef).then((snapshot) => {
          if (snapshot.exists()) {
            fees = { ...snapshot.data() };
            amount = fees.amount
            let deduction = amount * 0.20;
            totalAmount.value = amount
            deductAmount.value = deduction
          }
        });
      });
    });
    
    if (count === 0) {
      connectionTable.innerHTML = `<h5 class="text-secondary text-center">No Student is in your Connection</h5>`;
    }
  });
}

// redirection
onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed:", user);
  if (
    !(
      currentPage.indexOf("/pages/techer/userRequest.html") !== -1 ||
      currentPage.indexOf("/pages/techer/teacherDash.html") !== -1 ||
      currentPage.indexOf("/pages/techer/proposal.html") !== -1 ||
      currentPage.indexOf("/pages/techer/profile.html") !== -1 ||
      currentPage.indexOf("/pages/techer/allConnections.html") !== -1
    )
  ) {
    debugger;
    authenticationRedirection();
  }
});
