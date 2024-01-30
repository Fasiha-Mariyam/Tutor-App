import {
    getAuth,
    onAuthStateChanged,
    signOut
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
  appId: "1:682564598691:web:500472571c13fd27abf816"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth(app);
const teacherColl = collection(db,"Teachers")
const usersColl  = collection(db,"Students")
const adminColl = collection(db, "Admin");
const connColl = collection(db, "Connection");
const reqCollection = collection(db, "Requests");
const currentPage = window.location.pathname;
let loader = document.querySelector('.loader')
let mainContent = document.querySelector('.col-md-10')

const logOut = document.getElementById("adminlogout");
if (logOut) {
  logOut.addEventListener("click", () => {
    signOut(auth).then(() => {
        console.log('logout');
      localStorage.removeItem("user-info");
      window.location.href = "../../index.html";
      history.replaceState(null, "", "../../index.html");
    });
  });
}

// hello admin
let adminInfo;
let name;
let admin = document.querySelector(".nameOfAdmin");
loader.style.display = "block"
mainContent.style.display = "none"
onSnapshot(adminColl, (snapshot) => {
  if (snapshot.size > 0) {
    snapshot.docs.forEach((doc) => {
      adminInfo = { ...doc.data() };
    });
  }
  loader.style.display = "none"
mainContent.style.display = "block"
  name = adminInfo.name;
  admin.innerHTML = "Hello " + name.toUpperCase();
});

// showing users
let count=0;
let usertable = document.querySelector(".userTable")
if(usertable){
  onSnapshot(usersColl, (Snapshot) => {
    usertable.innerHTML = "";
    Snapshot.forEach((doc) => {
      count++
      const { email } = doc.data();
      let infoCollection = collection(db, "Students", doc.id, "PersonalInfo");
      let infoData;
      onSnapshot(infoCollection, (snapshot) => {
        if (snapshot.size > 0) {
          snapshot.docs.forEach((doc) => 
          {
          infoData = { ...doc.data() }
          });
        }
        const newRow = usertable.insertRow(0);
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);
        const cell6 = newRow.insertCell(5);

        cell1.innerHTML = infoData.name;
        cell2.innerHTML = email;
        cell3.innerHTML = infoData.age;
        cell4.innerHTML = infoData.gender;
        cell5.innerHTML = infoData.class;
        cell6.innerHTML = infoData.institute
      });
    });
    console.log(count);
  });
}

// users total count 
const userCount = document.getElementById("userCount");
if (userCount) {
  onSnapshot(usersColl, (Snapshot) => {
    Snapshot.forEach((doc) => {
      count++
    });
    userCount.innerHTML = count
  });
}

// total teachers
let techcount = 0;
let teachertable = document.querySelector(".teacherTable")
if(teachertable){
  onSnapshot(teacherColl, (Snapshot) => {
    teachertable.innerHTML = "";
    Snapshot.forEach((doc) => {
      techcount++
      const { email } = doc.data();
      let infoCollection = collection(db, "Teachers", doc.id, "PersonalInfo");
      let infoData;
      onSnapshot(infoCollection, (snapshot) => {
        if (snapshot.size > 0) {
          snapshot.docs.forEach((doc) => 
          {
          infoData = { ...doc.data() }
          });
        }
        const newRow = teachertable.insertRow(0);
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        const cell3 = newRow.insertCell(2);
        const cell4 = newRow.insertCell(3);
        const cell5 = newRow.insertCell(4);
        const cell6 = newRow.insertCell(5);

        cell1.innerHTML = infoData.name;
        cell2.innerHTML = email;
        cell3.innerHTML = infoData.age;
        cell4.innerHTML = infoData.gender;
        cell5.innerHTML = `${infoData.degree}-${infoData.statusOfDegree}`;
        cell6.innerHTML = infoData.institute
      });
    });
    console.log(techcount);
  });
}// teachers total count 
const teacherCount = document.getElementById("teacherCount");
if (teacherCount) {
  onSnapshot(teacherColl, (Snapshot) => {
    Snapshot.forEach((doc) => {
      techcount++
    });
    teacherCount.innerHTML = techcount
  });
}

// all connections
const connectionTable = document.querySelector('.connectionTable')
const table = document.querySelector('.table-responsive')
let connCount = 0;
if(connectionTable){
  onSnapshot(connColl, (Snapshot) => {
   
    connectionTable.innerHTML = "";
    Snapshot.forEach((doc) => {
      
      const { teacherName,userName ,amount,time,subject , type } = doc.data();
        if(type == "paid"){
          connCount++
          let share = amount* 0.20;
          const newRow = connectionTable.insertRow(0);
          const cell1 = newRow.insertCell(0);
          const cell2 = newRow.insertCell(1);
          const cell3 = newRow.insertCell(2);
          const cell4 = newRow.insertCell(3);
          const cell5 = newRow.insertCell(4);
          const cell6 = newRow.insertCell(5);
  
          cell1.innerHTML = teacherName;
          cell2.innerHTML = userName;
          cell3.innerHTML = amount;
          cell4.innerHTML = time;
          cell5.innerHTML = subject;
          cell6.innerHTML = `<h5 class='text-success'>${type} <span class="text-dark">your commission is</span> ${share}</h5>`
        }
        if(type == "unpaid"){
          connCount++
          const newRow = connectionTable.insertRow(0);
          const cell1 = newRow.insertCell(0);
          const cell2 = newRow.insertCell(1);
          const cell3 = newRow.insertCell(2);
          const cell4 = newRow.insertCell(3);
          const cell5 = newRow.insertCell(4);
          const cell6 = newRow.insertCell(5);
  
          cell1.innerHTML = teacherName;
          cell2.innerHTML = userName;
          cell3.innerHTML = amount;
          cell4.innerHTML = time;
          cell5.innerHTML = subject;
          cell6.innerHTML = `<h5 class='text-danger'>${type}</h5>`
        }
      });
      debugger
      console.log(connCount);
    
      if (connCount === 0) {
        connectionTable.innerHTML = ` No connection `;
      }
    });
}
// connections total count 
const connectionCount = document.getElementById("connectionCount");
if (connectionCount) {
  let info;
  onSnapshot(connColl, (Snapshot) => {
    Snapshot.forEach((doc) => {
      info = {...doc.data()}
      if(info.type == "paid" || info.type == "unpaid")
      connCount++
    });
    connectionCount.innerHTML = connCount
  });
}
// conn only 3
const connection = document.querySelector(".connection");
if(connection){
  onSnapshot(connColl, (snapshots) => {
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
          type,
        } = doc.data();
        if(type == "paid" || type == "unpaid"){
          count++;
          console.log(userEmail, userName, teacherEmail, teacherName);
        connection.innerHTML += `
        <div class="card cardwidth" style="width: 18rem;">
        <div class="card-body">
         <h5 class="card-title">Student-${userName},Teacher-${teacherName}</h5>
          <p class="card-text">Time : ${time}<br> Amount : ${amount} <br> Subject : ${subject}<br></p>
        </div>
      `;
        }
      
      }
    });
    if (count === 0) {
      connection.innerHTML = ` No Student is in Your connection `;
    }
  });
}

onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user);
  if( !(currentPage.indexOf("/pages/admin/adminDash.html") === -1 ||
      currentPage.indexOf("/pages/admin/allUsers.html") === -1   ||
      currentPage.indexOf("/pages/admin/allTeachers.html") === -1 ||
      currentPage.indexOf("/pages/admin/connections.html") === -1)
    ){
    console.log("working1");
    authenticationRedirection();
  }
});