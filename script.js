let cart = [];

function scrollToProducts(){
    document.getElementById("products").scrollIntoView({behavior:"smooth"});
}

function addToCart(id,name,price){
    cart.push({id,name,price});
    updateCartUI();
}

function updateCartUI(){
    const cartContainer = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    if(!cartContainer) return;

    cartContainer.innerHTML="";
    let total=0;

    cart.forEach(item=>{
        total+=item.price;
        cartContainer.innerHTML+=`
            <div class="cart-item">
                ${item.name} - ৳ ${item.price}
            </div>
        `;
    });

    totalEl.innerText=total;
}

function loadProducts(){
    const container=document.getElementById("product-list");
    if(!container) return;

    db.collection("products").orderBy("createdAt","desc")
    .onSnapshot(snapshot=>{
        container.innerHTML="";
        snapshot.forEach(doc=>{
            const data=doc.data();
            container.innerHTML+=`
                <div class="product">
                    <img src="${data.image}">
                    <h3>${data.name}</h3>
                    <p>৳ ${data.price}</p>
                    <button onclick="addToCart('${doc.id}','${data.name}',${data.price})">
                        Add to Cart
                    </button>
                </div>
            `;
        });
    });
}

const checkoutForm=document.getElementById("checkout-form");

if(checkoutForm){
    checkoutForm.addEventListener("submit",function(e){
        e.preventDefault();

        if(cart.length===0){
            alert("Cart Empty");
            return;
        }

        const name=document.getElementById("name").value;
        const phone=document.getElementById("phone").value;
        const address=document.getElementById("address").value;
        const payment=document.getElementById("payment-method").value;

        db.collection("orders").add({
            customerName:name,
            phone:phone,
            address:address,
            items:cart,
            total:cart.reduce((s,i)=>s+i.price,0),
            paymentMethod:payment,
            status:"Pending",
            createdAt:firebase.firestore.FieldValue.serverTimestamp()
        }).then(()=>{
            alert("Order Placed");
            cart=[];
            updateCartUI();
            checkoutForm.reset();
        });
    });
}

function loadAdminDashboard(){
    const ordersDiv=document.getElementById("admin-orders");
    if(!ordersDiv) return;

    db.collection("orders").orderBy("createdAt","desc")
    .onSnapshot(snapshot=>{
        ordersDiv.innerHTML="";
        let totalOrders=0;
        let totalSales=0;
        let pending=0;
        let delivered=0;

        snapshot.forEach(doc=>{
            const data=doc.data();
            totalOrders++;
            totalSales+=data.total;

            if(data.status==="Pending") pending++;
            if(data.status==="Delivered") delivered++;

            ordersDiv.innerHTML+=`
                <div class="order-card">
                    <h4>${data.customerName}</h4>
                    <p>৳ ${data.total}</p>
                    <p>Status: ${data.status}</p>
                    <button onclick="markDelivered('${doc.id}')">
                        Mark Delivered
                    </button>
                </div>
            `;
        });

        document.getElementById("total-orders").innerText=totalOrders;
        document.getElementById("total-sales").innerText=totalSales;
        document.getElementById("pending-orders").innerText=pending;
        document.getElementById("delivered-orders").innerText=delivered;
    });
}

function markDelivered(id){
    db.collection("orders").doc(id).update({
        status:"Delivered"
    });
}

loadProducts();
loadAdminDashboard();
