/*jshint esversion: 6 */
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
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
var pincodesOfSeller = [];
let phone = localStorage.getItem('phone');

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

const dropdown = document.querySelector(".dropdown");
const submitLogo = document.getElementById("submitLogo");
const submitOffer = document.getElementById("submitOffer");
const submitGreeting = document.getElementById("submitGreeting");

const doodleUrl = document.getElementById("doodleUrl");
const offerUrl = document.getElementById("offerUrl");
const offerTitle = document.getElementById("offerTitle");
const greetingUrl = document.getElementById("greetingUrl");

const select = dropdown.querySelector('.select');
const share = document.getElementById('share_list');
const caret = dropdown.querySelector('.caret');
var menu = dropdown.querySelector('.menu');
const selected = dropdown.querySelector('.selected');

select.addEventListener('click', () => {
  select.classList.toggle('select-clicked');
  caret.classList.toggle('caret-rotate');
  menu.classList.toggle('menu-open');
});

onSnapshot(doc(db, 'doodle', "logo"), doc => {
  setMenuList(doc.data()['pincodes']);
});

onSnapshot(doc(db, 'seller', phone), doc => {
  pincodesOfSeller = doc.data()['pincode'];
  localStorage.setItem('hub', (doc.data()['hub']));
});

function setMenuList(pincode) {
  let pincodes = pincode;

  setPincodesToMenu(pincodes);

  getData();
}

function setPincodesToMenu(pincodeList, hub) {
  menu.innerHTML = [];

  pincodeList.forEach((item, i) => {
    const myLi = document.createElement('li');
    myLi.setAttribute('class', 'pincodes');
    myLi.innerHTML = item;
    menu.appendChild(myLi);
  });

  const myLi = document.createElement('li');
  myLi.setAttribute('class', 'pincodes');
  myLi.innerHTML = "Add Pincode";
  menu.appendChild(myLi);

  var options = dropdown.querySelectorAll('.pincodes');

  options[options.length - 1].addEventListener('click', () => {

    select.classList.remove('select-clicked');

    caret.classList.remove('caret-rotate');

    menu.classList.remove('menu-open');

    options.forEach(option2 => {
      option2.classList.remove('active_drop');
    });

    let valueIs = prompt("Enter Pincode To Be Added").toString().trim();

    if (valueIs != "") {
      if (prompt("Enter Passcode") == "falcon@123") {
        pincodeList.push(parseInt(valueIs));

        if (!pincodesOfSeller.includes(parseInt(valueIs))) {
          pincodesOfSeller.push(parseInt(valueIs));
          setDoc(doc(db, "seller", phone), {
            pincode: pincodesOfSeller
          }, {
            merge: true
          });
        }

        setDoc(doc(db, "doodle", "logo"), {
          pincodes: pincodeList
        }, {
          merge: true
        });
      }
    }

    options[options.length - 1].classList.add('active_drop');
  });


  options.forEach(option => {
    option.addEventListener('dblclick', () => {

      if (option.innerText != "Add Pincode") {

        select.classList.remove('select-clicked');

        caret.classList.remove('caret-rotate');

        menu.classList.remove('menu-open');

        options.forEach(option2 => {
          option2.classList.remove('active_drop');
        });

        option.classList.add('active_drop');

        if (confirm("Do You Want To Remove " + option.innerText + " Pincode")) {
          if (prompt("Enter Passcode") == "falcon@123") {
            pincodeList.splice(pincodeList.indexOf(option.innerText));
            console.log(pincodesOfSeller);
            if (pincodesOfSeller.includes(parseInt(option.innerText))) {
              pincodesOfSeller.splice(pincodesOfSeller.indexOf(parseInt(option.innerText)), 1);
              setDoc(doc(db, "seller", phone), {
                pincode: pincodesOfSeller
              }, {
                merge: true
              });
            }

            setDoc(doc(db, "doodle", "logo"), {
              pincodes: pincodeList
            }, {
              merge: true
            });
          }
        }
      }
    });
  });

}

function getData() {
  getDocs(collection(db, "doodle")).then(docSnap => {
    setDataToDoodle(docSnap["docs"][0].data());
  });

  getDocs(collection(db, "banners")).then(docSnap => {
    let banners = [];
    docSnap.forEach((item, i) => {
      banners.push(item.data());
    });
    setDataToBanners(banners);
  });
}

function setDataToDoodle(doodle) {
  document.getElementById("Doodle").src = doodle["url"];
  submitLogo.addEventListener("click", v => {
    if (!doodleUrl.value.toString().trim() == "") {
      setDoc(doc(db, "doodle", "logo"), {
        url: doodleUrl.value
      }, {
        merge: true
      });
      getData();
    }
  });
}

function setDataToBanners(banners) {
  banners.forEach((item, i) => {
    if (item["offer"] == true) {
      document.getElementById("Offer").src = item["imageUrl"];
      submitOffer.addEventListener("click", v => {
        if (!offerUrl.value.toString().trim() == "" & !offerTitle.value.toString().trim() == "") {
          setDoc(doc(db, "banners", "offer"), {
            imageUrl: offerUrl.value,
            title: offerTitle.value
          }, {
            merge: true
          });
          offerUrl.value = "";
          offerTitle.value = "";
          getData();
        }
      });
    } else {
      document.getElementById("Greeting").src = item["imageUrl"];
      submitGreeting.addEventListener("click", v => {
        if (!greetingUrl.value.toString().trim() == "") {
          setDoc(doc(db, "banners", "greeting"), {
            imageUrl: greetingUrl.value,
          }, {
            merge: true
          });
          getData();
        }
      });
    }
  });
}
