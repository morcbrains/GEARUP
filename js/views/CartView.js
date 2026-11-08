import View from './View.js';

class CartView extends View {
  _parentElement = document.querySelector('#cart-view');

  _generateMarkup() {
    const cart = this._data;
    return `<div class="section-heading compact">
        <div><span class="eyebrow">02 / PLAN</span><h2>My Visit <span class="highlight">List</span></h2>
          <p>Choose gear and see the estimated amount to pay at the store.</p></div>
        <span class="count-badge">${cart.count} item${cart.count === 1 ? '' : 's'}</span>
      </div>
      <div class="cart-panel">
        ${cart.items.length ? cart.items.map(item => `
          <div class="cart-row">
            <div class="cart-item-info"><strong>${this._escape(item.name)}</strong><small>${this._money(item.price)} each</small></div>
            <div class="quantity-stepper">
              <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease ${this._escape(item.name)} quantity">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase ${this._escape(item.name)} quantity">+</button>
            </div>
            <strong class="item-total">${this._money(item.lineTotal)}</strong>
            <button type="button" class="remove-button" data-action="remove" data-id="${item.id}" aria-label="Remove ${this._escape(item.name)}">×</button>
          </div>`).join('') : '<div class="empty-cart">🛒 No products selected yet. Add an item from the catalog above.</div>'}
        <div class="cart-totals">
          <div><span>Subtotal</span><strong data-test="subtotal">${this._money(cart.subtotal)}</strong></div>
          <div><span>Planning / shipping fees</span><strong>FREE</strong></div>
          <div class="grand-total"><span>Grand Total <small>(estimated in-store payment)</small></span><strong data-test="grand-total">${this._money(cart.grandTotal)}</strong></div>
        </div>
        <a class="button primary full-button" href="#checkout">Continue to Reservation →</a>
        <p class="muted center">Prices and stock are illustrative until confirmed by a store.</p>
        <p class="feedback" id="cart-feedback" role="status" aria-live="polite"></p>
      </div>`;
  }

  showFeedback(message) {
    const element = this._parentElement.querySelector('#cart-feedback');
    element.textContent = message;
    element.classList.add('error-text');
  }

  addHandlerAction(handler) {
    this._parentElement.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      handler(button.dataset.action, Number(button.dataset.id));
    });
  }
}

export default new CartView();
