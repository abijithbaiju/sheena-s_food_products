/* Sheenas Food Product — Ammachede Achar | Shared application engine */

// ---------- EDITABLE CONFIG ----------
const SHIPPING_RATES = {
  kerala: { label: 'Kerala', charge: 70 },
  south:  { label: 'Rest of South India', charge: 100 },
  rest:   { label: 'Rest of India', charge: 140 }
};
const SOUTH_STATES = ['Tamil Nadu','Karnataka','Andhra Pradesh','Telangana','Puducherry'];
const PRICE_PER_KG = { veg: 400, 'non-veg': 1500 };
const JAR_SIZES = [
  { grams: 100,  mult: 0.1  },
  { grams: 250,  mult: 0.25 },
  { grams: 500,  mult: 0.5  },
  { grams: 1000, mult: 1.0  }
];
const COMBO_DISCOUNT = 0.15;
const COMBO_SIZE_GRAMS = 250;
// -------------------------------------

// ---------- PRODUCT DATA ----------
const picklesData = [
  { id:'p1', name:'Signature Chicken Pickle', category:'non-veg', spiceLevel:3, 
    image:'WhatsApp Image 2026-10-19 at 8.47.40 AM.jpeg',
    description:'Tender chicken pieces marinated in ginger-garlic paste and traditional roasted Kerala spices. Slow cooked to perfection.',
    ingredients:'Chicken, Gingelly Oil, Red Chilli, Garlic, Ginger, Fenugreek, Mustard, Vinegar, Salt.' },
  { id:'p2', name:'Spicy Beef Pickle', category:'non-veg', spiceLevel:3, 
    image:'beef.jpeg',
    description:'Rich, robustly spiced beef fry pickle with crisp coconut slivers and curry leaves cooked in dark sesame oil.',
    ingredients:'Prime Beef, Fried Coconut Slivers, Curry Leaves, Garam Masala, Mustard, Sesame Oil.' },
  { id:'p3', name:'Traditional Fish Pickle', category:'non-veg', spiceLevel:2, 
    image:'fish.jpeg',
    description:'Fish cubes pan-fried and pickled with tanginess from Kudampuli (Malabar Tamarind).',
    ingredients:'King Fish, Malabar Tamarind, Kashmiri Chilli, Garlic, Green Chilli, Mustard Oil.' },
  { id:'p4', name:'Fresh Prawn Pickle', category:'non-veg', spiceLevel:2, 
    image:'p.jpg',
    description:'Juicy prawns tossed in hot aromatic spicy gravy. A seafood lover’s dream accompaniment.',
    ingredients:'Prawns, Fenugreek Powder, Asafoetida, Mustard, Vinegar, Sesame Oil.' },
  { id:'p5', name:'Raw Mango Pickle (Kanni Manga)', category:'veg', spiceLevel:2, 
    image:'Gemini_Generated_Image_3wq9la3wq9la3wq9.png',
    description:'Crisp raw green mango cubes steeped in sun-dried red chilli powder, hing, and mustard oil. Timeless classic.',
    ingredients:'Raw Green Mango, Mustard Seeds, Kashmiri Chilli, Asafoetida (Hing), Gingelly Oil.' },
  { id:'p6', name:'Tangy Lemon Pickle', category:'veg', spiceLevel:1, 
    image:'lemon.jpeg',
    description:'Sun-cured juicy yellow lemons aged naturally for soft texture and sour-spicy lip-smacking flavor.',
    ingredients:'Juicy Lemons, Turmeric, Red Chilli, Roasted Fenugreek, Gingelly Oil, Salt.' },
  { id:'p7', name:'Spicy Garlic Pickle', category:'veg', spiceLevel:3, 
    image:'g.jpg',
    description:'Whole peeled garlic cloves sautéed till tender and steeped in red hot spicy tamarind gravy.',
    ingredients:'Peeled Garlic, Tamarind Pulp, Mustard Powder, Chilli Powder, Gingelly Oil.' },
  { id:'p8', name:'Green Chilli Kanthari Pickle', category:'veg', spiceLevel:3, 
    image:'chilli.jpeg',
    description:'Bird’s eye green chillies quick-pickled with vinegar and ginger for an intense fiery punch.',
    ingredients:'Birdseye Green Chillies, Lemon Juice, Vinegar, Mustard, Salt.' }
];

