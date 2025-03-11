/**
 * /views/paymentView.js - Payment form view
 */

import View from "./view.js";

class PaymentView extends View {
  constructor() {
    super(".container");
    this._cardNumber = document.querySelector("#card-number");
    this._expiryDate = document.querySelector("#expiry-date");
    this._cvv = document.querySelector("#cvv");
    this._form = document.querySelector(".container");
  }

  getInput() {
    return {
      cardNumber: this._cardNumber.value.trim(),
      expiryDate: this._expiryDate.value.trim(),
      cvv: this._cvv.value.trim(),
    };
  }

  resetForm() {
    this._cardNumber.value = "";
    this._expiryDate.value = "";
    this._cvv.value = "";
  }

  updateStatus(status) {
    super.updateStatus(status);

    // Handle different statuses
    switch (status) {
      case "success":
        this.resetForm();
        break;
      case "idle":
        // Enable form fields
        this._cardNumber.disabled = false;
        this._expiryDate.disabled = false;
        this._cvv.disabled = false;
        break;
      case "processing":
        // Disable form during processing
        this._cardNumber.disabled = true;
        this._expiryDate.disabled = true;
        this._cvv.disabled = true;
        break;
    }
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
    this._form.addEventListener("submit", (e) => {
      e.preventDefault();
      handler(this.getInput());
    });
  }
}

export default new PaymentView();
