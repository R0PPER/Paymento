import View from "./view.js";

class PaymentView extends View {
  _parentEl = document.querySelector(".container");
  _cardNumber = document.querySelector("#card-number");
  _expiryDate = document.querySelector("#expiry-date");
  _cvv = document.querySelector("#cvv");

  getInput() {
    return {
      cardNumber: this._cardNumber.value.trim(),
      expiryDate: this._expiryDate.value.trim(),
      cvv: this._cvv.value.trim(),
    };
  }

  addInputListeners() {
    this._expiryDate.addEventListener(
      "input",
      this._formatExpiryDate.bind(this)
    );
    this._cardNumber.addEventListener(
      "input",
      this._formatCardNumber.bind(this)
    );
    this._cvv.addEventListener("input", this._formatCVV.bind(this));
  }

  _formatCardNumber() {
    this._cardNumber.value = this._cardNumber.value
      .replace(/\D/g, "")
      .slice(0, 19);
  }

  _formatExpiryDate() {
    let value = this._expiryDate.value.replace(/\D/g, "");
    if (value.length >= 2) {
      const month = Math.min(Number(value.slice(0, 2)), 12);
      value = month.toString().padStart(2, "0") + value.slice(2);
    }
    if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2, 4);
    this._expiryDate.value = value.slice(0, 5);
  }

  _formatCVV() {
    this._cvv.value = this._cvv.value.replace(/\D/g, "").slice(0, 4);
  }

  addHandlerSubmit(handler) {
    this._parentEl.addEventListener("submit", (e) => {
      e.preventDefault();
      handler(this.getInput());
    });
  }
}

export default new PaymentView();