// ---------- UTILITIES ----------
function priceFor(category, grams) {
  const perKg = PRICE_PER_KG[category];
  const size = JAR_SIZES.find(j => j.grams === grams) || JAR_SIZES[1];
  return Math.round(perKg * size.mult);
}
function formatQty(g) { return g >= 1000 ? (g/1000) + ' kg' : g + 'g'; }
function loadJSON(k,f){ try { return JSON.parse(localStorage.getItem(k)) || f; } catch { return f; } }
function saveJSON(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (err) { console.warn('Could not save site data in this browser.', err); } }

// ---------- STATE ----------
const savedCart = loadJSON('sheenas_cart', []);
let cart = (Array.isArray(savedCart) ? savedCart : []).filter(c => c && typeof c.name === 'string' && Number.isFinite(Number(c.price)) && Number(c.price) >= 0 && Number.isFinite(Number(c.qty)) && Number(c.qty) > 0 && Number.isFinite(Number(c.grams)) && Number(c.grams) > 0).map(c => ({...c, price:Number(c.price), qty:Math.floor(Number(c.qty)), grams:Number(c.grams)}));
let currentCategory = 'all';
let comboSelection = [];
let comboBoxType = null;
let selectedState = 'Kerala';
const newUserUsed = () => localStorage.getItem('sheenas_newbox_used') === '1';

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  injectCartDrawer();
  initHeader();
  updateCartUI();
  if (document.getElementById('productGrid')) {
    renderProducts();
    renderComboGrid();
    initProductsPageControls();
  }
});

function initHeader() {
  const mb = document.getElementById('mobileMenuBtn');
  const mm = document.getElementById('mobileMenu');
  if (mb && mm) {
    mb.addEventListener('click', () => {
      const open = mm.classList.toggle('hidden') === false;
      mb.setAttribute('aria-expanded', String(open));
    });
    mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mm.classList.add('hidden')));
  }
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('closeCartBtn')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  markActiveNav();
}
function markActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path) a.classList.add('nav-active');
  });
}

// ---------- PRODUCTS ----------
function initProductsPageControls() {
  ['btn-all','btn-veg','btn-non-veg'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => filterCategory(id.replace('btn-','')));
  });
  document.getElementById('searchInput')?.addEventListener('input', applyFilters);
  // Update the visible card price whenever its jar-size selector changes.
  document.getElementById('productGrid')?.addEventListener('change', e => {
    const select = e.target.closest('select[id^="weight-"]');
    if (!select) return;
    const id = select.id.replace('weight-', '');
    const item = picklesData.find(p => p.id === id);
    const priceEl = document.getElementById(`price-${id}`);
    if (item && priceEl) priceEl.textContent = `₹${priceFor(item.category, Number(select.value))}`;
  });
}

