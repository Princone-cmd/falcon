import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  Timestamp,
  query,
  orderBy,
  limit,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

var units = '';
var category = '';

const firebaseConfig = {
  apiKey: "AIzaSyC_WPVeu0vT-tmcYffq8iLmOjCjUTwEJYg",
  authDomain: "falcon-4548f.firebaseapp.com",
  projectId: "falcon-4548f",
  storageBucket: "falcon-4548f.appspot.com",
  messagingSenderId: "542434801277",
  appId: "1:542434801277:web:c082f5217af3b2b8b6a314",
  measurementId: "G-JKMTVFMB8C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("login").onclick = function(){
  var phone = document.getElementById("phoneNumber").value;
  var password = document.getElementById("password").value;
  if(phone != '' & password != ''){
    getDocs(query(collection(db, "seller"), where('phone', "==", phone))).then(docSnap => {
      docSnap.forEach((doc) => {
        if(doc.data()['password'] == password){
          setLocalData(phone);
          myFunction();
        }else{
          alert('Enter valid Password');
        }
      });
    });

  }
};

function myFunction() {
    location.replace('../htmls/dashboard.html');
}

function setLocalData(phone){
  localStorage.setItem('phone', phone);
}
