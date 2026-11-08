import View from './View.js';

class ProductCatalogView extends View {
  _parentElement = document.querySelector('#catalog-view');

  _icon(category) {
    return ({ Keyboards: '⌨️', Mice: '🖱️', Headsets: '🎧', Microphones: '🎙️',
      Storage: '💾', Controllers: '🎮', Accessories: '⚡', Monitors: '🖥️' })[category] || '📦';
  }

  _summaryMarkup(summary) {
    return `<span><strong>${summary.total}</strong> Products listed</span>
      <span><strong>${summary.available}</strong> Types in stock</span>
      <span><strong>${summary.units}</strong> Units available</span>`;
  }

  _cardsMarkup(products) {
    if (!products.length) return `<div class="empty-state">🔎 No matching gear. Try a different search or category.</div>`;
    return products.map(product => `
      <article class="product-card">
        <div class="product-visual"><span aria-hidden="true">${this._icon(product.category)}</span>
          <span class="stock-tag ${product.stock ? 'in-stock' : 'sold-out'}">${product.stock ? `${product.stock} IN STOCK` : 'SOLD OUT'}</span>
        </div>
        <div class="product-body">
          <span class="product-category">${this._escape(product.category)}</span>
          <h3>${this._escape(product.name)}</h3>
          <p>${this._escape(product.description)}</p>
          <div class="price">${this._money(product.price)}</div>
          <button class="button primary add-button" data-action="add" data-id="${product.id}" ${!product.stock ? 'disabled' : ''}>
            ${product.stock ? '+ Add to Visit List' : 'Currently Unavailable'}
          </button>
          <div class="card-admin">
            <button data-action="edit" data-id="${product.id}" aria-label="Edit ${this._escape(product.name)}">Edit</button>
            <button data-action="delete" data-id="${product.id}" aria-label="Delete ${this._escape(product.name)}">Delete</button>
          </div>
        </div>
      </article>`).join('');
  }

  _formMarkup({ categories, editingProduct = null, draft = null, error = '' }) {
    const product = draft || editingProduct || {};
    return `<div class="tool-heading">
        <div><h3>${editingProduct ? 'Edit product' : 'Add product'}</h3>
          <p>Store-staff demo controls. Editing affects only this browser.</p></div>
        ${editingProduct ? '<button type="button" class="text-button" data-action="cancel-edit">Cancel edit</button>' : ''}
      </div>
      ${error ? `<div class="form-error" role="alert">${this._escape(error)}</div>` : ''}
      <form id="product-form" class="product-form" novalidate>
        <label>Product Name<input name="name" maxlength="80" placeholder="Enter Here" value="${this._escape(product.name)}"></label>
        <label>Category<select name="category">
          <option value="">Choose Category</option>
          ${categories.map(category => `<option value="${this._escape(category)}" ${product.category === category ? 'selected' : ''}>${this._escape(category)}</option>`).join('')}
        </select></label>
        <label>Price (₱)<input type="number" name="price" min="0" max="1000000" step="0.01" placeholder="Enter Here" value="${this._escape(product.price)}"></label>
        <label>Stock Quantity<input type="number" name="stock" min="0" max="100000" step="1" placeholder="Enter Here" value="${this._escape(product.stock)}"></label>
        <label class="wide">Description<input name="description" maxlength="160" placeholder="Enter Details" value="${this._escape(product.description)}"></label>
        <button type="submit" class="button primary form-submit">${editingProduct ? 'Save changes' : 'Add Product'}</button>
      </form>`;
  }

  _generateMarkup() {
    const data = this._data;
    return `<div class="section-heading">
        <div><span class="eyebrow">01 / DISCOVER</span><h2>Gear Catalog <span class="highlight">& Availability</span></h2>
          <p>Search gaming accessories and check the sample stock before you go.</p></div>
        <div class="summary" id="catalog-summary">${this._summaryMarkup(data.summary)}</div>
      </div>
      <div class="filters">
        <label class="search-wrap"><span aria-hidden="true">⌕</span><input name="search" type="search" placeholder="Search keyboards, mice, headsets..." value="${this._escape(data.searchTerm)}" aria-label="Search products"></label>
        <label class="category-wrap">Category <select name="category-filter" aria-label="Filter products by category">
          <option value="All">All categories</option>
          ${data.categories.map(category => `<option value="${this._escape(category)}" ${category === data.selectedCategory ? 'selected' : ''}>${this._escape(category)}</option>`).join('')}
        </select></label>
      </div>
      <p class="results-label" id="results-label">Showing ${data.products.length} of ${data.summary.total} products</p>
      <div class="product-grid" id="products-grid">${this._cardsMarkup(data.products)}</div>
      <p class="feedback" id="catalog-feedback" role="status" aria-live="polite"></p>
      <section class="staff-panel" aria-label="Inventory manager">
        <div id="catalog-form-slot">${this._formMarkup({ categories: data.categories, editingProduct: data.editingProduct })}</div>
      </section>`;
  }

  renderResults(products, summary) {
    this._parentElement.querySelector('#products-grid').innerHTML = this._cardsMarkup(products);
    this._parentElement.querySelector('#catalog-summary').innerHTML = this._summaryMarkup(summary);
    this._parentElement.querySelector('#results-label').textContent = `Showing ${products.length} of ${summary.total} products`;
  }

  renderForm(data) {
    this._parentElement.querySelector('#catalog-form-slot').innerHTML = this._formMarkup(data);
  }

  focusForm() {
    const input = this._parentElement.querySelector('#product-form [name="name"]');
    input.focus();
    this._parentElement.querySelector('.staff-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  showFeedback(message, isError = false) {
    const element = this._parentElement.querySelector('#catalog-feedback');
    element.textContent = message;
    element.classList.toggle('error-text', isError);
  }

  addHandlerSearch(handler) {
    this._parentElement.addEventListener('input', event => {
      if (event.target.matches('[name="search"]')) handler(event.target.value);
    });
  }

  addHandlerCategory(handler) {
    this._parentElement.addEventListener('change', event => {
      if (event.target.matches('[name="category-filter"]')) handler(event.target.value);
    });
  }

  addHandlerSubmit(handler) {
    this._parentElement.addEventListener('submit', event => {
      if (event.target.id !== 'product-form') return;
      event.preventDefault();
      handler(Object.fromEntries(new FormData(event.target).entries()));
    });
  }

  addHandlerAction(handler) {
    this._parentElement.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      handler(button.dataset.action, Number(button.dataset.id));
    });
  }
}

export default new ProductCatalogView();