function renderProducts(itemsToRender = picklesData) {
  const grid = document.getElementById('productGrid');
  const noRes = document.getElementById('noResults');
  if (!grid) return;
  if (itemsToRender.length === 0) { grid.innerHTML=''; noRes?.classList.remove('hidden'); return; }
  noRes?.classList.add('hidden');
  grid.innerHTML = itemsToRender.map(item => {
    const chillies = '🌶️'.repeat(item.spiceLevel);
    return `
    <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div class="relative overflow-hidden bg-gray-100">
        <img src="${item.image}" alt="${item.name}" class="w-full h-48 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500">
        <span class="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md ${item.category==='veg'?'bg-green-700/90':'bg-red-800/90'} text-white">${item.category==='veg'?'🥦 Veg':'🍗 Non-Veg'}</span>
        <span class="absolute top-3 right-3 text-xs bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-md">${chillies}</span>
      </div>
      <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 class="font-serif font-bold text-lg text-charcoal leading-snug group-hover:text-terracotta transition-colors">${item.name}</h3>
          <p class="text-xs text-warmGray mt-1 line-clamp-2">${item.description}</p>
        </div>
        <div class="space-y-3 pt-2 border-t border-gray-100">
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500 font-medium">Jar Size:</span>
            <select id="weight-${item.id}" class="bg-parchment border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:border-terracotta">
              ${JAR_SIZES.map(j=>`<option value="${j.grams}">${formatQty(j.grams)} — ₹${priceFor(item.category,j.grams)}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-baseline justify-between">
            <div><span class="text-xs text-gray-400">From:</span><span id="price-${item.id}" class="text-xl font-bold text-terracotta ml-1">₹${priceFor(item.category,100)}</span><span class="text-[10px] text-gray-400 block">up to ₹${priceFor(item.category,1000)} / kg</span></div>
            <button onclick="openQuickView('${item.id}')" class="text-xs font-semibold text-goldHover hover:underline">Quick View</button>
          </div>
          <p class="text-[10px] text-gray-500 italic">* Prices may vary depending on season.</p>
          <button onclick="addToCartFromCard('${item.id}')" class="w-full py-2.5 bg-terracotta hover:bg-terracottaDark text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center space-x-2">
            <i class="fa-solid fa-cart-plus"></i><span>Add To Cart</span>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.category-btn').forEach(b => { b.classList.remove('bg-terracotta','text-white'); b.classList.add('bg-white','text-charcoal'); });
  const a = document.getElementById(`btn-${cat}`);
  if (a) { a.classList.remove('bg-white','text-charcoal'); a.classList.add('bg-terracotta','text-white'); }
  applyFilters();
}
function applyFilters() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  let list = picklesData;
  if (currentCategory !== 'all') list = list.filter(p => p.category === currentCategory);
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.ingredients.toLowerCase().includes(q));
  renderProducts(list);
}
function resetFilters() { const s=document.getElementById('searchInput'); if(s)s.value=''; filterCategory('all'); }
function focusSearch() { document.getElementById('searchInput')?.focus(); }

