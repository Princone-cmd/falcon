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
  collectionGroup,
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
var partner = '';
let q = '';
var partnerData = {};
let pincodes = [];
let orders = [];
let shareList = [];
let partnersList = [];
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

var table = document.getElementById('table');
const select = document.querySelector('.select');
const caret = document.querySelector('.caret');
var menu = document.querySelector('.menu');
var options = document.querySelectorAll('.menu li');
const selected = document.querySelector('.selected');
let progressBar = document.querySelector('.inner');
let valueContainer = document.querySelector('.value-container');

select.addEventListener('click', () => {
  select.classList.toggle('select-clicked');
  caret.classList.toggle('caret-rotate');
  menu.classList.toggle('menu-open');
});

onSnapshot(doc(db, 'seller', phone), doc => {
  setMenuList(doc.data()['pincode'], doc.data()['hub']);
  localStorage.setItem('hub', (doc.data()['hub']));
  getData();
});

function setMenuList(pincode, hub) {
  pincodes = pincode;
  if (localStorage.getItem('pincodeIs') == '') {
    localStorage.setItem('pincodeIs', pincodes[0]);
  }

  setPincodesToMenu(pincodes, hub);
}

function setPincodesToMenu(pincodeList, hub) {
  menu.innerHTML = [];

  pincodeList.forEach((item, i) => {
    const myLi = document.createElement('li');
    myLi.setAttribute('class', 'pincodes');
    myLi.innerHTML = item;
    menu.appendChild(myLi);
  });

  var options = menu.querySelectorAll('li');

  options.forEach(option => {
    option.addEventListener('click', () => {
      selected.innerText = option.innerText;

      localStorage.setItem('pincodeIs', option.innerText);

      select.classList.remove('select-clicked');

      caret.classList.remove('caret-rotate');

      menu.classList.remove('menu-open');

      options.forEach(option2 => {
        option2.classList.remove('active_drop');
      });

      option.classList.add('active_drop');
      window.location.reload();
    });
  });
}

function getData() {
  selected.innerText = localStorage.getItem('pincodeIs');
  let pincode2 = localStorage.getItem('pincodeIs');

  onSnapshot(query(collection(db, 'orders/' + localStorage.getItem('hub') + "/" + localStorage.getItem('pincodeIs')), where("pincode", "==", localStorage.getItem('pincodeIs'))), doc => {
    let requestList = [];
    let pendingList = [];
    let requestsList = [];
    let delieveredList = [];
    table.innerHTML = '';
    doc.forEach((item) => {
      requestList.push(item.data());
      let data = item.data();
      if (data['status'].toLowerCase() == 'delivered') {
        delieveredList.push(item);
      } else if (data['status'].toLowerCase() == 'pending' | (data['status'].toLowerCase() == 'packed')) {
        requestsList.push(item);
      } else if (data['status'].toLowerCase() == 'pending' | (data['status'].toLowerCase() == 'packed') | (data['status'].toLowerCase() == 'out for delivery')) {
        pendingList.push(item);
      }

      document.getElementById('notification').innerText = requestsList.length;

    });

    document.getElementById('total_orders').innerText = "";
    document.getElementById('pending_orders').innerText = "";
    document.getElementById('delivered_orders').innerText = "";

    document.getElementById('total_orders').innerText = requestList.length;
    document.getElementById('pending_orders').innerText = pendingList.length;
    document.getElementById('delivered_orders').innerText = delieveredList.length;

    displayProgress(requestList.length, delieveredList.length);
    loadDataToTable(pincode2, localStorage.getItem('hub'), requestList);
    document.getElementById('search_bar').addEventListener('keyup', () => {
      var text = document.getElementById('search_bar').value;
      let filterList = [];
      table.innerHTML = '';

      if (text.length > 0) {
        requestList.forEach((item, i) => {
          if (item['id'].toLowerCase().includes(text.toLowerCase())) {
            filterList.push(item);
          }
        });
        loadDataToTable(pincode2, localStorage.getItem('hub'), filterList);
      } else {
        loadDataToTable(pincode2, localStorage.getItem('hub'), requestList);
      }
    });

  });

}

