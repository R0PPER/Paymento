import View from "./view.js";

class PaymentView extends View {
  _parentEl = document.querySelector(".container");

  _cardNumber = document.querySelector("#card-number");
  _expiryDate = document.querySelector("#expiry-date");
  _cvv = document.querySelector("#cvv");
  _submitBtn = document.querySelector("#submit-btn");

  // Get user input
  getInput() {
    return {
      cardNumber: this._cardNumber.value.trim(),
      expiryDate: this._expiryDate.value.trim(),
      cvv: this._cvv.value.trim(),
    };
  }

  // Add input validation listeners
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
  // Format card number with spaces
  _formatCardNumber() {
    let value = this._cardNumber.value.replace(/\D/g, ""); // Remove non-digits
    this._cardNumber.value = value.slice(0, 19); // Limit to 16 digits + spaces
  }

  // Format expiry date as MM/YY
  _formatExpiryDate() {
    let value = this._expiryDate.value.replace(/\D/g, ""); // Remove non-digits

    // Ensure month is not greater than 12
    if (value.length >= 2) {
      const month = value.slice(0, 2);
      if (Number(month) > 12) {
        value = "12" + value.slice(2); // Cap month at 12
      }
    }

    // Add slash after month
    if (value.length >= 3) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4); // Add slash
    }

    // Limit to MM/YY format
    this._expiryDate.value = value.slice(0, 5);
  }

  // Format CVV (3-4 digits)
  _formatCVV() {
    let value = this._cvv.value.replace(/\D/g, ""); // Remove non-digits
    this._cvv.value = value.slice(0, 4); // Limit to 4 digits
  }

  addHandlerSubmit(handler) {
    this._parentEl.addEventListener("submit", (e) => {
      e.preventDefault(); // Prevents page reload
      handler(this.getInput()); // Pass input data to controller
    });
  }
}

export default new PaymentView();