// ---------- CART ----------
function addToCartFromCard(id) {
  const item = picklesData.find(p => p.id === id);
  const sel = document.getElementById(`weight-${id}`);
  if (!item || !sel) return;
  const grams = parseInt(sel.value, 10);
  addToCart(item.id, item.name, grams, priceFor(item.category, grams), item.image, item.category);
}
function addToCart(id, name, grams, price, image, category) {
  const ex = cart.find(c => c.id === id && c.grams === grams);
  if (ex) ex.qty += 1;
  else cart.push({ cartItemId: `${id}-${grams}-${Date.now()}`, id, name, grams, price, image, category, qty: 1 });
  saveJSON('sheenas_cart', cart);
  updateCartUI();
  showToast(`Added ${name} (${formatQty(grams)}) to cart!`);
  openCart();
}
function updateCartQty(cartItemId, delta) {
  const i = cart.findIndex(c => c.cartItemId === cartItemId);
  if (i > -1) { cart[i].qty += delta; if (cart[i].qty <= 0) cart.splice(i,1); }
  saveJSON('sheenas_cart', cart);
  updateCartUI();
}
function cartSubtotal() { return cart.reduce((s,c)=>s+c.price*c.qty,0); }
function shippingCharge() {
  if (cart.length === 0) return 0;
  if (selectedState === 'Kerala') return SHIPPING_RATES.kerala.charge;
  if (SOUTH_STATES.includes(selectedState)) return SHIPPING_RATES.south.charge;
  return SHIPPING_RATES.rest.charge;
}
function updateCartUI() {
  const countBadge = document.getElementById('cartCountBadge');
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');
  const container = document.getElementById('cartItemsContainer');
  const stateSel = document.getElementById('stateSelect');

  if (countBadge) countBadge.innerText = cart.reduce((s,c)=>s+c.qty,0);

  if (stateSel && !stateSel.dataset.bound) {
    stateSel.value = selectedState;
    stateSel.addEventListener('change', e => { selectedState = e.target.value; updateCartUI(); });
    stateSel.dataset.bound = '1';
  }
  const sub = cartSubtotal();
  const ship = shippingCharge();
  if (subtotalEl) subtotalEl.innerText = `₹${sub}`;
  if (shippingEl) shippingEl.innerText = cart.length ? `₹${ship}` : '₹0';
  if (totalEl) totalEl.innerText = `₹${sub + ship}`;

  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = `<div class="text-center py-12 text-gray-400 space-y-3"><i class="fa-solid fa-basket-shopping text-4xl text-gray-300"></i><p class="text-sm">Your pickle basket is empty!</p><button onclick="closeCart()" class="text-xs bg-terracotta text-white px-4 py-2 rounded-lg font-bold">Explore Flavors</button></div>`;
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
      <img src="${item.image}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg">
      <div class="flex-1"><h4 class="font-bold text-xs text-charcoal leading-tight">${item.name}</h4><span class="text-[11px] text-gray-500">${String(item.id).startsWith('combo-') ? '3 × 250g Combo Box' : `${formatQty(item.grams)} Jar`}</span><div class="text-xs font-bold text-terracotta mt-1">₹${item.price}</div></div>
      <div class="flex items-center space-x-2 bg-parchment rounded-lg border px-2 py-1">
        <button onclick="updateCartQty('${item.cartItemId}', -1)" class="text-gray-600 hover:text-terracotta text-xs font-bold px-1">−</button>
        <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
        <button onclick="updateCartQty('${item.cartItemId}', 1)" class="text-gray-600 hover:text-terracotta text-xs font-bold px-1">+</button>
      </div>
    </div>`).join('');
}
function openCart(){ document.getElementById('cartOverlay')?.classList.remove('opacity-0','pointer-events-none'); document.getElementById('cartDrawer')?.classList.remove('translate-x-full'); }
function closeCart(){ document.getElementById('cartOverlay')?.classList.add('opacity-0','pointer-events-none'); document.getElementById('cartDrawer')?.classList.add('translate-x-full'); }
function handleCheckout() {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  const sub = cartSubtotal();
  const ship = shippingCharge();
  const lines = cart.map((c, i) => {
    const product = picklesData.find(p => p.id === c.id);
    const label = product ? product.name : (c.name || 'Pickle');
    const sizeLabel = String(c.id).startsWith('combo-') ? '3 × 250g combo box' : formatQty(c.grams);
    return `${i + 1}. ${label} — ${sizeLabel} × ${c.qty} = ₹${c.price * c.qty}`;
  });
  const message = [
    'Hello Sheenas Food Product! I would like to place an order:',
    '',
    ...lines,
    '',
    `Delivery state: ${selectedState}`,
    `Subtotal: ₹${sub}`,
    `Shipping: ₹${ship}`,
    `Estimated total: ₹${sub + ship}`,
    '',
    'Please confirm availability, delivery details and final total.'
  ].join('\n');
  const whatsappWindow = window.open(`https://wa.me/917306319095?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  if (cart.some(c => String(c.id).startsWith('combo-'))) {
    try { localStorage.setItem('sheenas_newbox_used', '1'); } catch {}
    renderComboGrid();
  }
  if (!whatsappWindow) showToast('Your browser blocked the WhatsApp window. Allow pop-ups or use the WhatsApp contact link.');
  else showToast('Order summary opened in WhatsApp. Send it to confirm your order.');
}

