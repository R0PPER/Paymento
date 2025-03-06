import View from "./view.js";

class ModalView extends View {
  _parentEl = document.querySelector(".modal");
  _overlay = document.querySelector(".overlay");
  _btnCloseModal = document.querySelector(".close-modal-btn");
  _btnPayNow = document.querySelector(".pay-btn");
  _modalInput = document.querySelector(".modal-input");
  _modalMessage = document.querySelector(".modal-message");
  _modalTitle = document.querySelector(".modal-title");

  constructor() {
    super();
    this._addInputValidation(); // Add input validation when the class is instantiated
  }

  // Get user input from modal
  getAmount() {
    return Number(this._modalInput.value.trim()); // Convert input to number
  }

  addHandlerPayNow(handler) {
    this._btnPayNow.addEventListener("click", handler);
  }

  openModal = (errorMessage = "") => {
    this._parentEl.classList.remove("hidden");
    this._overlay.classList.remove("hidden");

    // If there's an error message, show it and adjust UI
    if (errorMessage) {
      // Change modal to error state
      this._modalTitle.textContent = "Payment Error";
      this._modalMessage.textContent = errorMessage;
      this._modalMessage.classList.remove("hidden");
      this._modalInput.classList.add("hidden");
      this._btnPayNow.classList.add("hidden");
      this._btnCloseModal.textContent = "OK";
    } else {
      // Normal payment flow
      this._modalTitle.textContent = "Confirm Payment";
      this._modalMessage.classList.add("hidden");
      this._modalInput.classList.remove("hidden");
      this._btnPayNow.classList.remove("hidden");
      this._btnCloseModal.textContent = "Cancel";
    }
  };

  closeModal = () => {
    this._parentEl.classList.add("hidden");
    this._overlay.classList.add("hidden");

    // Reset modal state when closing
    this._modalInput.value = "";
  };

  addCloseModalListeners() {
    this._btnCloseModal.addEventListener("click", this.closeModal);
    this._overlay.addEventListener("click", this.closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this._parentEl.classList.contains("hidden")) {
        this.closeModal();
      }
    });
  }

  // Add input validation to allow only numbers
  _addInputValidation() {
    // Allow only numeric input
    this._modalInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
    });

    // Handle paste events to ensure only numbers are pasted
    this._modalInput.addEventListener("paste", (e) => {
      const pasteData = e.clipboardData.getData("text");
      const numericOnly = pasteData.replace(/\D/g, "");
      e.target.value = numericOnly;
      e.preventDefault();
    });
  }
}

export default new ModalView();
