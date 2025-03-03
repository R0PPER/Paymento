import View from "./view.js";

class TransactionsView extends View {
  _parentEl = document.querySelector(".transaction");
  _clearButton = document.querySelector(".clear-transactions-btn");

  constructor() {
    super();
    // This will ensure the constructor logic runs when the class is instantiated
  }

  render(transactions) {
    this._parentEl.innerHTML = ""; // Clear previous data

    if (!transactions || transactions.length === 0) {
      this._parentEl.innerHTML = "<p>No transactions found.</p>";
      return;
    }

    transactions.forEach((tx) => {
      // Format the timestamp - handle both server timestamp and client fallback
      let formattedDate = "Processing...";
      if (tx.timestamp) {
        // Check if timestamp is a Firebase timestamp or a regular Date
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
    });
  }

  // Add event listeners for transactions functionality
  addHandlerRender(handler) {
    window.addEventListener("DOMContentLoaded", handler);
  }

  addHandlerClearTransactions(handler) {
    if (!this._clearButton) return; // Guard clause if button doesn't exist

    this._clearButton.addEventListener("click", async () => {
      await handler();
      this.render([]); // Clear UI after transactions are deleted
    });
  }
}

export default new TransactionsView();
