// ===============================
// 🔐 AUTH STATE CHECK
// ===============================
firebase.auth().onAuthStateChanged(function(user) {

  // 👉 যদি admin page হয়
  if (window.location.pathname.includes("admin.html")) {

    if (!user) {
      const email = prompt("Admin Email:");
      const password = prompt("Admin Password:");

      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
          console.log("Admin Logged In");
        })
        .catch(error => {
          alert("Login Failed");
          console.error(error);
        });
    } else {
      loadAdminOrders();
    }
  }
});


// ===============================
// 🛍 ADD PRODUCT (ADMIN)
// ===============================
function addProduct() {

  const name = document.getElementById("product-title")?.value;
  const price = document.getElementById("product-price")?.value;
  const image = document.getElementById("product-image")?.value;

  if (!name || !price || !image) {
    alert("সব ঘর পূরণ করুন");
    return;
  }

  db.collection("products").add({
    name: name,
    price: Number(price),
    image: image,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Product Added Successfully!");
    document.getElementById("add-product-form").reset();
  })
  .catch(error => {
    console.error("Error adding product:", error);
  });
}


// ===============================
// 🛍 LOAD PRODUCTS (SHOP PAGE)
// ===============================
function loadProducts() {

  const container = document.getElementById("product-list");
  if (!container) return;

  db.collection("products").orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {

      container.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();

        container.innerHTML += `
          <div class="product">
            <img src="${data.image}" width="100%">
            <h3>${data.name}</h3>
            <p>৳ ${data.price}</p>
            <button onclick="addToCart('${doc.id}', '${data.name}', ${data.price})">
              Add to Cart
            </button>
          </div>
        `;
      });

    });
}


// ===============================
// 🛒 CART SYSTEM
// ===============================
let cart = [];

function addToCart(id, name, price) {
  cart.push({ id, name, price });
  alert("Added to cart");
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}


// ===============================
// 📦 PLACE ORDER (COD + PAYMENT)
// ===============================
const checkoutForm = document.getElementById("checkout-form");

if (checkoutForm) {
  checkoutForm.addEventListener("submit", function(e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    db.collection("orders").add({
      customerName: name,
      phone: phone,
      address: address,
      items: cart,
      total: getTotal(),
      paymentMethod: "Cash on Delivery",
      status: "Pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      alert("Order Placed Successfully!");
      cart = [];
      checkoutForm.reset();
    })
    .catch(error => {
      console.error("Order Error:", error);
    });

  });
}


// ===============================
// 📊 ADMIN ORDER DASHBOARD
// ===============================
function loadAdminOrders() {

  const adminContainer = document.getElementById("admin-product-list");
  if (!adminContainer) return;

  db.collection("orders").orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {

      adminContainer.innerHTML = "<h2>Customer Orders</h2>";

      snapshot.forEach(doc => {
        const data = doc.data();

        adminContainer.innerHTML += `
          <div class="product">
            <h3>${data.customerName}</h3>
            <p>Phone: ${data.phone}</p>
            <p>Address: ${data.address}</p>
            <p>Total: ৳ ${data.total}</p>
            <p>Status: ${data.status}</p>
            <button onclick="updateStatus('${doc.id}')">Mark as Delivered</button>
            <hr>
          </div>
        `;
      });

    });
}


// ===============================
// ✅ UPDATE ORDER STATUS
// ===============================
function updateStatus(orderId) {
  db.collection("orders").doc(orderId).update({
    status: "Delivered"
  })
  .then(() => {
    alert("Order marked as Delivered");
  });
}


// ===============================
// 🧾 ADMIN FORM SUBMIT
// ===============================
const form = document.getElementById("add-product-form");

if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    addProduct();
  });
}


// 🚀 LOAD PRODUCTS
loadProducts();
