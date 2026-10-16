// ─── Fresh Basket — Products (10, PKR) ─────────────────────────────
const PRODUCTS = [
  { id: 1,  name: "Tomato",         urdu: "Tamatar",     price: 120, old: 150, unit: "per kg",   cat: "fruit", img: "assets/tomato.svg",  badge: "Fresh" },
  { id: 2,  name: "Potato",         urdu: "Aloo",         price: 80,  old: 100, unit: "per kg",   cat: "root",  img: "assets/potato.svg",  badge: "" },
  { id: 3,  name: "Onion",          urdu: "Pyaz",         price: 140, old: 170, unit: "per kg",   cat: "root",  img: "assets/onion.svg",   badge: "" },
  { id: 4,  name: "Spinach",        urdu: "Palak",        price: 60,  old: 80,  unit: "per bunch",cat: "leafy", img: "assets/spinach.svg", badge: "Organic" },
  { id: 5,  name: "Carrot",         urdu: "Gajar",        price: 110, old: 130, unit: "per kg",   cat: "root",  img: "assets/carrot.svg",  badge: "" },
  { id: 6,  name: "Green Chili",    urdu: "Hari Mirch",   price: 200, old: 240, unit: "per kg",   cat: "fruit", img: "assets/chili.svg",   badge: "Hot" },
  { id: 7,  name: "Brinjal",        urdu: "Baingan",      price: 130, old: 160, unit: "per kg",   cat: "fruit", img: "assets/brinjal.svg", badge: "" },
  { id: 8,  name: "Lady Finger",    urdu: "Bhindi",       price: 160, old: 190, unit: "per kg",   cat: "fruit", img: "assets/okra.svg",    badge: "New" },
  { id: 9,  name: "Cucumber",       urdu: "Kheera",       price: 100, old: 120, unit: "per kg",   cat: "fruit", img: "assets/cucumber.svg",badge: "" },
  { id: 10, name: "Peas",           urdu: "Matar",        price: 180, old: 210, unit: "per kg",   cat: "leafy", img: "assets/peas.svg",    badge: "Seasonal" },
];
const API = ""; // same origin
const fmt = n => "PKR " + n.toLocaleString("en-PK");
const $ = s => document.querySelector(s);

// ─── State ─────────────────────────────────────────────────────────
let cart = JSON.parse(localStorage.getItem("fb_cart") || "[]");
let currentCat = "all";

// ─── Loader ────────────────────────────────────────────────────────
window.addEventListener("load", () => setTimeout(() => $("#loader").classList.add("hide"), 500));

// ─── Toast ─────────────────────────────────────────────────────────
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 2600);
}

// ─── Particles ─────────────────────────────────────────────────────
(function particles() {
  const c = $("#particles"), x = c.getContext("2d");
  let w, h, pts = [];
  const resize = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
  addEventListener("resize", resize); resize();
  for (let i = 0; i < 70; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: Math.random() * 2 + 1 });
  (function loop() {
    x.clearRect(0, 0, w, h);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fillStyle = "rgba(74,222,128,.5)"; x.fill();
    });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
      if (d < 130) { x.beginPath(); x.moveTo(pts[i].x, pts[i].y); x.lineTo(pts[j].x, pts[j].y); x.strokeStyle = `rgba(163,230,53,${.16 * (1 - d / 130)})`; x.stroke(); }
    }
    requestAnimationFrame(loop);
  })();
})();

// ─── Cursor glow ───────────────────────────────────────────────────
addEventListener("pointermove", e => {
  const g = $("#cursorGlow");
  g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px";
});

// ─── Hero 3D parallax ──────────────────────────────────────────────
const hero3d = $("#hero3d");
if (hero3d) {
  hero3d.addEventListener("pointermove", e => {
    const r = hero3d.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - .5) * -16;
    const ry = ((e.clientX - r.left) / r.width - .5) * 20;
    hero3d.querySelector(".scene").style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  hero3d.addEventListener("pointerleave", () => hero3d.querySelector(".scene").style.transform = "");
}

// ─── 3D tilt (cards + why-cards) ───────────────────────────────────
function attachTilt(el) {
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.transform = `rotateY(${(px - .5) * 14}deg) rotateX(${(.5 - py) * 12}deg) translateY(-6px)`;
    el.style.setProperty("--mx", px * 100 + "%");
    el.style.setProperty("--my", py * 100 + "%");
  });
  el.addEventListener("pointerleave", () => el.style.transform = "");
}

// ─── Products render ───────────────────────────────────────────────
function renderProducts() {
  const grid = $("#productGrid");
  const list = PRODUCTS.filter(p => currentCat === "all" || p.cat === currentCat);
  grid.innerHTML = list.map((p, i) => `
    <div class="card" style="animation-delay:${i * .07}s" data-id="${p.id}">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <div class="card-img"><img src="${p.img}" alt="${p.name}"></div>
      <h3>${p.name}</h3>
      <div class="unit">${p.urdu} · ${p.unit}</div>
      <div><span class="price">${fmt(p.price)}</span><span class="old-price">${fmt(p.old)}</span></div>
      <div class="row-btns">
        <button class="btn btn-primary btn-full add-btn">Add to Cart</button>
      </div>
    </div>`).join("");
  grid.querySelectorAll(".card").forEach(attachTilt);
  grid.querySelectorAll(".add-btn").forEach(btn => btn.addEventListener("click", () => {
    addToCart(+btn.closest(".card").dataset.id);
  }));
}

