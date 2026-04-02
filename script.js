// Data Store
const menuData = [
    { id: 1, name: "Truffle Mushroom Soup", cat: "Starters", price: 450, desc: "Creamy wild mushroom soup infused with truffle oil.", img: "./Resources/Truffle%20Mushroom%20Soup.jpg" },
    { id: 2, name: "Crispy Calamari", cat: "Starters", price: 600, desc: "Golden fried calamari rings with tartar sauce.", img: "./Resources/Crispy%20Calamari.jpg" },
    { id: 3, name: "Grilled Salmon", cat: "Main Course", price: 1800, desc: "Atlantic salmon with asparagus and lemon butter.", img: "./Resources/Grilled%20Salmon.jpg" },
    { id: 4, name: "Woodfired Margherita", cat: "Main Course", price: 850, desc: "Classic Neapolitan pizza with fresh basil.", img: "./Resources/Woodfired%20Margherita.jpg" },
    { id: 5, name: "Chicken Tikka Masala", cat: "Main Course", price: 750, desc: "Rich and creamy traditional curry with naan.", img: "./Resources/Chicken%20Tikka%20Masala.jpg" },
    { id: 6, name: "New York Cheesecake", cat: "Desserts", price: 500, desc: "Baked cheesecake with berry compote.", img: "./Resources/New%20York%20Cheesecake.jpg" },
    { id: 7, name: "Tiramisu", cat: "Desserts", price: 550, desc: "Classic Italian coffee-flavored dessert.", img: "./Resources/Tiramisu.jpg" },
    { id: 8, name: "Classic Mojito", cat: "Beverages", price: 350, desc: "Refreshing mint, lime, and soda.", img: "./Resources/Classic%20Mojito.jpg" }
];

let cart = [];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    renderTables('All');
    initRating();
    initScroll();
    
    // Populate home page popular items
    const homeGrid = document.getElementById('homePopularGrid');
    if(homeGrid) {
        menuData.slice(2, 6).forEach(item => {
            homeGrid.innerHTML += `
                <div class="card p-0 overflow-hidden">
                    <img src="${item.img}" style="width:100%; height:140px; object-fit:cover;">
                    <div class="p-1">
                        <h4>${item.name}</h4>
                        <p class="text-primary font-bold">Rs.${item.price}</p>
                    </div>
                </div>
            `;
        });
    }
});

// Navigation
function navigate(pageId) {
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    // We can't rely on event.target here easily if called from JS, better logic:
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if(link.getAttribute('onclick')?.includes(pageId)) link.classList.add('active');
    });
    
    document.getElementById('navLinks')?.classList.remove('show');
    window.scrollTo(0,0);
}

// Add to Cart
function addToCart(id) {
    const item = menuData.find(i => i.id === id);
    const exists = cart.find(i => i.id === id);
    if(exists) exists.qty++;
    else cart.push({...item, qty: 1});
    
    updateCartUI();
    showToast(`Added ${item.name} to cart!`, 'success');
}

// Update Cart UI
function updateCartUI() {
    // Update Badge
    const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
    const badge = document.getElementById('cartBadge');
    if(badge) badge.innerText = totalItems;
    
    // Update Order Sidebar
    const container = document.getElementById('cartItemsContainer');
    if(!container) return;
    
    container.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        container.innerHTML += `
            <div class="flex justify-between items-center mb-1" style="font-size:0.9rem">
                <span>${item.qty}x ${item.name}</span>
                <span>Rs.${itemTotal}</span>
            </div>
        `;
    });
    
    const subtotalEl = document.getElementById('cartSubtotal');
    if(subtotalEl) subtotalEl.innerText = `Rs.${subtotal}`;
    
    const diningOption = document.getElementById('diningOption');
    const isDelivery = diningOption?.value === 'delivery';
    const deliveryFee = isDelivery ? 100 : 0;
    
    const totalEl = document.getElementById('cartTotal');
    if(totalEl) totalEl.innerText = `Rs.${subtotal + deliveryFee}`;
}

// Toggle Delivery
function toggleDeliveryForm() {
    const diningOption = document.getElementById('diningOption');
    const val = diningOption?.value;
    const form = document.getElementById('deliveryForm');
    const row = document.getElementById('deliveryFeeRow');
    if(form) form.style.display = val === 'delivery' ? 'block' : 'none';
    if(row) row.style.display = val === 'delivery' ? 'flex' : 'none';
    updateCartUI();
}

