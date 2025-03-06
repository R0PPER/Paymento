import View from "./view.js";

class TransactionsView extends View {
  _parentEl = document.querySelector(".transaction");
  _clearButton = document.querySelector(".clear-transactions-btn");
  _errorMessage = "No transactions found. Add some!";
  _message = "Transactions loaded successfully";

  constructor() {
    super();
    // This ensures the constructor logic runs when the class is instantiated
  }

  render(transactions) {
    // Update the clear button visibility first
    this._updateClearButtonVisibility(transactions);

    if (!transactions || transactions.length === 0) {
      this.renderError();
      return;
    }

    // Clear previous content
    this._clear();

    // Render each transaction
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

  // Override parent methods to add button visibility logic
  renderSpinner() {
    // Hide clear button during loading
    this._clearButton.style.display = "none";
    // Call parent method
    super.renderSpinner();
  }

  renderError(message = this._errorMessage) {
    // Hide clear button when there's an error
    this._clearButton.style.display = "none";
    // Call parent method
    super.renderError(message);
  }

  // Helper method to update clear button visibility
  _updateClearButtonVisibility(transactions) {
    if (!transactions || transactions.length === 0) {
      this._clearButton.style.display = "none";
    } else {
      this._clearButton.style.display = "block";
    }
  }

  // Add event listeners for transactions functionality
  addHandlerRender(handler) {
    window.addEventListener("DOMContentLoaded", handler);
  }

  addHandlerClearTransactions(handler) {
    if (!this._clearButton) return; // Guard clause if button doesn't exist

    this._clearButton.addEventListener("click", async () => {
      // Show spinner while clearing
      this.renderSpinner();

      try {
        await handler();
        // After clearing, render empty state
        this.render([]);
      } catch (error) {
        console.error("Error clearing transactions:", error);
        this.renderError("Failed to clear transactions. Please try again.");
      }
    });
  }
}

export default new TransactionsView();
