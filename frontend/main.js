// frontend/main.js
const API_BASE = "http://127.0.0.1:5000/api";

function getUser(){ try { return JSON.parse(localStorage.getItem('user')||'null'); } catch(e){ return null; } }
function setUser(u){ localStorage.setItem('user', JSON.stringify(u)); }
function getCart(){ return JSON.parse(localStorage.getItem('cart') || '[]'); }
function setCart(c){ localStorage.setItem('cart', JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){ const n = getCart().reduce((s,i)=>s+i.quantity,0); const el=document.getElementById('cartCount'); if(el) el.textContent=n; }

// escapeHtml
function escapeHtml(s){ return s ? s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; }

// Load restaurants on index
async function loadRestaurants(){
  const el = document.getElementById('restaurants');
  if(!el) return;
  el.innerHTML = 'Loading...';
  try {
    const res = await fetch(`${API_BASE}/restaurants`);
    const data = await res.json();
    el.innerHTML = '';
    data.forEach(r=>{
      const card = document.createElement('div'); card.className='card';
      let html = `<h3>${escapeHtml(r.name)}</h3><div class="small">📍 ${escapeHtml(r.address)}</div><div class="small">⭐ ${r.rating}</div><hr>`;
      r.menu.forEach(m=>{
        html += `<div class="menu-item"><div>${escapeHtml(m.item_name)}</div><div>₹${m.price} <button class="btn" onclick="addToCart(${r.id},${m.id},'${escapeHtml(m.item_name)}',${m.price})">Add</button></div></div>`;
      });
      card.innerHTML = html; el.appendChild(card);
    });
  } catch(e){
    el.innerHTML = '<div class="notice">Failed to load restaurants</div>';
  }
}

// ADD TO CART
function addToCart(restaurantId, itemId, itemName, price){
  const user = getUser();
  if(!user){ if(!confirm('You must login to order. Go to login?')) return; window.location='login.html'; return; }
  const cart = getCart();
  const existing = cart.find(i=>i.item_id===itemId);
  if(existing){ existing.quantity += 1; }
  else { cart.push({ restaurant_id: restaurantId, item_id: itemId, item_name: itemName, unit_price: price, quantity: 1 }); }
  setCart(cart);
  alert('Added to cart');
}

// DISPLAY CART
function renderCart(){
  const area = document.getElementById('cartArea'); if(!area) return;
  const cart = getCart();
  if(cart.length===0){ area.innerHTML='<div class="notice">Cart is empty</div>'; return; }
  let html = '<table class="table"><tr><th>Item</th><th>Qty</th><th>Price</th><th></th></tr>';
  let total = 0;
  cart.forEach((it,idx)=>{
    const line = it.unit_price * it.quantity; total += line;
    html += `<tr><td>${escapeHtml(it.item_name)}</td><td>${it.quantity}</td><td>₹${line.toFixed(2)}</td><td><button onclick="removeFromCart(${idx})" class="btn">Remove</button></td></tr>`;
  });
  html += `</table><p><strong>Total: ₹${total.toFixed(2)}</strong></p>`;
  html += `<div><h4>Address</h4><textarea id="address" rows="3" style="width:100%"></textarea><h4>Payment</h4>
    <select id="payment_method"><option value="COD">Cash on Delivery</option><option value="CARD">Card</option><option value="UPI">UPI</option></select>
    <br/><br/><button class="btn" onclick="checkout()">Checkout</button></div>`;
  area.innerHTML = html;
}

// remove from cart
function removeFromCart(idx){
  const cart = getCart(); cart.splice(idx,1); setCart(cart); renderCart();
}

// checkout
async function checkout(){
  const user = getUser(); if(!user){ alert('Login required'); window.location='login.html'; return; }
  const cart = getCart(); if(cart.length===0){ alert('Cart empty'); return; }
  const addr = document.getElementById('address').value;
  const payment_method = document.getElementById('payment_method').value;
  const payload = {
    customer_id: user.id,
    address: addr,
    payment_method,
    items: cart.map(i=>({ item_id: i.item_id, quantity: i.quantity }))
  };
  try {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    });
    const j = await res.json();
    if(res.ok && j.success){
      setCart([]); // clear cart
      alert(`Order placed (id ${j.order_id}). Payment status: ${j.payment_status}`);
      // redirect to order page
      window.location = `order.html?order_id=${j.order_id}`;
    } else {
      alert(j.message || 'Checkout failed');
    }
  } catch(e){ alert('Network error'); }
}

