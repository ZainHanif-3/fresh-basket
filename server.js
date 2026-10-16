// ─── Fresh Basket — Backend (zero-dependency Node.js) ──────────────
// Serves the static site + REST API: products, orders, health.
// Data persists to data/orders.json. Run: node server.js  (PORT env optional)
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const PORT = process.env.PORT || 3600;

const PRODUCTS = [
  { id: 1,  name: "Tomato",      urdu: "Tamatar",   price: 120, old: 150, unit: "per kg",    cat: "fruit", img: "assets/tomato.svg",  badge: "Fresh" },
  { id: 2,  name: "Potato",      urdu: "Aloo",      price: 80,  old: 100, unit: "per kg",    cat: "root",  img: "assets/potato.svg",  badge: "" },
  { id: 3,  name: "Onion",       urdu: "Pyaz",      price: 140, old: 170, unit: "per kg",    cat: "root",  img: "assets/onion.svg",   badge: "" },
  { id: 4,  name: "Spinach",     urdu: "Palak",     price: 60,  old: 80,  unit: "per bunch", cat: "leafy", img: "assets/spinach.svg", badge: "Organic" },
  { id: 5,  name: "Carrot",      urdu: "Gajar",     price: 110, old: 130, unit: "per kg",    cat: "root",  img: "assets/carrot.svg",  badge: "" },
  { id: 6,  name: "Green Chili", urdu: "Hari Mirch",price: 200, old: 240, unit: "per kg",    cat: "fruit", img: "assets/chili.svg",   badge: "Hot" },
  { id: 7,  name: "Brinjal",     urdu: "Baingan",   price: 130, old: 160, unit: "per kg",    cat: "fruit", img: "assets/brinjal.svg", badge: "" },
  { id: 8,  name: "Lady Finger", urdu: "Bhindi",    price: 160, old: 190, unit: "per kg",    cat: "fruit", img: "assets/okra.svg",    badge: "New" },
  { id: 9,  name: "Cucumber",    urdu: "Kheera",    price: 100, old: 120, unit: "per kg",    cat: "fruit", img: "assets/cucumber.svg",badge: "" },
  { id: 10, name: "Peas",        urdu: "Matar",     price: 180, old: 210, unit: "per kg",    cat: "leafy", img: "assets/peas.svg",    badge: "Seasonal" },
];

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".ico": "image/x-icon", ".md": "text/markdown; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function readOrders() {
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8")); } catch { return []; }
}
function writeOrders(list) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2));
}
function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}
function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0, chunks = [];
    req.on("data", c => {
      size += c.length;
      if (size > limit) { reject(new Error("payload too large")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}
function validPhone(p) { return /^(\+?92|0)?3\d{9}$/.test(String(p).replace(/[\s-]/g, "")); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const p = url.pathname;

  // ── API ──
  if (p === "/api/products" && req.method === "GET") {
    return sendJSON(res, 200, { ok: true, count: PRODUCTS.length, products: PRODUCTS });
  }
  if (p === "/api/health" && req.method === "GET") {
    return sendJSON(res, 200, { ok: true, service: "fresh-basket", orders: readOrders().length, uptime: Math.round(process.uptime()) });
  }
  if (p === "/api/orders" && req.method === "GET") {
    const key = url.searchParams.get("key");
    if (key !== "fresh2026") return sendJSON(res, 401, { ok: false, error: "unauthorized" });
    const orders = readOrders();
    return sendJSON(res, 200, { ok: true, count: orders.length, orders });
  }
  if (p === "/api/orders" && req.method === "POST") {
    try {
      const b = await readBody(req);
      if (!b.name || String(b.name).trim().length < 2) return sendJSON(res, 400, { ok: false, error: "name required" });
      if (!validPhone(b.phone)) return sendJSON(res, 400, { ok: false, error: "valid PK phone required (e.g. 03214026676)" });
      if (!b.address || String(b.address).trim().length < 6) return sendJSON(res, 400, { ok: false, error: "address required" });
      if (!Array.isArray(b.items) || !b.items.length) return sendJSON(res, 400, { ok: false, error: "cart is empty" });
      const items = b.items.map(i => {
        const prod = PRODUCTS.find(x => x.id === +i.id);
        if (!prod) throw new Error("unknown product id");
        const qty = Math.max(1, Math.min(99, parseInt(i.qty, 10) || 1));
        return { id: prod.id, name: prod.name, qty, price: prod.price, subtotal: prod.price * qty };
      });
      const total = items.reduce((s, i) => s + i.subtotal, 0);
      const orders = readOrders();
      const order = {
        id: orders.length ? orders[orders.length - 1].id + 1 : 1001,
        ts: new Date().toISOString(),
        name: String(b.name).trim().slice(0, 80),
        phone: String(b.phone).trim().slice(0, 20),
        address: String(b.address).trim().slice(0, 300),
        items, total, status: "new",
      };
      orders.push(order);
      writeOrders(orders);
      return sendJSON(res, 201, { ok: true, id: order.id, total, status: "new" });
    } catch (e) {
      return sendJSON(res, 400, { ok: false, error: e.message || "bad request" });
    }
  }
  if (p.startsWith("/api/")) return sendJSON(res, 404, { ok: false, error: "not found" });

  // ── Static files ──
  let file = p === "/" ? "/index.html" : p;
  file = path.normalize(file).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(ROOT, file);
  if (!full.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.stat(full, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(full).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    fs.createReadStream(full).pipe(res);
  });
});

server.listen(PORT, () => console.log(`Fresh Basket backend → http://localhost:${PORT}`));
