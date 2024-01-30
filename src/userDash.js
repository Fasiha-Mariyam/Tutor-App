import {
  getAuth,
  signInWithEmailAndPassword,
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
  getDoc,
  doc,
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
let loader = document.querySelector(".loader");
let mainContent = document.querySelector(".col-md-10");

// logout
const currentPage = window.location.pathname;
const logOut = document.getElementById("studentlogout");
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

// hello Student
let studentInfo, name;
let student = document.querySelector(".nameOfStudent");
let storedData = localStorage.getItem("user-info");
let id = storedData ? JSON.parse(storedData)?.id : null;
let email = storedData ? JSON.parse(storedData)?.email : null;
let infoCollection = collection(db, "Students", id, "PersonalInfo");
loader.style.display = "block";
mainContent.style.display = "none";
if (infoCollection) {
  onSnapshot(infoCollection, (snapshot) => {
    if (snapshot.size > 0) {
      snapshot.docs.forEach((doc) => {
        studentInfo = { ...doc.data() };
      });
    }
    loader.style.display = "none";
    mainContent.style.display = "block";
    name = studentInfo.name;
    student.innerHTML = "Student:" + name.toUpperCase();
  });
}

// profile update
const updateProfile = document.querySelector(".studentInfo");
if (updateProfile) {
  let stuName = updateProfile.name;
  let stuAge = updateProfile.age;
  let institute = updateProfile.institude;
  let stuclass = updateProfile.stuClass;
  let genderElement = updateProfile.gender;
  let infoID;
  onSnapshot(infoCollection, async (snapshot) => {
    if (snapshot.size > 0) {
      snapshot.docs.forEach((doc) => {
        studentInfo = { ...doc.data() };
        infoID = doc.id;
      });
    }
    stuName.value = studentInfo.name;
    stuAge.value = studentInfo.age;
    institute.value = studentInfo.institute;
    stuclass.value = studentInfo.class;
    genderElement.value = studentInfo.gender;
    console.log(infoID);
  });
  // update doc in firestore
  const updateInfo = document.getElementById("updateInfo");
  updateInfo.addEventListener("click", (e) => {
    e.preventDefault();
    let docRef = doc(db, "Students", id, "PersonalInfo", infoID);
    updateDoc(docRef, {
      name: stuName.value,
      age: stuAge.value,
      institute: institute.value,
      class: stuclass.value,
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

//request add request collection
const requestForm = document.getElementById("requestForm");
const reqCollection = collection(db, "Requests");
const reqteacher = document.getElementById("reqteacher");
const currentDate = new Date();
const formattedDateTime = currentDate.toLocaleString("en-GB");
if (reqteacher) {
  reqteacher.addEventListener("click", (e) => {
    e.preventDefault();
    let studentName = requestForm.name;
    let grade = requestForm.grade;
    let subject = requestForm.subject;
    let amount = requestForm.Amount;
    let time1 = requestForm.time1.value;
    let time2 = requestForm.time2.value;
    let timings = `${time1} - ${time2}`;

    if (
      studentName.value != "" &&
      subject.value != "" &&
      grade.value != "" &&
      amount.value != "" &&
      timings != ""
    ) {
      const reqData = {
        name: studentName.value,
        grade: grade.value,
        amount: amount.value,
        time: timings,
        StudentId: id,
        subject: subject.value,
        date: formattedDateTime,
        type: "pending",
      };
      addDoc(reqCollection, reqData);
      swal({
        title: "Success!",
        text: "Request Send!",
        type: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 5000,
      });
    } else {
      swal({
        title: "Error!",
        text: "Fill all fields!",
        type: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        timer: 5000,
      });
    }
    studentName.value = "";
    grade.value = "";
    subject.value = "";
    amount.value = "";
    requestForm.time1.value = "";
    requestForm.time2.value = "";
  });
}

// show user request
const reqTable = document.querySelector(".reqTable");
let docID;
let reqCount = 0;
if (reqTable) {
  const queryId = query(reqCollection, where("StudentId", "==", id));
  console.log(queryId);
  onSnapshot(queryId, (snapshots) => {
    reqTable.innerHTML = "";
    snapshots.docs.forEach((doc) => {
      reqCount++;
      const { name, subject, grade, amount, time, type } = doc.data();
      const newRow = reqTable.insertRow(0);
      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);
      const cell4 = newRow.insertCell(3);
      const cell5 = newRow.insertCell(4);
      const cell6 = newRow.insertCell(5);
      cell1.innerHTML = name;
      cell2.innerHTML = subject;
      cell3.innerHTML = grade;
      cell4.innerHTML = `Rs${amount}Pkr`;
      cell5.innerHTML = time;
      cell6.innerHTML = `<button class="btn btn-outline-dark text-primary btn-sm req-withdraw" data-req-id="${doc.id}">Withdraw</button>`;
    });
    console.log(reqCount);
    if (reqCount === 0) {
      reqTable.innerHTML = `<h4 class="text-secondary text-center">No Request Has Been Made</h4>`;
    }
    const reqButtons = document.querySelectorAll(".req-withdraw");
    reqButtons.forEach((button) => {
      button.addEventListener("click", () => {
        docID = button.getAttribute("data-req-id");
        const docRef = doc(db, "Requests", docID);
        swal(
          {
            title: "Are you sure?",
            text: "You will not be able to receive proposals!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false,
          },
          function (isConfirm) {
            if (isConfirm) {
              deleteDoc(docRef)
                .then(() => {
                  swal("Deleted!", "Your Request has been deleted.", "success");
                })
                .catch((error) => {
                  swal(
                    "Error",
                    "An error occurred while deleting the request.",
                    "error"
                  );
                  console.error("Error deleting document:", error);
                });
            } else {
              swal("Cancelled", "Your Request is safe :)", "error");
            }
          }
        );
      });
    });
  });
}

// pending request table
const pendingTable = document.querySelector(".pendingTable");
if (pendingTable) {
  const queryId = query(reqCollection, where("StudentId", "==", id));
  onSnapshot(queryId, (snapshots) => {
    pendingTable.innerHTML = "";
    snapshots.docs.forEach((doc) => {
      const { name, subject, grade, amount, time, type } = doc.data();
      const newRow = pendingTable.insertRow(0);
      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);
      const cell4 = newRow.insertCell(3);
      const cell5 = newRow.insertCell(4);
      const cell6 = newRow.insertCell(5);
      cell1.innerHTML = name;
      cell2.innerHTML = subject;
      cell3.innerHTML = grade;
      cell4.innerHTML = `Rs${amount}Pkr`;
      cell5.innerHTML = time;
      cell6.innerHTML = `<h5 class="text-secondary">${type}</h5>`;
    });
  });
}

// count number of pending proposals
const pendingCount = document.getElementById("pendingReqCount");
if (pendingCount) {
  let count = 0;
  const q = query(reqCollection, where("StudentId", "==", id));
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

// all proposals table + reject + accept button
const userProposals = document.querySelector(".proposalTable");
const propoCollection = collection(db, "Proposal");
const selectFilter = document.querySelector(".selectFilter");
let filterValue;
if (selectFilter) {
  selectFilter.addEventListener("change", () => {
    filterValue = selectFilter.value;
    console.log(filterValue);
    updateTable(filterValue);
  });
}
function updateTable(filterValue) {
  const queryId = query(propoCollection, where("studentID", "==", id));
  let pcount = 0;
  let acount = 0;
  let allCount = 0;
  if (userProposals) {
    onSnapshot(queryId, (snapshots) => {
      userProposals.innerHTML = "";

      snapshots.docs.forEach((doc) => {
        const {
          teacherId,
          teacherEmail,
          teacherName,
          teacherQualification,
          studentSubject,
          amount,
          time,
          msg,
          type,
        } = doc.data();

        if (
          type !== "rejected" &&
          (filterValue === "All" || type === filterValue)
        ) {
          const newRow = userProposals.insertRow(0);
          const cell1 = newRow.insertCell(0);
          const cell2 = newRow.insertCell(1);
          const cell3 = newRow.insertCell(2);
          const cell4 = newRow.insertCell(3);
          const cell5 = newRow.insertCell(4);
          const cell6 = newRow.insertCell(5);
          const cell7 = newRow.insertCell(6);

          cell1.innerHTML = teacherName;
          cell2.innerHTML = teacherQualification;
          cell3.innerHTML = studentSubject;
          cell4.innerHTML = `Rs${amount}Pkr`;
          cell5.innerHTML = time;
          cell6.innerHTML = msg;

          if (type === "pending") {
            pcount++;
            allCount++;
            console.log(pcount);
            cell7.innerHTML = `
            <div class="d-flex gap-1">
              <button class="btn btn-outline-success btn-sm accept" data-id=${doc.id}
                data-tename=${teacherName} data-teid=${teacherId} data-teemail=${teacherEmail} data-amount=${amount}
                data-time=${time} data-subject=${studentSubject}>Accept</button>
              <button class="btn btn-sm btn-outline-danger reject" data-id=${doc.id}>Reject</button>
            </div>`;
          } else if (type === "accepted") {
            cell7.innerHTML = `<div class="text-success">Accepted</div>`;
            acount++;
            allCount++;
            console.log(acount);
          }
        }
      });

      // Reject and accept buttons
      const rejBtn = document.querySelectorAll(".reject");
      const acceptBtn = document.querySelectorAll(".accept");

      rejBtn.forEach((button) => {
        button.addEventListener("click", () => {
          const docID = button.getAttribute("data-id");
          swal(
            {
              title: "Are you sure?",
              text: "You Want to Reject This Proposal!",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "red",
              confirmButtonText: "Yes, Reject it!",
              closeOnConfirm: false,
            },
            function (isConfirm) {
              if (isConfirm) {
                const docRef = doc(db, "Proposal",docID);
                updateDoc(docRef, {
                  type: "rejected",
                }).then(() => {
                  swal(
                    "This proposal has been Rejected.!",
                    "Teacher has been rejected",
                    "success"
                  );
                });
              }
            }
          );
        });
      });

      // accept btn
      acceptBtn.forEach((button) => {
        button.addEventListener("click", () => {
          docID = button.getAttribute("data-id");
          let tename = button.getAttribute("data-tename");
          let teemail = button.getAttribute("data-teemail");
          let teid = button.getAttribute("data-teid");
          let amount = button.getAttribute("data-amount");
          let time = button.getAttribute("data-time");
          let subject = button.getAttribute("data-subject");
          const docRef = doc(db, "Proposal", docID);

          console.log(docID);
          swal(
            {
              title: "Are you sure?",
              text: "You Want to Accept This Proposal!",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#008000",
              confirmButtonText: "Yes, Accept it!",
              closeOnConfirm: false,
            },
            function (isConfirm) {
              if (isConfirm) {
                const connectionColl = collection(db, "Connection");
                addDoc(connectionColl, {
                  userID: id,
                  userEmail: email,
                  userName: name,
                  teacherID: teid,
                  teacherName: tename,
                  teacherEmail: teemail,
                  subject: subject,
                  time: time,
                  type : "unpaid",
                  amount: amount,
                  proposalDocID: docID,
                  date: formattedDateTime,
                });
                updateDoc(docRef, {
                  type: "accepted",
                }).then(() => {
                  swal(
                    "This proposal has been Accepted.!",
                    "Teacher has been added to your connection",
                    "success"
                  );
                });
              }
            }
          );
        });
      });
      if (acount === 0 && filterValue == "accepted") {
        userProposals.innerHTML = `<h4 class="text-secondary text-center">No Proposals To Show</h4>`;
      } else if (pcount === 0 && filterValue == "pending") {
        userProposals.innerHTML = `<h4 class="text-secondary text-center">No Proposals To Show</h4>`;
      } else if (allCount === 0 && filterValue == "All") {
        userProposals.innerHTML = `<h4 class="text-secondary text-center">No Proposals To Show</h4>`;
      }
    });
  }
}
updateTable("All");

// count number of accepted proposals
const acceptedCount = document.getElementById("acceptedProCount");
if (acceptedCount) {
  let count = 0;
  const q = query(propoCollection, where("studentID", "==", id));
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

// proposal count
const proposalCount = document.getElementById("proposalsCount");
if (proposalCount) {
  let count = 0;
  const q = query(propoCollection, where("studentID", "==", id));
  onSnapshot(q, (Snapshot) => {
    count = 0;
    Snapshot.forEach((doc) => {
      const { type } = doc.data();

      if (type === "pending") {
        count++;
      }
    });
    proposalCount.innerHTML = count;
  });
}
// recent proposals
const proposals = document.querySelector('.proposals')
let proQuery = query(propoCollection, where("studentID", "==", id),orderBy("date", "asc"));
if(proposals){
  onSnapshot(proQuery, (snapshots) => {
    proposals.innerHTML = "";
    let count = 0;
    snapshots.docs.forEach((doc) => {
      if (count < 3) {
        const {
          teacherEmail,
          teacherName,
          time,
          type,
          amount,
          msg,
        } = doc.data();
 
        if(type == "pending"){
          proposals.innerHTML += `
          <div class="card cardwidth m-2" style="width: 18rem;">
            <div class="card-body">
              <h5 class="card-title">Teacher : ${teacherName}</h5>
              <h6 class="card-subtitle mb-2 text-body-secondary">Email : ${teacherEmail}</h6>
              <p class="card-text">Time : ${time}<br> Amount : ${amount} <br> Message : ${msg}<br></p>
            </div>
          </div>`;
        count++;
        }
      }
    });

    if (count === 0) {
      proposals.innerHTML = `<h5 class="text-secondary text-center">No Recent Proposal</h5>`;
    }
  });
}

// recent connection 
const connection = document.querySelector(".connection");
const connectCollection = collection(db, "Connection");
const connectionTable = document.querySelector(".connectionTable");
let q = query(connectCollection, where("userID", "==", id),orderBy("date", "asc"));
if (connection) {
  onSnapshot(q, (snapshots) => {
    connection.innerHTML = "";
    let count = 0;
    snapshots.docs.forEach((doc) => {
      if (count < 3) {
        const {
          userName,
          userEmail,
          teacherEmail,
          teacherName,
          time,
          amount,
          subject,
        } = doc.data();

        connection.innerHTML += `
          <div class="card cardwidth m-2" style="width: 18rem;">
            <div class="card-body">
              <h5 class="card-title">Teacher : ${teacherName}</h5>
              <h6 class="card-subtitle mb-2 text-body-secondary">Email : ${teacherEmail}</h6>
              <p class="card-text">Time : ${time}<br> Amount : ${amount} <br> Subject : ${subject}<br></p>
            </div>
          </div>`;
        count++;
      }
    });

    if (count === 0) {
      connection.innerHTML = `<h5 class="text-secondary text-center">No Teacher is in your Connection</h5>`;
    }
  });
}

// connection table
if (connectionTable) {
  onSnapshot(q, (snapshots) => {
    let count = 0;
    connectionTable.innerHTML = "";
    snapshots.docs.forEach((doc) => {
      const {
        type,
        userName,
        userEmail,
        teacherEmail,
        teacherName,
        time,
        amount,
        subject,
      } = doc.data();
      if (connectionTable) {
         if(type == "unpaid"){
          const newRow = connectionTable.insertRow(0);
          const cell1 = newRow.insertCell(0);
          const cell2 = newRow.insertCell(1);
          const cell3 = newRow.insertCell(2);
          const cell4 = newRow.insertCell(3);
          const cell5 = newRow.insertCell(4);
          const cell6 = newRow.insertCell(5);
          const cell7 = newRow.insertCell(6);
  
          cell1.innerHTML = teacherName;
          cell2.innerHTML = teacherEmail;
          cell3.innerHTML = subject;
          cell4.innerHTML = `Rs${amount}Pkr`;
          cell5.innerHTML = time;
          cell6.innerHTML = ` <button class="btn btn-outline-dark feePay" data-bs-toggle="modal" data-bs-target="#feesModal"
                               data-id=${doc.id} amount=${amount}>Pay Fees</button>`
          cell7.innerHTML = ` <button class="btn btn-outline-dark deleteConnection" 
                              data-id=${doc.id}>Remove Connection</button>`;
         }
         if(type == "paid"){
          const newRow = connectionTable.insertRow(0);
          const cell1 = newRow.insertCell(0);
          const cell2 = newRow.insertCell(1);
          const cell3 = newRow.insertCell(2);
          const cell4 = newRow.insertCell(3);
          const cell5 = newRow.insertCell(4);
          const cell6 = newRow.insertCell(5);
          const cell7 = newRow.insertCell(6);
  
          cell1.innerHTML = teacherName;
          cell2.innerHTML = teacherEmail;
          cell3.innerHTML = subject;
          cell4.innerHTML = `Rs${amount}Pkr`;
          cell5.innerHTML = time;
          cell6.innerHTML = `<h5 class='text-success'>${type}</h5>`
          cell7.innerHTML = ` <button class="btn btn-outline-dark deleteConnection" 
                              data-id=${doc.id}>Remove Connection</button>
                              `;
         }
      }
      count++;
    });
    console.log(count);
    const disconnect = document.querySelectorAll(".deleteConnection");
    const payfee = document.querySelectorAll('.feePay');
    // remove connectiion btn 
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
    // fee pay btn
    payfee.forEach((button) => {
      button.addEventListener("click", () => {
        let docID = button.getAttribute("data-id");
        let amount = button.getAttribute('amount')

        // show amount on modalamount input field
        let modal = document.getElementById('feesModal');
        modal.querySelector('#amount').value = amount;  
        let inputAmount = modal.querySelector('#amount').value;
        let submit = document.getElementById("donePayment")
        submit.addEventListener("click",(e)=>{
           e.preventDefault()
        const docRef = doc(db, "Connection", docID);
        updateDoc(docRef, {
          type: "paid",
        }).then(() => {
          swal({
            title: "Paid!",
            text: "Fees Has Been Paid.",
            timer: 2000
          });
          modal.querySelector('#amount').value = ""
        });
        })
        
      });
    });   
    if (count === 0) {
      connectionTable.innerHTML = `<h4 class="text-secondary text-center">No Teacher is in your Connection</h4>`;
    }
  });
}

// redirection
onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed:", user);
  if (
    !(currentPage.indexOf("/pages/user/stuDashboard.html") === -1 ||
    currentPage.indexOf("/pages/user/profile.html") === -1 ||
    currentPage.indexOf("/pages/user/request.html") === -1 ||
    currentPage.indexOf("/pages/user/allRequest.html") === -1 ||
    currentPage.indexOf("/pages/user/proposals.html") === -1 ||
    currentPage.indexOf("/pages/user/allConnections.html") === -1)
  ) {
    console.log("working1");
    authenticationRedirection();
  }
});
