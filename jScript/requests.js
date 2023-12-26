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

const dropdown = document.querySelector(".dropdown");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

var table = document.getElementById('table');
var table2 = document.querySelector('.invoice_table');
var partner_table = document.getElementById('share_table');
const select = dropdown.querySelector('.select');
const share = document.getElementById('share_list');
const caret = dropdown.querySelector('.caret');
var menu = dropdown.querySelector('.menu');
const selected = dropdown.querySelector('.selected');

document.getElementById('cancel_share').addEventListener('click', () => {
  document.querySelector('.delivery_panel').style.display = 'none';
  partner = '';
});

document.getElementById('close').addEventListener('click', () => {
  document.getElementById('print_delivery_list').style.display = 'none';
});

select.addEventListener('click', () => {
  select.classList.toggle('select-clicked');
  caret.classList.toggle('caret-rotate');
  menu.classList.toggle('menu-open');
});

share.addEventListener('click', () => {
  document.querySelector('.delivery_panel').style.display = 'flex';
  showDeliveryPartners();
});

onSnapshot(doc(db, 'seller', phone), doc => {
  setMenuList(doc.data()['pincode'], doc.data()['hub']);
  
  localStorage.setItem('hub', (doc.data()['hub']));
});

function setMenuList(pincode, hub) {
  pincodes = pincode;

  if (localStorage.getItem('pincodeIs') == '') {
    localStorage.setItem('pincodeIs', pincodes[0]);
  }

  setPincodesToMenu(pincodes, hub);

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

  var options = dropdown.querySelectorAll('.pincodes');

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
    table.innerHTML = '';
    doc.forEach((item) => {
      if (item.data()['status'].toLowerCase() == 'pending' | item.data()['status'].toLowerCase() == 'packed') {
        requestList.push(item.data());
      }
    });
    loadDataToTable(pincode2, localStorage.getItem('hub'), requestList);
    document.getElementById('search_bar').addEventListener('keyup', () => {
      var text = document.getElementById('search_bar').value;
      let filterList = [];
      shareList = [];
      share.style.display = 'none';
      table.innerHTML = '';

      if (text.length > 0) {
        requestList.forEach((item, i) => {
          if (item['phone'].includes(text)) {
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

function loadDataToTable(pincode, hub, list) {

  document.getElementById("count_requests").innerHTML = list.length;

  list.forEach((item, i) => {
    var data = '';
    data = item;
    var newRow = table.insertRow(0);

    var serial = newRow.insertCell(0);
    var orderId = newRow.insertCell(1);
    var name = newRow.insertCell(2);
    var phone = newRow.insertCell(3);
    var address = newRow.insertCell(4);
    var payment = newRow.insertCell(5);
    var time = newRow.insertCell(6);
    var open = newRow.insertCell(7);
    var date = new Date(data['time']);

    serial.innerHTML = list.indexOf(item) + 1;
    orderId.innerHTML = data['id'];
    name.innerHTML = data['user'];
    phone.innerHTML = data['phone'];
    address.innerHTML = data['address'];
    payment.innerHTML = data['payment'];
    time.innerHTML = '' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ' ' + getAMorPM(date.getDay());
    open.innerHTML = 'Open';

    open.addEventListener('click', () => {
      document.getElementById('print_delivery_list').style.display = 'flex';
      setDataToInvoice(data);
    });

    newRow.addEventListener('click', () => {
      updatePrintList(pincode, hub, data, newRow);
    });

  });
}

function getAMorPM(date) {
  if (date == 1) {
    return 'AM';
  } else {
    return 'PM';
  }
}

function updatePrintList(pincode, hub, data, row) {

  if (shareList.includes(data, 0)) {
    row.classList.remove('selected_row');
    shareList.splice(shareList.indexOf(data), 1);
  } else {
    row.classList.toggle('selected_row');
    shareList.push(data);
  }

  if (shareList.length > 0) {
    share.style.display = 'flex';
    share.innerText = 'Share ' + shareList.length;
  } else {
    share.style.display = 'none';
  }

}

function setDataToInvoice(data) {

  table2.innerHTML = [];
  document.getElementById('invoice_id').innerHTML = 'OrderID: ' + data['id'];
  document.getElementById('invoice_name').innerHTML = 'Name: ' + data['user'];
  document.getElementById('invoice_pincode').innerHTML = 'Pincode: ' + data['pincode'];
  document.getElementById('invoice_address').innerHTML = 'Address: ' + data['address'];
  let orders = [];
  loadDataToInvoiceTable(orders.concat(data["order"]), data['payment'].toUpperCase());
}

function loadDataToInvoiceTable(list, paymentMethod) {

  var paymentRow = table2.insertRow(0);
  paymentRow.setAttribute("class", "heading");
  paymentRow.insertCell(0).innerHTML = "Payment Method";
  paymentRow.insertCell(1);
  paymentRow.insertCell(2);
  var paymentStatus = paymentRow.insertCell(3);
  paymentStatus.setAttribute("id", "payment_status");
  paymentStatus.innerHTML = paymentMethod;
  paymentRow.insertCell(4);

  var headingRow = table2.insertRow(1);
  headingRow.setAttribute("class", "heading");
  headingRow.insertCell(0).innerHTML = "Item";
  headingRow.insertCell(1).innerHTML = "Unit Weight";
  headingRow.insertCell(2).innerHTML = "Quantity";
  headingRow.insertCell(3).innerHTML = "Price";
  headingRow.insertCell(4).innerHTML = "Total";

  var totalPrice = 0;

  list.forEach((item, i) => {

    var newRow = table2.insertRow(table2.rows.length);
    newRow.setAttribute("class", "item");

    var iteM = newRow.insertCell(0);
    var weighT = newRow.insertCell(1);
    var quantitY = newRow.insertCell(2);
    var pricE = newRow.insertCell(3);
    var totaL = newRow.insertCell(4);

    totalPrice += item["total"];

    iteM.innerHTML = item['title'];
    weighT.innerHTML = item['weight'];
    quantitY.innerHTML = item['quantity'];
    pricE.innerHTML = item['unitPrice'];
    totaL.innerHTML = item['total'];

  });

  var totalRow = table2.insertRow(table2.rows.length);
  totalRow.setAttribute("class", "total");
  totalRow.insertCell(0).innerHTML = "Total";
  totalRow.insertCell(1);
  totalRow.insertCell(2);
  totalRow.insertCell(3);
  var lastCell = totalRow.insertCell(4);
  lastCell.setAttribute("id", "payment_status");
  lastCell.innerHTML = "₹" + totalPrice;


}

function showDeliveryPartners() {
  partnersList = [];
  let pincode = localStorage.getItem('pincodeIs');
  let hub = localStorage.getItem('hub');
  getDocs(query(collection(db, 'partners'), where("pincode", "==", pincode))).then(docSnap => {
    docSnap.forEach((doc) => {
      partnersList.push(doc.data());
    });
    updatePartnerTable(partnersList);
  });
  document.getElementById('partner_search_bar').addEventListener('keyup', () => {
    var text = document.getElementById('partner_search_bar').value;

    let filteredList = [];
    if (text.length > 0) {
      partnersList.forEach((item, i) => {
        if (item['phone'].includes(document.getElementById('partner_search_bar').value) | item['name'].includes(document.getElementById('partner_search_bar').value)) {
          filteredList.push(item);
        }
      });
      updatePartnerTable(filteredList);
    } else {
      updatePartnerTable(partnersList);
    }
  });
}

function updatePartnerTable(list) {
  partner_table.innerHTML = '';
  partner = '';
  document.getElementById('partner_selected').innerText = '';

  if (partner.trim() != '') {
    document.querySelector('#share_button').style.display = 'flex';
  } else {
    document.querySelector('#share_button').style.display = 'none';
  }

  partnerData = {};

  list.forEach((item, i) => {

    var data = '';
    data = item;
    var newRow = partner_table.insertRow(0);

    var name = newRow.insertCell(0);
    var phone = newRow.insertCell(1);
    var pincode = newRow.insertCell(2);
    var select_partner = newRow.insertCell(3);

    name.innerHTML = data['name'];
    phone.innerHTML = data['phone'];
    pincode.innerHTML = data['pincode'];
    select_partner.innerHTML = 'Select'
    select_partner.setAttribute('id', 'select_partner');

    select_partner.addEventListener('click', () => {
      document.getElementById('partner_selected').innerText = item['name'];
      document.getElementById('partner_selected').style.fontSize = 'xx-large';
      partner = item["name"];

      if (partner.trim() != '') {
        document.querySelector('#share_button').style.display = 'flex';
        partnerData = item;
      } else {
        document.querySelector('#share_button').style.display = 'none';
      }
    });
  });
}

document.getElementById('share_button').addEventListener('click', () => {
  var passCode = document.getElementById('confirm').value;
  if (passCode == 'falcon@1234' && partner) {
    updateProductStatus(shareList);
    updatePartnerShipments(shareList);
    share.style.display = 'none';
    shareList = [];
    document.querySelector('.delivery_panel').style.display = 'none';
    partner = '';
    document.getElementById('partner_selected').innerText = '';
  }
});

function updateProductStatus(list) {
  list.forEach((item, i) => {
    setDataToFirebase('orders', item['id'], item['user'], item['phone'], item['address'], item['payment'], item['pincode'], item['time'], item['order'], item['email'], 'Out For Delivery');
  });
}

function updatePartnerShipments(list) {
  setDataToPartnerFirebase('partners', partnerData['phone'], partnerData['name'], partnerData['altPhone'], partnerData['address'], partnerData['pincode'], list.concat(partnerData['shipment']), partnerData['status']);
}

function setDataToFirebase(collectionName, id, user, phone, address, payment, pincode, time, order, email, status) {
  let pincode2 = localStorage.getItem('pincodeIs');
  let hub2 = localStorage.getItem('hub');

  setDoc(doc(db, collectionName, hub2, pincode2, id), {
    address: address,
    id: id,
    payment: payment,
    phone: phone,
    pincode: pincode,
    status: status,
    email: email,
    time: time,
    user: user,
    order: order
  }, {
    merge: true
  });


}

function setDataToPartnerFirebase(collectionName, phone, user, altphone, address, pincode, order, status) {
  let pincode2 = localStorage.getItem('pincodeIs');
  let hub2 = localStorage.getItem('hub');
  setDoc(doc(db, collectionName, phone), {
    address: address,
    phone: phone,
    altPhone: altphone,
    pincode: pincode,
    hub: hub2,
    status: status,
    name: user,
    shipment: order
  }, {
    merge: true
  });
}
