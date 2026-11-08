
import View from './View.js';

class CheckoutView extends View {
  _parentElement = document.querySelector('#checkout-view');

  _historyMarkup(reservations) {
    if (!reservations.length) {
      return '<p class="muted">No demo reservations yet.</p>';
    }

    return reservations.map(reservation => `
      <article class="history-card">
        <div class="history-top">
          <strong>${this._escape(reservation.id)}</strong>
          <span class="reservation-status ${reservation.status === 'Reserved' ? 'active' : 'cancelled'}">
            ${this._escape(reservation.status)}
          </span>
        </div>

        <small>
          ${this._escape(reservation.customerName)}
          · Pickup: ${this._escape(reservation.pickupDate)}
        </small>

        <p class="history-items">
          ${reservation.items.map(item =>
            `${item.quantity}× ${this._escape(item.name)}`
          ).join(' · ')}
        </p>

        <div class="history-bottom">
          <span>
            Cash on Pickup·
            ${new Date(reservation.createdAt).toLocaleDateString('en-PH')}
          </span>
          <strong>${this._money(reservation.total)}</strong>
        </div>

        ${reservation.status === 'Reserved'
          ? `<button type="button" class="cancel-reservation"
              data-reservation-id="${this._escape(reservation.id)}">
              Cancel Reservation
            </button>`
          : ''}
      </article>
    `).join('');
  }

  _generateMarkup() {
    const data = this._data;
    const customer = data.customer || {};

    return `
      <div class="section-heading compact">
        <div>
          <span class="eyebrow">03 / RESERVE</span>
          <h2>Product <span class="highlight">Reservation</span></h2>
          <p>Enter Your Details For a Pickup Reservation.</p>
        </div>
      </div>

      <div class="checkout-panel">

        ${data.error
          ? `<div class="form-error" role="alert">
              ${this._escape(data.error)}
            </div>`
          : ''}

        ${data.success
          ? `<div class="form-success" role="status">
              ${this._escape(data.success)}
            </div>`
          : ''}

        <form id="reservation-form" class="checkout-form" novalidate>

          <label>
            Customer Full Name
            <input name="name" autocomplete="name"
              maxlength="80" placeholder="Enter Here"
              value="${this._escape(customer.name)}">
          </label>

          <label>
            Mobile Number
            <input name="phone" type="tel" inputmode="numeric"
              autocomplete="tel" maxlength="11"
              placeholder="Enter Here"
              value="${this._escape(customer.phone)}">
          </label>

          <label>
            Preferred Pickup Date
            <input name="pickupDate" type="date"
              min="${this._escape(data.today)}"
              value="${this._escape(customer.pickupDate)}">
          </label>

          <label>
            Payment Arrangement
            <input type="text"
              value="Cash on pickup at the physical store" disabled>
          </label>

          <div class="checkout-estimate">
            <span>Estimated Amount</span>
            <strong>${this._money(data.total)}</strong>
          </div>

          <button class="button primary full-button" type="submit">
            Reserve Selected Products
          </button>
        </form>

        <div class="history-section">
          <h3>
            Reservation History
            <span class="history-counter">${data.reservations.length}</span>
          </h3>

          ${this._historyMarkup(data.reservations)}
        </div>

      </div>
    `;
  }

  addHandlerSubmit(handler) {
    this._parentElement.addEventListener('submit', event => {
      if (event.target.id !== 'reservation-form') return;

      event.preventDefault();

      handler(Object.fromEntries(new FormData(event.target).entries()));
    });
  }

  addHandlerCancel(handler) {
    this._parentElement.addEventListener('click', event => {
      const button = event.target.closest('button[data-reservation-id]');

      if (button) {
        handler(button.dataset.reservationId);
      }
    });
  }
}

export default new CheckoutView();