// ---------- COMBO ----------
function renderComboGrid() {
  const grid = document.getElementById('comboSelectionGrid');
  if (!grid) return;
  if (newUserUsed()) {
    grid.innerHTML = `<div class="col-span-full text-center text-sm text-gray-300 p-4"><i class="fa-solid fa-circle-info text-gold mr-1"></i>The new-customer combo offer has already been used on this device.</div>`;
    updateComboUI(); return;
  }
  const toggle = `<div class="col-span-full mb-2 flex gap-2 justify-center">
      <button onclick="setComboType('veg')" class="px-4 py-2 rounded-lg text-xs font-bold ${comboBoxType==='veg'?'bg-green-700 text-white':'bg-white/10 text-gray-300 hover:bg-white/20'}">🥦 Veg Box</button>
      <button onclick="setComboType('non-veg')" class="px-4 py-2 rounded-lg text-xs font-bold ${comboBoxType==='non-veg'?'bg-red-800 text-white':'bg-white/10 text-gray-300 hover:bg-white/20'}">🍗 Non-Veg Box</button>
    </div>`;
  const items = picklesData.filter(p => !comboBoxType || p.category === comboBoxType);
  const itemsHtml = items.map(item => {
    const sel = comboSelection.includes(item.id);
    return `<div onclick="toggleComboItem('${item.id}')" class="p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center ${sel?'bg-gold/20 border-gold shadow-md':'bg-charcoal/40 border-white/10 hover:border-white/30'}">
      <img src="${item.image}" class="w-12 h-12 object-cover rounded-full mb-2 border border-gold/40">
      <span class="text-xs font-bold text-white leading-tight line-clamp-1">${item.name}</span>
      <span class="text-[10px] text-gold mt-0.5">₹${priceFor(item.category,COMBO_SIZE_GRAMS)} / 250g</span>
      <span class="mt-2 text-[10px] px-2 py-0.5 rounded ${sel?'bg-gold text-charcoal font-bold':'bg-white/10 text-gray-300'}">${sel?'Selected ✓':'+ Add'}</span>
    </div>`;
  }).join('');
  grid.innerHTML = toggle + itemsHtml;
  updateComboUI();
}
function setComboType(type) { if (comboBoxType === type) return; comboBoxType = type; comboSelection = []; renderComboGrid(); }
function toggleComboItem(id) {
  if (!comboBoxType) { showToast('Choose Veg or Non-Veg box first!'); return; }
  const item = picklesData.find(p=>p.id===id);
  if (item.category !== comboBoxType) return;
  const idx = comboSelection.indexOf(id);
  if (idx > -1) comboSelection.splice(idx,1);
  else { if (comboSelection.length >= 3) { showToast('Max 3 jars per custom box!'); return; } comboSelection.push(id); }
  renderComboGrid();
}
function updateComboUI() {
  const slots = document.getElementById('comboSlots');
  const priceEl = document.getElementById('comboTotalPrice');
  const origEl = document.getElementById('comboOriginalPrice');
  const btn = document.getElementById('addBundleToCartBtn');
  if (!slots) return;
  let raw=0, html='';
  for (let i=0;i<3;i++){
    if (i<comboSelection.length){
      const it = picklesData.find(p=>p.id===comboSelection[i]);
      raw += priceFor(it.category, COMBO_SIZE_GRAMS);
      html += `<div class="bg-gold/20 border border-gold/40 p-2 rounded-lg text-center text-xs text-white"><span class="block truncate font-semibold">${it.name}</span><span class="text-[10px] text-gold">250g Jar</span></div>`;
    } else {
      html += `<div class="border border-dashed border-white/20 p-2 rounded-lg text-center text-xs text-gray-500 flex items-center justify-center">+ Jar ${i+1}</div>`;
    }
  }
  slots.innerHTML = html;
  if (comboSelection.length === 3 && !newUserUsed()) {
    const disc = Math.round(raw*(1-COMBO_DISCOUNT));
    if (priceEl) priceEl.innerText = `₹${disc}`;
    if (origEl) origEl.innerText = `₹${raw}`;
    if (btn) { btn.disabled=false; btn.classList.remove('bg-gray-600','text-gray-300','cursor-not-allowed'); btn.classList.add('bg-gold','text-charcoal','hover:bg-goldHover','cursor-pointer'); }
  } else {
    if (priceEl) priceEl.innerText = '₹0';
    if (origEl) origEl.innerText = '';
    if (btn) { btn.disabled=true; btn.classList.add('bg-gray-600','text-gray-300','cursor-not-allowed'); btn.classList.remove('bg-gold','text-charcoal','hover:bg-goldHover','cursor-pointer'); }
  }
}
function addComboToCart() {
  if (comboSelection.length !== 3) return;
  if (newUserUsed()) { showToast('New-customer combo already used.'); return; }
  const items = comboSelection.map(id => picklesData.find(p=>p.id===id));
  const names = items.map(i=>i.name).join(', ');
  const raw = items.reduce((s,i)=>s+priceFor(i.category,COMBO_SIZE_GRAMS),0);
  const final = Math.round(raw*(1-COMBO_DISCOUNT));
  addToCart(`combo-${Date.now()}`, `New-User Combo Box (3 × 250g: ${names})`, 750, final, items[0].image, 'combo');
  comboSelection = []; comboBoxType = null; renderComboGrid();
}

