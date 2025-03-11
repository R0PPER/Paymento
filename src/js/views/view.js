/**
 * VIEWS
 * /views/view.js - Base View class
 */

export default class View {
  constructor(parentEl) {
    if (parentEl) this._parentEl = document.querySelector(parentEl);
  }

  _clear() {
    if (!this._parentEl) return;
    this._parentEl.innerHTML = "";
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
        <div class="spinner__ring"></div>
      </div>
    `;
    this._clear();
    this._parentEl.insertAdjacentHTML("afterbegin", markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error-message">
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentEl.insertAdjacentHTML("afterbegin", markup);
  }

  renderMessage(message = this._message) {
    const markup = `
      <div class="success-message">
        <p>${message}</p>
      </div>
    `;
    this._clear();
    this._parentEl.insertAdjacentHTML("afterbegin", markup);
  }
}
