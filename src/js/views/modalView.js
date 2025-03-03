import View from "./view.js";

class ModalView extends View {
  _parentEl = document.querySelector(".modal");
  _overlay = document.querySelector(".overlay");
  _btnCloseModal = document.querySelector(".close-modal-btn");
  _btnPayNow = document.querySelector(".pay-btn");
  _modalInput = document.querySelector(".modal-input");

  // Get user input from modal
  getAmount() {
    return Number(this._modalInput.value.trim()); // Convert input to number
  }

  addHandlerPayNow(handler) {
    this._btnPayNow.addEventListener("click", handler);
  }

  openModal = () => {
    this._parentEl.classList.remove("hidden");
    this._overlay.classList.remove("hidden");
  };

  closeModal = () => {
    this._parentEl.classList.add("hidden");
    this._overlay.classList.add("hidden");
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
}

export default new ModalView();
