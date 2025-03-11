/**
 * /views/modalView.js - Payment confirmation modal
 */

import View from "./view.js";

class ModalView extends View {
  constructor() {
    super(".modal");
    this._overlay = document.querySelector(".overlay");
    this._btnCloseModal = document.querySelector(".close-modal-btn");
    this._btnPayNow = document.querySelector(".pay-btn");
    this._modalInput = document.querySelector(".modal-input");
    this._modalMessage = document.querySelector(".modal-message");
    this._modalTitle = document.querySelector(".modal-title");

    this._addInputValidation();
  }

  getAmount() {
    return Number(this._modalInput.value.trim());
  }

  addHandlerPayNow(handler) {
    this._btnPayNow.addEventListener("click", handler);
  }

  // Modal controls
  openModal(errorMessage = "") {
    this._parentEl.classList.remove("hidden");
    this._overlay.classList.remove("hidden");

    if (errorMessage) {
      this._showErrorState(errorMessage);
    } else {
      this._showPaymentState();
    }
  }

  _showErrorState(errorMessage) {
    this._modalMessage.style.color = "#ed6a5a";
    this._modalTitle.textContent = "Payment Error";
    this._modalMessage.textContent = errorMessage;
    this._modalMessage.classList.remove("hidden");
    this._modalInput.classList.add("hidden");
    this._btnPayNow.classList.add("hidden");
    this._btnCloseModal.classList.remove("hidden");
    this._btnCloseModal.textContent = "OK";
  }

  _showPaymentState() {
    this._modalMessage.style.color = "black";
    this._modalTitle.textContent = "Confirm Payment";
    this._modalMessage.classList.add("hidden");
    this._modalInput.classList.remove("hidden");
    this._btnPayNow.classList.remove("hidden");
    this._btnCloseModal.textContent = "Cancel";
  }

  closeModal() {
    this._parentEl.classList.add("hidden");
    this._overlay.classList.add("hidden");
    this.stopPaymentProcessingIndicator();
    this._modalInput.value = "";
  }

  addCloseModalListeners() {
    this._btnCloseModal.addEventListener("click", this.closeModal.bind(this));
    this._overlay.addEventListener("click", this.closeModal.bind(this));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this._parentEl.classList.contains("hidden")) {
        this.closeModal();
      }
    });
  }

  // Input validation
  _addInputValidation() {
    this._modalInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
    });

    this._modalInput.addEventListener("paste", (e) => {
      const pasteData = e.clipboardData.getData("text");
      const numericOnly = pasteData.replace(/\D/g, "");
      e.target.value = numericOnly;
      e.preventDefault();
    });
  }

  // Processing animation
  renderPaymentProcessingIndicator() {
    if (this._loadingInterval) clearInterval(this._loadingInterval);

    // Prepare modal for processing state
    this._modalTitle.textContent = "";
    this._modalMessage.classList.remove("hidden");
    this._modalInput.classList.add("hidden");
    this._btnPayNow.classList.add("hidden");
    this._btnCloseModal.classList.add("hidden");

    let dotCount = 0;
    const maxDots = 3;

    // Initial text
    this._parentEl.classList.add("fit-content");
    this._modalMessage.textContent = "Processing";
    this._modalMessage.classList.remove("success");

    // Animate dots
    this._loadingInterval = setInterval(() => {
      dotCount = (dotCount + 1) % (maxDots + 1);
      const dots = ".".repeat(dotCount);
      this._modalMessage.textContent = `Processing${dots}`;
    }, 500);

    // Show success after delay
    setTimeout(() => {
      this.stopPaymentProcessingIndicator();
      this._modalMessage.style.color = "";
      this._modalMessage.classList.add("success");
      this._modalMessage.textContent = "Payment confirmed!";

      // Close modal after success message
      setTimeout(() => {
        this._parentEl.classList.remove("fit-content");
        this._modalMessage.classList.remove("success");
        this.closeModal();
      }, 4000);
    }, 3000);
  }

  stopPaymentProcessingIndicator() {
    if (this._loadingInterval) {
      clearInterval(this._loadingInterval);
      this._loadingInterval = null;
    }
  }
}

export default new ModalView();
