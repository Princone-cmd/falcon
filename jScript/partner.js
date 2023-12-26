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
let pincodes = [];
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

const dropdown = document.querySelector(".dropdown");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const select = dropdown.querySelector('.select');
const caret = dropdown.querySelector('.caret');
var menu = dropdown.querySelector('.menu');
const selected = dropdown.querySelector('.selected');

select.addEventListener('click', () => {
  select.classList.toggle('select-clicked');
  caret.classList.toggle('caret-rotate');
  menu.classList.toggle('menu-open');
});

window.stockStatus = function() {
  if (document.getElementById('stock_status').checked) {
    document.getElementById('status_text').innerText = 'Active';
  } else {
    document.getElementById('status_text').innerText = 'Inactive';
  }
}

onSnapshot(doc(db, 'seller', phone), doc => {
  setMenuList(doc.data()['pincode'], doc.data()['hub']);
  localStorage.setItem('hub', (doc.data()['hub']));
  localStorage.setItem('pin', (doc.data()['pincode']));
});

function setMenuList(pincode, hub) {
  pincodes = pincode;
  setPincodesToMenu(pincodes, hub);
  getDataToView(pincodes[0]);
}

function setPincodesToMenu(pincodeList, hub) {
  menu.innerHTML = [];

  selected.innerText = pincodeList[0];
  localStorage.setItem('pin', pincodeList[0]);
  pincodeList.forEach((item, i) => {
    const myLi = document.createElement('li');
    myLi.setAttribute('class', 'pincodes');
    myLi.innerHTML = item;
    menu.appendChild(myLi);
  });

  var options = dropdown.querySelectorAll('.pincodes');

  options.forEach(option => {
    option.addEventListener('click', () => {
      selected.innerText = option.innerText;

      localStorage.setItem('pin', option.innerText);
      getDataToView(option.innerText);

      select.classList.remove('select-clicked');

      caret.classList.remove('caret-rotate');

      menu.classList.remove('menu-open');

      options.forEach(option2 => {
        option2.classList.remove('active_drop');
      });

      option.classList.add('active_drop');
    });
  });
}

function getDataToView(pincode) {
  var productsList = [];
  partnersList = [];
  let hub = localStorage.getItem('hub');
  document.getElementById('partner_list').innerHTML = '';

  getDocs(query(collection(db, 'partners'), where("pincode", "==", pincode))).then(docSnap => {
    docSnap.forEach((doc) => {
      partnersList.push(doc.data());
    });
    updateData(partnersList);
    document.getElementById('search_bar').addEventListener("keyup", () => {
      var text = document.getElementById('search_bar').value;
      let filterList = [];

      if (text.length > 0) {
        partnersList.forEach((item, i) => {
          if (item['phone'].includes(text)) {
            filterList.push(item);
          }
        });
        updateData(filterList);
      } else {
        updateData(partnersList);
        console.log(partnersList);
      }
    });
  });
}

function setData() {
  let title = document.getElementById('name').value;
  let price = document.getElementById('price').value;
  let weight = document.getElementById('weight').value;
  let discount = document.getElementById('discount').value;
  let description = document.getElementById('description').value;
  let url = document.getElementById('url').value;

  if (title != "" && price != "" && weight != "" && discount != "" && description != "" && url != "" && units != "") {
    setDataToFirebase(title, description, category, url, price, discount, weight, units, document.getElementById('stock_status').checked);
    getDataToView('All');
  }
}

function clearData() {
  document.getElementById('name').value = "";
  document.getElementById('price').value = "";
  document.getElementById('weight').value = "";
  document.getElementById('url').value = "";
  document.getElementById('discount').value = "";
  document.getElementById('description').value = "";
  document.getElementById('stock_status').checked = false;
  document.querySelector('.img_view').style.display = "none";
}