// load order page
async function loadOrderPage(){
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order_id');
  const area = document.getElementById('orderArea'); if(!area) return;
  if(!orderId){ area.innerHTML = '<div class="notice">No order selected</div>'; return; }
  area.innerHTML = 'Loading...';
  try {
    const res = await fetch(`${API_BASE}/order/${orderId}`);
    if(!res.ok){ area.innerHTML = '<div class="notice">Order not found</div>'; return; }
    const o = await res.json();
    let html = `<h3>Order #${o.id}</h3><p>Status: <strong>${o.status}</strong> | Payment: <strong>${o.payment_status} (${o.payment_method})</strong></p>`;
    html += `<h4>Items</h4><ul>` + o.items.map(it=>`<li>${escapeHtml(it.item_name)} x ${it.quantity} — ₹${(it.unit_price*it.quantity).toFixed(2)}</li>`).join('') + `</ul>`;
    html += `<p><strong>Total: ₹${o.total_price}</strong></p>`;
    area.innerHTML = html;
  } catch(e){ area.innerHTML = '<div class="notice">Error loading order</div>'; }
}

// login/register handlers
async function handleRegister(e){
  e && e.preventDefault();
  const name = document.getElementById('rname').value;
  const email = document.getElementById('remail').value;
  const password = document.getElementById('rpassword').value;
  const msgEl = document.getElementById('registerMsg');
  msgEl.textContent = 'Registering...';
  try {
    const res = await fetch(`${API_BASE}/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,password})});
    const j = await res.json();
    msgEl.textContent = j.message || j.message;
    if(res.ok){ setTimeout(()=>window.location='login.html',800); }
  } catch(e){ msgEl.textContent = 'Error registering'; }
}

async function handleLogin(e){
  e && e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const msgEl = document.getElementById('loginMsg');
  msgEl.textContent = 'Logging in...';
  try {
    const res = await fetch(`${API_BASE}/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password})});
    const j = await res.json();
    if(res.ok && j.success){
      setUser(j.user); msgEl.textContent = 'Login successful'; setTimeout(()=>window.location='index.html',600);
    } else { msgEl.textContent = j.message || 'Login failed'; }
  } catch(e){ msgEl.textContent = 'Error logging in'; }
}

// Admin: load orders and update status
async function adminLoadOrders(){
  const adminId = document.getElementById('adminId').value;
  if(!adminId) { alert('Enter admin user id'); return; }
  try {
    const res = await fetch(`${API_BASE}/admin/orders?admin_user_id=${adminId}`);
    const j = await res.json();
    if(!res.ok){ alert(j.message||'Error'); return; }
    const area = document.getElementById('adminArea'); area.innerHTML = '';
    let html = '<table class="table"><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Action</th></tr>';
    j.forEach(o => {
      html += `<tr><td>${o.id}</td><td>${escapeHtml(o.customer_name)}</td><td>₹${o.total_price}</td><td>${o.status}</td><td>${o.payment_status}</td><td>
        <select id="st_${o.id}"><option>PLACED</option><option>CONFIRMED</option><option>PREPARING</option><option>OUT_FOR_DELIVERY</option><option>DELIVERED</option><option>CANCELLED</option></select>
        <button onclick="updateOrderStatus(${o.id})" class="btn">Update</button>
      </td></tr>`;
    });
    html += '</table>';
    area.innerHTML = html;
  } catch(e){ alert('Error loading'); }
}

async function updateOrderStatus(orderId){
  const adminId = document.getElementById('adminId').value;
  const sel = document.getElementById(`st_${orderId}`);
  const newStatus = sel.value;
  try {
    const res = await fetch(`${API_BASE}/admin/order/${orderId}/status`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ admin_user_id: adminId, status: newStatus })});
    const j = await res.json();
    if(res.ok && j.success){ alert('Status updated'); adminLoadOrders(); } else alert(j.message||'Failed');
  } catch(e){ alert('Error'); }
}

// page initializations
document.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount();
  // index page
  if(document.getElementById('restaurants')) loadRestaurants();

  // cart page
  if(document.getElementById('cartArea')) renderCart();

  // order page
  if(document.getElementById('orderArea')) loadOrderPage();

  // register
  const regForm = document.getElementById('registerForm'); if(regForm) regForm.addEventListener('submit', handleRegister);

  // login
  const loginForm = document.getElementById('loginForm'); if(loginForm) loginForm.addEventListener('submit', handleLogin);

  // admin
  const loadBtn = document.getElementById('loadOrders'); if(loadBtn) loadBtn.addEventListener('click', adminLoadOrders);
});
