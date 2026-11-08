import * as model from './model.js';
import productCatalogView from './views/ProductCatalogView.js';
import cartView from './views/CartView.js';
import checkoutView from './views/CheckoutView.js';

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function catalogData() {
  return {
    products: model.getFilteredProducts(),
    summary: model.getSummary(),
    categories: model.state.categories,
    selectedCategory: model.state.selectedCategory,
    searchTerm: model.state.searchTerm,
    editingProduct: model.state.products.find(p => p.id === model.state.editingId) || null
  };
}

function renderCatalog() { productCatalogView.render(catalogData()); }
function renderCart() { cartView.render(model.getCartDetails()); }
function renderCheckout(extra = {}) {
  checkoutView.render({
    reservations: model.state.reservations,
    total: model.getCartDetails().grandTotal,
    today: getTodayString(),
    ...extra
  });
}
function renderAll() {
  renderCatalog();
  renderCart();
  renderCheckout();
}

function controlSearch(value) {
  model.setSearchTerm(value);
  productCatalogView.renderResults(model.getFilteredProducts(), model.getSummary());
}
function controlFilter(category) {
  model.setCategory(category);
  productCatalogView.renderResults(model.getFilteredProducts(), model.getSummary());
}
function controlSaveProduct(data) {
  try {
    if (model.state.editingId === null) model.addProduct(data);
    else model.editProduct(model.state.editingId, data);
    model.selectProductToEdit(null);
    renderAll();
    productCatalogView.showFeedback('Product inventory saved in this browser.');
  } catch (error) {
    productCatalogView.renderForm({
      categories: model.state.categories,
      editingProduct: model.state.products.find(p => p.id === model.state.editingId) || null,
      draft: data,
      error: error.message
    });
  }
}
function controlCatalogAction(action, id) {
  if (action === 'edit') {
    model.selectProductToEdit(id);
    productCatalogView.renderForm({
      categories: model.state.categories,
      editingProduct: model.state.products.find(p => p.id === id) || null
    });
    productCatalogView.focusForm();
  }
  if (action === 'cancel-edit') {
    model.selectProductToEdit(null);
    productCatalogView.renderForm({ categories: model.state.categories });
  }
  if (action === 'delete') {
    try {
      model.deleteProduct(id);
      model.selectProductToEdit(null);
      renderAll();
      productCatalogView.showFeedback('Product deleted from this browser.');
    } catch (error) {
      productCatalogView.showFeedback(error.message, true);
    }
  }
  if (action === 'add') {
    try {
      model.addToCart(id);
      renderCart();
      renderCheckout();
      productCatalogView.showFeedback('Added to your visit list.');
    } catch (error) {
      productCatalogView.showFeedback(error.message, true);
    }
  }
}

function controlCartAction(action, id) {
  try {
    if (action === 'increase') model.changeCartQuantity(id, 1);
    if (action === 'decrease') model.changeCartQuantity(id, -1);
    if (action === 'remove') model.removeCartItem(id);
    renderCart();
    renderCheckout();
  } catch (error) {
    cartView.showFeedback(error.message);
  }
}

function controlReserve(customer) {
  try {
    const reservation = model.createReservation(customer);
    renderAll();
    checkoutView.render({
      reservations: model.state.reservations,
      total: model.getCartDetails().grandTotal,
      today: getTodayString(),
      success: `${reservation.id} saved locally. Please contact the store to confirm pickup.`
    });
  } catch (error) {
    renderCheckout({ error: error.message, customer });
  }
}
function controlCancelReservation(id) {
  try {
    model.cancelReservation(id);
    renderAll();
    renderCheckout({ success: `${id} cancelled in this browser. Sample stock was restored.` });
  } catch (error) {
    renderCheckout({ error: error.message });
  }
}
