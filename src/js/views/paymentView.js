import View from "./view.js";

class PaymentView extends View {
  _parentEl = document.querySelector(".container");
  _expiryDate = document.querySelector("#expiry-date");

  getExpiryDate() {
    return this._expiryDate.value;
  }

  paymentListeners() {
    this._expiryDate.addEventListener("input", () =>
      this._validateExpiryFormat()
    );
  }

  addHandlerSubmit(handler) {
    this._parentEl.addEventListener("submit", function (e) {
      e.preventDefault(); // Prevents page reload
      handler(); // Calls `controlPayment()` only when the user submits the form
    });
  }

  // Check for correct month-year structure
  _validateExpiryFormat() {
    let expiryDateValue = this._expiryDate.value.replace(/\D/g, ""); // Remove non-numeric characters

    if (expiryDateValue.length >= 3) {
      expiryDateValue =
        expiryDateValue.substring(0, 2) + "/" + expiryDateValue.substring(2);
    }

    if (expiryDateValue.length > 5) {
      expiryDateValue = expiryDateValue.substring(0, 5); // Ensure max length is 5 (MM/YY)
    }

    this._expiryDate.value = expiryDateValue; // Update the input field
  }
}

export default new PaymentView();