// ---------- QUICK VIEW ----------
function openQuickView(id) {
  const item = picklesData.find(p=>p.id===id);
  const body = document.getElementById('modalBody'); if (!body) return;
  body.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <img src="${item.image}" alt="${item.name}" class="w-full h-56 md:h-full object-cover rounded-xl border">
      <div class="space-y-4">
        <div><span class="text-xs font-bold uppercase tracking-wider text-terracotta">${item.category==='veg'?'🥦 Vegetarian':'🍗 Non-Vegetarian'}</span><h3 class="font-serif text-2xl font-bold text-charcoal mt-1">${item.name}</h3></div>
        <p class="text-xs text-warmGray leading-relaxed">${item.description}</p>
        <div class="p-3 bg-parchmentDark rounded-lg border text-xs space-y-1"><strong class="text-charcoal block">Key Ingredients:</strong><p class="text-gray-600">${item.ingredients}</p></div>
        <div class="space-y-1"><label class="text-xs text-gray-500 font-medium">Choose Jar Size:</label>
          <select id="qv-weight-${item.id}" class="w-full bg-parchment border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-semibold">
            ${JAR_SIZES.map(j=>`<option value="${j.grams}">${formatQty(j.grams)} — ₹${priceFor(item.category,j.grams)}</option>`).join('')}
          </select>
          <p class="text-[10px] text-gray-500 italic">* Prices may vary depending on season.</p>
        </div>
        <div class="pt-2 flex items-center justify-between">
          <div><span class="text-xs text-gray-400">Per kg:</span><div class="text-2xl font-bold text-terracotta">₹${PRICE_PER_KG[item.category]} <span class="text-xs font-normal text-gray-500">/ kg</span></div></div>
          <button onclick="addFromQuickView('${item.id}')" class="px-5 py-2.5 bg-terracotta text-white font-bold text-xs rounded-xl shadow hover:bg-terracottaDark">Add To Cart</button>
        </div>
      </div>
    </div>`;
  document.getElementById('modalOverlay')?.classList.remove('opacity-0','pointer-events-none');
  document.getElementById('modalContent')?.classList.remove('scale-95');
}
function addFromQuickView(id) {
  const item = picklesData.find(p=>p.id===id);
  const sel = document.getElementById(`qv-weight-${id}`);
  if (!item || !sel) return;
  const grams = parseInt(sel.value,10);
  closeQuickView();
  addToCart(item.id, item.name, grams, priceFor(item.category, grams), item.image, item.category);
}
function closeQuickView() {
  document.getElementById('modalOverlay')?.classList.add('opacity-0','pointer-events-none');
  document.getElementById('modalContent')?.classList.add('scale-95');
}

// ---------- TOAST ----------
function showToast(msg) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;
  msgEl.innerText = msg;
  toast.classList.remove('translate-y-20','opacity-0');
  setTimeout(() => toast.classList.add('translate-y-20','opacity-0'), 3000);
}


// ---------- SHARED CART DRAWER ----------
function injectCartDrawer() {
  const root = document.getElementById('cart-root');
  if (!root) return;
  root.innerHTML = `
    <div id="cartOverlay" class="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 opacity-0 pointer-events-none transition-opacity duration-300"></div>
    <div id="cartDrawer" class="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-parchment z-50 shadow-2xl transform translate-x-full transition-transform duration-300 flex flex-col">
      <div class="p-5 bg-terracotta text-white flex items-center justify-between shadow-md">
        <div class="flex items-center space-x-2"><i class="fa-solid fa-basket-shopping text-gold text-xl"></i><h3 class="font-serif font-bold text-lg">Your Pickle Jar Cart</h3></div>
        <button id="closeCartBtn" class="p-1 hover:text-gold text-white text-xl"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="bg-parchmentDark p-3 border-b border-terracotta/10 text-xs"><p class="text-gray-600"><i class="fa-solid fa-truck-fast text-terracotta mr-1"></i> All-India delivery — shipping charges apply.</p></div>
      <div id="cartItemsContainer" class="flex-1 overflow-y-auto p-5 space-y-4"></div>
      <div class="p-5 bg-white border-t border-gray-200 space-y-3">
        <div class="space-y-2 text-sm">
          <label class="text-xs font-semibold text-charcoal">Delivery State (for shipping):</label>
          <select id="stateSelect" class="w-full bg-parchment border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
            <option value="Kerala">Kerala — ₹${SHIPPING_RATES.kerala.charge}</option>
            <option value="Tamil Nadu">Tamil Nadu — ₹${SHIPPING_RATES.south.charge}</option>
            <option value="Karnataka">Karnataka — ₹${SHIPPING_RATES.south.charge}</option>
            <option value="Andhra Pradesh">Andhra Pradesh — ₹${SHIPPING_RATES.south.charge}</option>
            <option value="Telangana">Telangana — ₹${SHIPPING_RATES.south.charge}</option>
            <option value="Puducherry">Puducherry — ₹${SHIPPING_RATES.south.charge}</option>
            <option value="Other">Rest of India — ₹${SHIPPING_RATES.rest.charge}</option>
          </select>
        </div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between text-gray-600"><span>Subtotal:</span><span id="cartSubtotal">₹0</span></div>
          <div class="flex justify-between text-gray-600"><span>Shipping:</span><span id="cartShipping">₹0</span></div>
          <div class="flex justify-between font-bold text-lg text-charcoal pt-2 border-t"><span>Total:</span><span class="text-terracotta" id="cartTotal">₹0</span></div>
        </div>
        <button onclick="handleCheckout()" class="w-full py-3.5 bg-terracotta hover:bg-terracottaDark text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"><span>Proceed to Checkout</span><i class="fa-solid fa-arrow-right text-xs"></i></button>
        <p class="text-[10px] text-center text-gray-400">Packaging and availability will be confirmed with your order</p>
      </div>
    </div>
    <div id="modalOverlay" onclick="if(event.target===this)closeQuickView()" class="fixed inset-0 bg-charcoal/70 backdrop-blur-sm z-50 opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-4">
      <div id="modalContent" class="bg-parchment max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl relative scale-95 transition-transform duration-300">
        <button onclick="closeQuickView()" aria-label="Close quick view" class="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-charcoal hover:text-terracotta shadow flex items-center justify-center transition-colors"><i class="fa-solid fa-xmark"></i></button>
        <div id="modalBody" class="p-6"></div>
      </div>
    </div>
    <div id="toast" role="status" aria-live="polite" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] translate-y-20 opacity-0 transition-all duration-300 pointer-events-none w-[calc(100%-2rem)] max-w-md">
      <div class="bg-charcoal text-parchment text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gold/30">
        <i class="fa-solid fa-circle-check text-gold"></i><span id="toastMsg"></span>
      </div>
    </div>`;
}