function addProduct(title, description, category, url, price, discount, weight, units, status, offer) {

  // add product
  const list = document.querySelector('.products_list');
  const myLi = document.createElement('li');
  myLi.setAttribute("class", "product_card");

  const active = document.createElement('span');
  if (status) {
    active.innerText = "Active";
    active.setAttribute("class", "active_stock");
  } else {
    active.innerText = "Inactive";
    active.setAttribute("class", "no_stock");
  }

  const head = document.createElement('h3');
  head.setAttribute("id", "product_name");
  head.innerText = title;

  const tail = document.createElement('h3');
  tail.innerText = "र " + price;

  const tail2 = document.createElement('h4');
  tail2.setAttribute("class", "text_details");
  tail2.innerText = weight + " " + units + " per Unit";

  const add = document.createElement('span');
  add.setAttribute("class", "material-icons-round");
  add.setAttribute("id", "add_stock");
  add.innerHTML = "edit";

  const view = document.createElement('span');
  view.setAttribute("class", "material-icons-round");
  view.setAttribute("id", "show_image");
  view.innerHTML = "image";

  const deleteItem = document.createElement('span');
  deleteItem.setAttribute("class", "material-icons-round");
  deleteItem.setAttribute("id", "delete");
  deleteItem.innerHTML = "delete";

  const switch_label = document.createElement('label');
  switch_label.setAttribute("class", "switch_offer_label");

  const switch_input = document.createElement('input');
  switch_input.setAttribute("class", "switch_input");
  switch_input.setAttribute("type", "checkbox");
  switch_input.checked = offer;

  switch_input.addEventListener('change', () => {
    setDataToFirebase(true, title, description, category, url, price, discount, weight, units, status, switch_input.checked);
  });

  const switch_span = document.createElement('span');
  switch_span.setAttribute("class", "slider_offer");

  switch_label.appendChild(switch_input);
  switch_label.appendChild(switch_span);

  myLi.appendChild(active);
  myLi.appendChild(head);
  myLi.appendChild(tail);
  myLi.appendChild(tail2);
  myLi.appendChild(add);
  myLi.appendChild(view);
  myLi.appendChild(deleteItem);
  myLi.appendChild(switch_label);

  list.appendChild(myLi);
}

function getDataToView(filter, hub) {
  var productsList = [];
  table.innerHTML = '';
  if (filter == 'All') {
    getDocs(query(collectionGroup(db, '533003'))).then(docSnap => {
      docSnap.forEach((doc) => {
        productsList.push(doc.data());
      });
    });
  } else if (filter == 'Active') {
    getDocs(query(collection(db, "products"), where("status", "==", true))).then(docSnap => {
      docSnap.forEach((doc) => {
        productsList.push(doc.data());
      });
    });
  } else if (filter == 'Inactive') {
    getDocs(query(collection(db, "products"), where("status", "==", false))).then(docSnap => {
      docSnap.forEach((doc) => {
        productsList.push(doc.data());
      });
    });
  } else if (filter == 'Offers') {
    getDocs(query(collection(db, "products"), where("offer", "==", true))).then(docSnap => {
      docSnap.forEach((doc) => {
        productsList.push(doc.data());
      });
    });
  }
}

function loadDataToTable(pincode, hub, list) {

  list.forEach((item, i) => {
    var data = '';
    data = item;
    var newRow = table.insertRow(0);

    var orderId = newRow.insertCell(0);
    var name = newRow.insertCell(1);
    var payment = newRow.insertCell(2);
    var status = newRow.insertCell(3);

    orderId.innerHTML = data['id'];
    name.innerHTML = data['user'];
    payment.innerHTML = data['payment'];
    status.innerHTML = data['status'];

    changeColorOfStatus(status, data['status']);

  });

}

function changeColorOfStatus(status, text) {
  if (text.toLowerCase() == 'out for delivery') {
    status.style.color = 'orange';
    status.style.fontWeight = '800';
  } else if (text.toLowerCase() == 'pending') {
    status.style.color = 'yellow';
    status.style.fontWeight = '800';
  } else if (text.toLowerCase() == 'packed') {
    status.style.color = 'white';
    status.style.fontWeight = '800';
  } else if (text.toLowerCase() == 'delivered') {
    status.style.color = 'lightgreen';
    status.style.fontWeight = '800';
  }
}

function displayProgress(total, value) {
  let progressEndValue;
  if (value > 0) {
    progressEndValue = Math.floor(((value / total) * 100));
  } else {
    progressEndValue = 0;
  }

  let progressvalue = -1;
  let speed = 5;
  let progress = setInterval(() => {
    progressvalue++;
    valueContainer.textContent = `${progressvalue}%`;
    valueContainer.style.color = '#E1FFEE';
    progressBar.style.background = `conic-gradient(
    lightgreen ${progressvalue * 3.6}deg,
    #ffffff ${progressvalue * 3.6}deg)`;

    if (progressvalue >= progressEndValue) {
      clearInterval(progress);
    }
  }, speed);

}