$("#filters").addEventListener("click", e => {
  const b = e.target.closest(".filter");
  if (!b) return;
  document.querySelectorAll(".filter").forEach(f => f.classList.remove("active"));
  b.classList.add("active");
  currentCat = b.dataset.cat;
  renderProducts();
});

document.querySelectorAll(".why-card").forEach(attachTilt);

// ─── Counters ──────────────────────────────────────────────────────
const io = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target, target = +el.dataset.target;
  let n = 0;
  const step = () => { n += Math.max(1, target / 45); if (n >= target) el.textContent = target; else { el.textContent = Math.floor(n); requestAnimationFrame(step); } };
  step(); io.unobserve(el);
}), { threshold: .6 });
document.querySelectorAll(".counter").forEach(c => io.observe(c));

// ─── Cart ──────────────────────────────────────────────────────────
function saveCart() { localStorage.setItem("fb_cart", JSON.stringify(cart)); }
function cartQty() { return cart.reduce((s, i) => s + i.qty, 0); }
function cartTotal() { return cart.reduce((s, i) => s + i.qty * PRODUCTS.find(p => p.id === i.id).price, 0); }

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++; else cart.push({ id, qty: 1 });
  saveCart(); renderCart();
  toast(PRODUCTS.find(p => p.id === id).name + " added to cart 🛒");
}
function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart();
}

function renderCart() {
  $("#cartCount").textContent = cartQty();
  $("#cartTotal").textContent = fmt(cartTotal());
  const box = $("#cartItems");
  if (!cart.length) { box.innerHTML = `<p style="color:var(--muted);text-align:center;padding:30px 0">Cart is empty</p>`; }
  else box.innerHTML = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `<div class="cart-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="ci-info"><b>${p.name}</b><span>${fmt(p.price)} ${p.unit}</span></div>
      <div class="qty"><button data-id="${p.id}" data-d="-1">−</button><span>${i.qty}</span><button data-id="${p.id}" data-d="1">+</button></div>
    </div>`;
  }).join("");
  box.querySelectorAll(".qty button").forEach(b => b.addEventListener("click", () => changeQty(+b.dataset.id, +b.dataset.d)));
  updateOrderSummary(); updateWaLink();
}

function updateOrderSummary() {
  const s = $("#orderSummary");
  if (!cart.length) { s.textContent = "Your cart is empty — add vegetables first!"; return; }
  s.innerHTML = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `${i.qty} × ${p.name} (${fmt(p.price * i.qty)})`;
  }).join(" · ") + ` — <b style="color:var(--green)">Total ${fmt(cartTotal())}</b>`;
}

function updateWaLink() {
  const lines = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return `• ${i.qty} × ${p.name} — ${fmt(p.price * i.qty)}`;
  });
  const txt = `Hi Fresh Basket! I want to order:%0A${lines.join("%0A")}%0A%0ATotal: ${fmt(cartTotal())}`;
  $("#waOrder").href = `https://wa.me/923214026676?text=${txt}`;
}

$("#cartBtn").addEventListener("click", () => $("#cartPanel").classList.add("open"));
$("#closeCart").addEventListener("click", () => $("#cartPanel").classList.remove("open"));
$("#checkoutBtn").addEventListener("click", () => { $("#cartPanel").classList.remove("open"); $("#order").scrollIntoView({ behavior: "smooth" }); });

// ─── Order form → backend API ──────────────────────────────────────
$("#orderForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!cart.length) { toast("Add vegetables to cart first!"); return; }
  const payload = {
    name: $("#custName").value.trim(),
    phone: $("#custPhone").value.trim(),
    address: $("#custAddress").value.trim(),
    items: cart.map(i => ({ id: i.id, name: PRODUCTS.find(p => p.id === i.id).name, qty: i.qty, price: PRODUCTS.find(p => p.id === i.id).price })),
    total: cartTotal(),
  };
  try {
    const r = await fetch(API + "/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const j = await r.json();
    if (j.ok) {
      toast(`Order #${j.id} placed! We'll call you soon ✅`);
      cart = []; saveCart(); renderCart(); e.target.reset();
    } else toast(j.error || "Order failed");
  } catch { toast("Backend not reachable — use WhatsApp order"); }
});

// ─── Boot: try backend products, fallback to local ─────────────────
(async function boot() {
  try {
    const r = await fetch(API + "/api/products");
    const j = await r.json();
    if (j.ok && Array.isArray(j.products) && j.products.length) {
      j.products.forEach(p => {
        const local = PRODUCTS.find(x => x.id === p.id);
        if (local) Object.assign(local, p);
      });
    }
  } catch { /* static/GitHub Pages mode — local list already loaded */ }
  renderProducts(); renderCart();
})();
