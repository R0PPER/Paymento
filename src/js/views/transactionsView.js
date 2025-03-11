/**
 * /views/transactionsView.js - Transactions list view
 */

import View from "./view.js";

class TransactionsView extends View {
  constructor() {
    super(".transaction");
    this._clearButton = document.querySelector(".clear-transactions-btn");
    this._errorMessage = "No transactions found.";
    this._message = "Transactions loaded successfully";
  }

  render(transactions) {
    this._updateClearButtonVisibility(transactions);

    if (!transactions || transactions.length === 0) {
      this.renderError();
      return;
    }

    this._clear();
    transactions.forEach(this._renderTransaction.bind(this));
  }

  _renderTransaction(tx) {
    console.log(tx);
    // Format the timestamp
    let formattedDate = "Processing...";
    if (tx.timestamp) {
      formattedDate = tx.timestamp.seconds
        ? new Date(tx.timestamp.seconds * 1000).toLocaleString()
        : new Date(tx.timestamp).toLocaleString();
    }

    const markup = `
      <div class="transaction-list">
        <p><strong>Card:</strong> **** **** **** ${tx.cardNumber}</p>
        <p><strong>Amount:</strong> $${tx.amount}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
      </div>
    `;
    this._parentEl.insertAdjacentHTML("beforeend", markup);
  }

  renderSpinner() {
    this._clearButton.style.display = "none";
    super.renderSpinner();
  }

  renderError(message = this._errorMessage) {
    this._clearButton.style.display = "none";
    super.renderError(message);
  }

  _updateClearButtonVisibility(transactions) {
    this._clearButton.style.display =
      !transactions || transactions.length === 0 ? "none" : "block";
  }

  addHandlerRender(handler) {
    window.addEventListener("DOMContentLoaded", handler);
  }

  addHandlerClearTransactions(handler) {
    if (!this._clearButton) return;

    this._clearButton.addEventListener("click", async () => {
      this.renderSpinner();
      try {
        await handler();
        this.render([]);
      } catch (error) {
        console.error("Error clearing transactions:", error);
        this.renderError("Failed to clear transactions. Please try again.");
      }
    });
  }
}

export default new TransactionsView();