function addProduct(name, phone, altphone, pincode, hub, address, shipment, status) {

  // add product
  const list = document.querySelector('.partner_list');
  const myLi = document.createElement('li');
  myLi.setAttribute("class", "partner_card");

  const head = document.createElement('h3');
  head.setAttribute("id", "partner_name");
  head.innerText = name;

  const phn = document.createElement('h3');
  phn.innerText = phone;

  const alt = document.createElement('h3');
  alt.innerText = altphone;

  const pin = document.createElement('h3');
  pin.innerText = pincode;

  const adres = document.createElement('h5');
  adres.setAttribute("class", "text_details");
  adres.setAttribute("id", "adres");
  adres.innerText = address;

  const add = document.createElement('span');
  add.setAttribute("class", "material-icons-round");
  add.setAttribute("id", "add_stock");
  add.innerHTML = "edit";

  const deleteItem = document.createElement('span');
  deleteItem.setAttribute("class", "material-icons-round");
  deleteItem.setAttribute("id", "delete");
  deleteItem.innerHTML = "delete";

  const switch_label = document.createElement('label');
  switch_label.setAttribute("class", "switch_offer_label");

  const switch_input = document.createElement('input');
  switch_input.setAttribute("class", "switch_input");
  switch_input.setAttribute("type", "checkbox");
  switch_input.checked = status;

  switch_input.addEventListener('change', () => {
    setDataToFirebase(name, phone, altphone, pincode, hub, address, shipment, switch_input.checked);
  });

  const switch_span = document.createElement('span');
  switch_span.setAttribute("class", "slider_offer");

  switch_label.appendChild(switch_input);
  switch_label.appendChild(switch_span);

  myLi.appendChild(head);
  myLi.appendChild(phn);
  myLi.appendChild(alt);
  myLi.appendChild(pin);
  myLi.appendChild(adres);
  myLi.appendChild(deleteItem);
  myLi.appendChild(switch_label);

  list.appendChild(myLi);
}

function setDataToFirebase(name, phone, altphone, pincode, hub, address, shipment, status) {

  setDoc(doc(db, 'partners', phone), {
    name: name,
    phone: phone,
    altPhone: altphone,
    pincode: pincode,
    hub: hub,
    address: address,
    shipment: shipment,
    status: status
  });
}

function updateData(productsList) {

  document.getElementById('partner_list').innerHTML = '';

  productsList.forEach((item, i) => {
    addProduct(item['name'], item['phone'], item['altPhone'], item['pincode'], item['hub'], item['address'], item['shipment'], item['status'])
  });

  var deleteList = document.querySelectorAll('.partner_list li #delete'),
    deleteListTemp = [],
    index;
  for (var i = 0; i < deleteList.length; i++) {
    deleteListTemp.push(deleteList[i]);
  }

  for (var i = 0; i < deleteList.length; i++) {
    let i2 = i;
    deleteList[i].onclick = function() {

      if (confirm('Are you sure? You want to delete ' + productsList[i2]['name'])) {
            deleteDocM(productsList[i2]);
            productsList.splice(i2, 1);
            updateData(productsList);
        alert('Partner Deleted Successfully');
      } else {
        alert('Partner Deletion Cancelled');
      }
    }
  }

}

function openInNewTab(url) {
  window.open(url, '_blank').focus();
}

function deleteDocM(dooc) {

  const docRef = doc(db, "partners", dooc['hub'], dooc['pincode'], dooc['phone']);

  alert('Are you sure? You want to delete ' + name + ' ');

  deleteDoc(docRef)
    .then(() => {
      console.log("Entire Document has been deleted successfully.")
    })
    .catch(error => {
      console.log(error);
    });
}

function showEditPanel(data_to_preview) {

  document.querySelector('.product_details').style.display = "flex";

  document.getElementById('name').value = data_to_preview['title'];
  document.getElementById('price').value = data_to_preview['unitPrice'];
  document.getElementById('weight').value = data_to_preview['quantity'];
  document.getElementById('url').value = data_to_preview['imageUrl'];
  document.getElementById('discount').value = data_to_preview['discount'];
  document.getElementById('description').value = data_to_preview['description'];
  document.getElementById('stock_status').checked = data_to_preview['status'];
  document.getElementById('img_product').src = data_to_preview['imageUrl'];
  document.querySelector('.img_view').style.display = "flex";
}
