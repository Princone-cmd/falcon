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

const firebaseConfig = {
  apiKey: "AIzaSyC_WPVeu0vT-tmcYffq8iLmOjCjUTwEJYg",
  authDomain: "falcon-4548f.firebaseapp.com",
  projectId: "falcon-4548f",
  storageBucket: "falcon-4548f.appspot.com",
  messagingSenderId: "542434801277",
  appId: "1:542434801277:web:c082f5217af3b2b8b6a314",
  measurementId: "G-JKMTVFMB8C"
};

const dropdowns = document.querySelectorAll(".dropdown");
const dropdown_categories = document.querySelectorAll(".dropdown_two");
const dropdown_units = document.querySelectorAll(".dropdown_three");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

dropdowns.forEach(dropdown => {

  const select = dropdown.querySelector('.select');
  const caret = dropdown.querySelector('.caret');
  const menu = dropdown.querySelector('.menu');
  const options = dropdown.querySelectorAll('.menu li');
  const selected = dropdown.querySelector('.selected');

  select.addEventListener('click', () => {
    select.classList.toggle('select-clicked');
    caret.classList.toggle('caret-rotate');
    menu.classList.toggle('menu-open');
  });

  options.forEach(option => {
    option.addEventListener('click', () => {
      selected.innerText = option.innerText;
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
});

dropdown_units.forEach(dropdown => {

  const select = dropdown.querySelector('.select_three');
  const caret = dropdown.querySelector('.caret');
  const menu = dropdown.querySelector('.menu_three');
  const options = dropdown.querySelectorAll('.menu_three li');
  const selected = dropdown.querySelector('.selected_three');

  select.addEventListener('click', () => {
    select.classList.toggle('select_three-clicked');
    caret.classList.toggle('caret-rotate');
    menu.classList.toggle('menu_three-open');
  });

  options.forEach(option => {
    option.addEventListener('click', () => {
      selected.innerText = option.innerText;
      units = option.innerText;
      select.classList.remove('select_three-clicked');

      caret.classList.remove('caret-rotate');

      menu.classList.remove('menu_three-open');

      options.forEach(option2 => {
        option2.classList.remove('active_drop');
      });

      option.classList.add('active_drop');
    });
  });

});

dropdown_categories.forEach(dropdown => {

  const select = dropdown.querySelector('.select_two');
  const caret = dropdown.querySelector('.caret');
  const menu = dropdown.querySelector('.menu_two');
  const options = dropdown.querySelectorAll('.menu_two li');
  const selected = dropdown.querySelector('.selected_two');

  select.addEventListener('click', () => {
    select.classList.toggle('select_two-clicked');
    caret.classList.toggle('caret-rotate');
    menu.classList.toggle('menu_two-open');
  });

  options.forEach(option => {
    option.addEventListener('click', () => {
      selected.innerText = option.innerText;

      category = option.innerText;

      select.classList.remove('select_two-clicked');

      caret.classList.remove('caret-rotate');

      menu.classList.remove('menu_two-open');

      options.forEach(option2 => {
        option2.classList.remove('active_drop');
      });

      option.classList.add('active_drop');
    });
  });

});

document.getElementById('submit').addEventListener('click', () => {
  setData();
});
document.getElementById('add').addEventListener('click', () => {
  document.querySelector('.product_details').style.display = "flex";
  clearData();
});
document.getElementById('add_product').addEventListener('click', () => {
  document.querySelector('.product_details').style.display = "flex";
  clearData();
});
document.getElementById('cancel').addEventListener('click', () => {
  document.querySelector('.product_details').style.display = "none";
  clearData();
});

window.filledInput = function() {
  const url = document.getElementById('url');
  document.querySelector('.img_view').style.display = "flex";
  document.getElementById('img_product').setAttribute("src", url.value);
}

window.stockStatus = function() {
  if (document.getElementById('stock_status').checked) {
    document.getElementById('status_text').innerText = 'Active';
  } else {
    document.getElementById('status_text').innerText = 'Inactive';
  }
}

getDataToView('All');

function getDataToView(filter) {
  var productsList = [];
  document.getElementById('products_list').innerHTML = '';
  if (filter == 'All') {
    getDocs(query(collection(db, "products"))).then(docSnap => {
      docSnap.forEach((doc) => {
        productsList.push(doc.data());
      });
      updateData(productsList);
    });
  } else if (filter == 'Active') {
    getDocs(query(collection(db, "products"), where("status", "==", true))).then(docSnap => {
      docSnap.forEach((doc) => {
        productsList.push(doc.data());
      });
      updateData(productsList);
    });
  } else if (filter == 'Inactive') {
    getDocs(query(collection(db, "products"), where("status", "==", false))).then(docSnap => {
      docSnap.forEach((doc) => {
        productsList.push(doc.data());
      });
      updateData(productsList);
    });
  } else if (filter == 'Offers') {
    getDocs(query(collection(db, "products"), where("offer", "==", true))).then(docSnap => {
      docSnap.forEach((doc) => {
        productsList.push(doc.data());
      });
      updateData(productsList);
    });
  }
  document.getElementById('search_bar').addEventListener("keyup", () => {
    var text = document.getElementById('search_bar').value;
    let filterList = [];

    if (text.length > 0) {
      productsList.forEach((item, i) => {
        if (item['title'].toLowerCase().includes(text.toLowerCase())) {
          filterList.push(item);
        }
      });
      updateData(filterList);
    } else {
      updateData(productsList);
    }
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
    setDataToFirebase(false, title, description, category, url, price, discount, weight, units, document.getElementById('stock_status').checked, false);
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

function setDataToFirebase(isUpdate, title, desc, category, imageUrl, unitPrice, discount, quantity, unit, status, offer) {

  if (isUpdate) {
    setDoc(doc(db, 'products', title), {
      title: title,
      description: desc,
      category: category,
      imageUrl: imageUrl,
      unitPrice: parseInt(unitPrice),
      discount: parseInt(discount),
      quantity: quantity,
      offer: offer,
      units: unit,
      status: status
    }).then(() => {
      document.querySelector('.product_details').style.display = "none";
    });
  } else {
    setDoc(doc(db, 'products', title), {
      title: title,
      description: desc,
      category: category,
      imageUrl: imageUrl,
      unitPrice: parseInt(unitPrice),
      discount: parseInt(discount),
      quantity: quantity,
      offer: offer,
      units: unit,
      status: status
    }, {
      merge: true
    }).then(() => {
      document.querySelector('.product_details').style.display = "none";
    });
  }
}

function updateData(productsList) {
  document.getElementById('products_list').innerHTML = '';
  productsList.forEach((item, i) => {
    addProduct(item['title'], item['description'], item['category'], item['imageUrl'], item['unitPrice'], item['discount'], item['quantity'], item['units'], item['status'], item['offer']);
  });

  var deleteList = document.querySelectorAll('.products_list li #delete'),
    deleteListTemp = [],
    index;
  for (var i = 0; i < deleteList.length; i++) {
    deleteListTemp.push(deleteList[i]);
  }

  for (var i = 0; i < deleteList.length; i++) {
    let i2 = i;
    deleteList[i].onclick = function() {
      if (confirm('Are you sure? You want to delete ' + productsList[i2]['title'] + ' ') == true) {
        deleteDocM(productsList[i2]['title']);
        productsList.splice(i2, 1);
        updateData(productsList);
        alert('Product Deleted Successfully');
      } else {
        alert('Product Deletion Cancelled');
      }
    }
  }

  var editList = document.querySelectorAll('.products_list li #add_stock'),
    editListTemp = [],
    editIndex;
  for (var i = 0; i < editList.length; i++) {
    editListTemp.push(editList[i]);
  }

  for (var i = 0; i < editList.length; i++) {
    let i2 = i;
    editList[i].onclick = function() {
      showEditPanel(productsList[i2]);
    }
  }

  var previewList = document.querySelectorAll('.products_list li #show_image'),
    previewListTemp = [],
    previewIndex;
  for (var i = 0; i < previewList.length; i++) {
    previewListTemp.push(previewList[i]);
  }

  for (var i = 0; i < previewList.length; i++) {
    let i2 = i;
    previewList[i].onclick = function() {
      openInNewTab(productsList[i2]['imageUrl']);
    }
  }

}

function openInNewTab(url) {
  window.open(url, '_blank').focus();
}

function deleteDocM(name) {

  const docRef = doc(db, "products", name);
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
  document.querySelector('.selected_three').innerText = data_to_preview['units'];
  document.querySelector('.selected_two').innerText = data_to_preview['category'];
  units = data_to_preview['units'];
  category = data_to_preview['category'];
  document.querySelector('.img_view').style.display = "flex";

  if (document.getElementById('stock_status').checked) {
    document.getElementById('status_text').innerText = 'Active';
  } else {
    document.getElementById('status_text').innerText = 'Inactive';
  }
}
