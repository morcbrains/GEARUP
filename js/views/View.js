export default class View {
  _data;

  _clear() {
    this._parentElement.innerHTML = '';
  }

  render(data) {
    this._data = data;
    const markup = this._generateMarkup();
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderError(message = 'Something went wrong. Please try again.') {
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin',
      `<div class="form-error" role="alert">${this._escape(message)}</div>`);
  }

  _escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  _money(amount) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  }
}
