import * as model from "./model.js";
import paymentView from "./views/paymentView.js";
import modalView from "./views/modalView.js";
import transactionsView from "./views/transactionsView.js";

const controlPayment = async function (userInput) {
  try {
    // Update global state with user input
    model.state.userInput = { ...userInput, amount: null };

    console.log("Updated state:", model.state.userInput); // Debugging

    // Correct Destructuring (Make sure `model.state.userInput` exists)
    const { cardNumber, expiryDate, cvv } = model.state.userInput;

    // Validate input
    if (!cardNumber || !expiryDate || !cvv)
      throw new Error("Missing payment details.");
    if (!model.validateCardNumber(cardNumber))
      throw new Error("Invalid card number. Please check the format.");
    if (!model.validateExpiryDate(expiryDate))
      throw new Error(
        "Invalid expiry date. Format should be MM/YY, not expired or more than 10 years in the future."
      );
    if (!model.validateCVV(cvv, cardNumber))
      throw new Error("Invalid CVV. Should be 3 digits (4 for Amex).");

    console.log("Validation successful!");

    // Open modal for amount input (no error)
    modalView.openModal();
  } catch (error) {
    console.error("Payment failed:", error.message);

    // Open modal with error message
    modalView.openModal(error.message);
  }
};

const handleModalPayment = async function () {
  try {
    const amount = modalView.getAmount();

    if (!amount || isNaN(amount) || amount <= 0)
      throw new Error("Invalid amount.");

    // Ensure state is updated
    model.state.userInput.amount = amount;
    console.log("Updated state with amount:", model.state.userInput);

    // Process the payment and wait for it to complete
    await model.handlePayment(model.state.userInput);

    // Update UI after payment completes
    await controlTransactions();

    // Close modal
    modalView.closeModal();
  } catch (error) {
    console.error("Payment failed:", error.message);
    // Show error in modal without closing it
    modalView.openModal(error.message);
  }
};

async function controlTransactions() {
  try {
    // Show spinner while waiting for transactions
    transactionsView.renderSpinner();

    // Fetch transactions data
    const transactions = await model.getTransactions();

    // Replace spinner with transactions data
    transactionsView.render(transactions);
  } catch (error) {
    console.error("Error loading transactions:", error);
    transactionsView.renderError(
      "Failed to load transactions. Please try again."
    );
  }
}

// Initialize
const init = function () {
  paymentView.addInputListeners(); // Add input formatting
  paymentView.addHandlerSubmit(controlPayment); // Handle form submission
  modalView.addCloseModalListeners();
  modalView.addHandlerPayNow(handleModalPayment); // Step 2: Get amount & process

  // Move event listeners to view classes
  transactionsView.addHandlerRender(controlTransactions);
  transactionsView.addHandlerClearTransactions(async () => {
    await model.clearTransactions();
    controlTransactions(); // Refresh transactions view after clearing
  });

  // Initial load of transactions
  controlTransactions();
};

init();