// Place Order
function placeOrder() {
    if(cart.length === 0) {
        showToast("Your cart is empty!", "error");
        return;
    }
    const diningOption = document.getElementById('diningOption');
    if(diningOption?.value === 'delivery') {
        const form = document.getElementById('deliveryForm');
        if(!form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    navigate('page-payment');
}

// Render Menu
let currentFilter = 'All';
function filterMenu(cat) {
    currentFilter = cat;
    renderMenu();
}

function renderMenu() {
    const search = document.getElementById('menuSearch')?.value.toLowerCase() || '';
    const grid1 = document.getElementById('mainMenuGrid');
    const grid2 = document.getElementById('orderGrid');
    
    const filtered = menuData.filter(item => {
        const matchCat = currentFilter === 'All' || item.cat === currentFilter;
        const matchSearch = item.name.toLowerCase().includes(search);
        return matchCat && matchSearch;
    });
    
    const html = filtered.map(item => `
        <div class="card p-0 overflow-hidden">
            <img src="${item.img}" style="width:100%; height:200px; object-fit:cover;">
            <div class="p-1 flex flex-col" style="height:100%">
                <span style="font-size:0.8rem; color:#888">${item.cat}</span>
                <h3 style="margin-bottom: 0.2rem">${item.name}</h3>
                <p style="font-size:0.9rem; flex-grow:1; margin-bottom:1rem">${item.desc}</p>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-primary font-bold" style="font-size:1.1rem">Rs.${item.price}</span>
                    <button class="btn btn-outline" style="padding: 0.4rem 0.8rem;" onclick="addToCart(${item.id})">Add</button>
                </div>
            </div>
        </div>
    `).join('');

    if(grid1) grid1.innerHTML = html;
    if(grid2) grid2.innerHTML = html; // Reuse same cards for Order page
}

// Render Tables
function renderTables(filter) {
    const container = document.getElementById('tablesContainer');
    if(!container) return;
    
    let html = '<div class="grid grid-2" style="gap:3rem">';
    
    if(filter === 'All' || filter === 'Indoor') {
        html += `<div><h3 class="mb-1 text-center">Indoor Dining</h3><div class="table-grid">
            <div class="dine-table table-available" onclick="bookTable('T-01', 'Indoor', 4)">T-01<small>4 Seats</small></div>
            <div class="dine-table table-reserved">T-02<small>2 Seats</small></div>
            <div class="dine-table table-available" onclick="bookTable('T-03', 'Indoor', 6)">T-03<small>6 Seats</small></div>
            <div class="dine-table table-available" onclick="bookTable('T-04', 'Indoor', 4)">T-04<small>4 Seats</small></div>
            <div class="dine-table table-reserved">T-05<small>8 Seats</small></div>
            <div class="dine-table table-available" onclick="bookTable('T-06', 'Indoor', 2)">T-06<small>2 Seats</small></div>
        </div></div>`;
    }
    if(filter === 'All' || filter === 'Outdoor') {
        html += `<div><h3 class="mb-1 text-center">Outdoor Patio</h3><div class="table-grid">
            <div class="dine-table table-available" onclick="bookTable('O-01', 'Outdoor', 4)">O-01<small>4 Seats</small></div>
            <div class="dine-table table-available" onclick="bookTable('O-02', 'Outdoor', 2)">O-02<small>2 Seats</small></div>
            <div class="dine-table table-reserved">O-03<small>6 Seats</small></div>
            <div class="dine-table table-available" onclick="bookTable('O-04', 'Outdoor', 4)">O-04<small>4 Seats</small></div>
        </div></div>`;
    }
    html += '</div>';
    
    html += `
    <div class="flex justify-center gap-3 mt-3">
        <span class="flex items-center gap-1"><div style="width:15px;height:15px;background:var(--success);border-radius:3px;"></div> Available (Click to book)</span>
        <span class="flex items-center gap-1"><div style="width:15px;height:15px;background:var(--danger);border-radius:3px;"></div> Reserved</span>
    </div>`;
    
    container.innerHTML = html;
}

function bookTable(tableId, loc, seats) {
    const display = document.getElementById('bookTableDisplay');
    if(display) display.value = `${tableId} (${loc}, ${seats} Seats)`;
    navigate('page-booking');
    showToast('Table selected. Complete form to proceed.', 'success');
}

// UI Interactions
function initRating() {
    document.querySelectorAll('.js-rating').forEach(el => {
        const stars = el.querySelectorAll('span');
        stars.forEach((star, idx) => {
            star.onclick = () => {
                stars.forEach((s, i) => s.classList[i <= idx ? 'add' : 'remove']('active'));
            };
        });
    });
}

function initScroll() {
    window.addEventListener('scroll', () => {
        const btn = document.getElementById('backToTop');
        if(btn) btn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
}

function showToast(msg, type='success') {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.innerText = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
