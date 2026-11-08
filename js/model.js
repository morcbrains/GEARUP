const STORAGE_KEY = 'gear-up-prelim-final-v1';

const startingProducts = [
  { id: 1, name: 'RGB Mechanical Keyboard', category: 'Keyboards', price: 1850, stock: 8, description: 'Compact gaming keyboard with RGB backlighting.' },
  { id: 2, name: 'Wireless Gaming Mouse', category: 'Mice', price: 990, stock: 12, description: 'Lightweight wireless mouse with adjustable DPI.' },
  { id: 3, name: 'Surround Gaming Headset', category: 'Headsets', price: 1499, stock: 4, description: 'Comfortable headset with built-in microphone.' },
  { id: 4, name: 'USB Streaming Microphone', category: 'Microphones', price: 1299, stock: 3, description: 'Plug-and-play USB microphone for calls and streams.' },
  { id: 5, name: '1TB External SSD', category: 'Storage', price: 3299, stock: 2, description: 'Portable drive for games and important files.' },
  { id: 6, name: 'Wireless Game Controller', category: 'Controllers', price: 1695, stock: 5, description: 'Ergonomic controller for compatible PC games.' },
  { id: 7, name: 'Extended RGB Mouse Pad', category: 'Accessories', price: 599, stock: 14, description: 'Wide desk mat with illuminated edges.' },
  { id: 8, name: '24-inch Gaming Monitor', category: 'Monitors', price: 6799, stock: 0, description: 'Full HD screen; currently not available.' },
  { id: 9, name: 'Cooling Laptop Stand', category: 'Accessories', price: 799, stock: 7, description: 'Adjustable laptop stand with cooling airflow.' }
];

const categories = ['Accessories', 'Controllers', 'Headsets', 'Keyboards', 'Microphones', 'Mice', 'Monitors', 'Storage'];

export const state = {
  products: startingProducts.map(product => ({ ...product })),
  cart: [],
  reservations: [],
  categories,
  searchTerm: '',
  selectedCategory: 'All',
  editingId: null,
  nextProductId: 10,
  nextReservationId: 1
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      products: state.products,
      cart: state.cart,
      reservations: state.reservations,
      nextProductId: state.nextProductId,
      nextReservationId: state.nextReservationId
    }));
  } catch (error) {
    console.warn('GEAR UP could not save browser data:', error);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || !Array.isArray(saved.products) || !Array.isArray(saved.cart) || !Array.isArray(saved.reservations)) return;
    state.products = saved.products.filter(p => p && Number.isInteger(p.id) && typeof p.name === 'string' &&
      categories.includes(p.category) && Number.isFinite(p.price) && p.price > 0 && Number.isInteger(p.stock) && p.stock >= 0);
    state.cart = saved.cart.filter(item => item && Number.isInteger(item.id) && Number.isInteger(item.quantity) && item.quantity > 0)
      .filter(item => state.products.some(p => p.id === item.id && p.stock > 0))
      .map(item => ({ id: item.id, quantity: Math.min(item.quantity, state.products.find(p => p.id === item.id).stock) }));
    state.reservations = saved.reservations.filter(r => r && typeof r.id === 'string' && Array.isArray(r.items));
    const highestProduct = state.products.reduce((max, p) => Math.max(max, p.id), 0);
    state.nextProductId = Math.max(highestProduct + 1, Number.isInteger(saved.nextProductId) ? saved.nextProductId : 1);
    const highestReservation = state.reservations.reduce((max, r) => {
      const num = Number(r.id.split('-').pop());
      return Number.isInteger(num) ? Math.max(max, num) : max;
    }, 0);
    state.nextReservationId = Math.max(highestReservation + 1, Number.isInteger(saved.nextReservationId) ? saved.nextReservationId : 1);
  } catch (error) {
    console.warn('GEAR UP could not read stored data; using sample products:', error);
  }
}

export function setSearchTerm(value) {
  state.searchTerm = String(value ?? '').trim();
}

export function setCategory(value) {
  state.selectedCategory = value === 'All' || state.categories.includes(value) ? value : 'All';
}

export function getFilteredProducts() {
  const query = state.searchTerm.toLowerCase();
  return state.products.filter(product =>
    (state.selectedCategory === 'All' || product.category === state.selectedCategory) &&
    `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query)
  );
}

export function getSummary() {
  return {
    total: state.products.length,
    available: state.products.filter(product => product.stock > 0).length,
    units: state.products.reduce((sum, product) => sum + product.stock, 0)
  };
}

export function selectProductToEdit(id = null) {
  state.editingId = state.products.some(product => product.id === id) ? id : null;
}

function validateProduct(data) {
  const name = String(data.name ?? '').trim();
  const category = String(data.category ?? '');
  const priceText = String(data.price ?? '').trim();
  const stockText = String(data.stock ?? '').trim();
  const description = String(data.description ?? '').trim();
  const price = Number(priceText);
  const stock = Number(stockText);
  if (name.length < 2 || name.length > 80) throw new Error('Product name must contain 2–80 characters.');
  if (!categories.includes(category)) throw new Error('Choose a valid product category.');
  if (!priceText || !Number.isFinite(price) || price <= 0 || price > 1000000) throw new Error('Price must be greater than ₱0 and at most ₱1,000,000.');
  if (!stockText || !Number.isInteger(stock) || stock < 0 || stock > 100000) throw new Error('Stock must be a whole number from 0 to 100,000.');
  if (description.length > 160) throw new Error('Description must be 160 characters or fewer.');
  return { name, category, price, stock, description };
}

export function addProduct(data) {
  const product = validateProduct(data);
  state.products.push({ id: state.nextProductId++, ...product });
  saveState();
}

export function editProduct(id, data) {
  const product = state.products.find(p => p.id === id);
  if (!product) throw new Error('Product not found.');
  const valid = validateProduct(data);
  Object.assign(product, valid);
  state.cart = state.cart.filter(item => item.id !== id || product.stock > 0)
    .map(item => item.id === id ? { ...item, quantity: Math.min(item.quantity, product.stock) } : item);
  saveState();
}

export function deleteProduct(id) {
  if (state.reservations.some(r => r.status === 'Reserved' && r.items.some(item => item.id === id))) {
    throw new Error('Cancel active reservations for this product before deleting it.');
  }
  const before = state.products.length;
  state.products = state.products.filter(product => product.id !== id);
  if (state.products.length === before) throw new Error('Product not found.');
  state.cart = state.cart.filter(item => item.id !== id);
  saveState();
} 
