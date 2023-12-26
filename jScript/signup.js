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

document.getElementById("signup").onclick = function() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  var address = document.getElementById("address").value;
  var hub = document.getElementById("hub").value;
  var phone = document.getElementById("number").value;
  var pincode = document.getElementById("pincode").value;

  if (name != "" && email != '' && validate_password() && validate_pincode() && address != "" && phone != "") {

    let pincodes = [];

    if (pincode.includes(',') | pincode.includes('.')) {
      pincode.split(/[ .,]+/).forEach((item, i) => {
        pincodes.push(parseInt(item));
      });

    } else {
      pincodes.push(parseInt(pincode));
    }

    setSellerDataToFirebase(name, email, phone, hub, password, pincodes, address);
  }
};

var pincodesOfSeller = [];
var pincodeList = [];

onSnapshot(doc(db, 'doodle', "logo"), doc => {
  pincodeList = doc.data()['pincodes'];
});

function dashFunction() {
  location.replace('../htmls/dashboard.html');
}

function validate_email(input) {}

function validate_pincode() {
  if (document.getElementById("pincode").value.length == 6) {
    return true;
  } else {
    return false;
  }
}

function validate_password() {
  var passwordField = document.getElementById('password');

  if (passwordField.value >= 6) {
    return true;
  } else {
    return false;
  }

}

function setSellerDataToFirebase(name, email, phone, hub, password, pincode, address) {

  setDoc(doc(db, "doodle", "logo"), {
    pincodes: pincodeList.concat(pincode)
  }, {
    merge: true
  });

  localStorage.setItem('phone', phone);

  setDoc(doc(db, 'seller', phone), {
    name: name,
    email: email,
    phone: phone,
    hub: hub,
    password: password,
    pincode: pincode,
    address: address
  }).then((v) => {
    dashFunction()
  });
}
