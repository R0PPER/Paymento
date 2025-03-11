/**
 * CONTROLLER
 * controller.js - Connects model and views
 */

import * as model from "./model.js";
import paymentView from "./views/paymentView.js";
import modalView from "./views/modalView.js";
import transactionsView from "./views/transactionsView.js";

// Handles initial payment form submission
const controlPayment = async function (userInput) {
  try {
    // Update global state with user input
    model.state.userInput = { ...userInput, amount: null };

    // Validate input with improved validation function
    const validation = model.validatePaymentDetails(userInput);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Open modal for amount input (no error)
    modalView.openModal();
  } catch (error) {
    console.error("Payment validation failed:", error.message);
    modalView.openModal(error.message);
  }
};

// Handles payment confirmation from modal
const handleModalPayment = async function () {
  try {
    const amount = modalView.getAmount();

    // Validate amount
    if (!model.validateAmount(amount)) {
      throw new Error("Invalid amount.");
    }

    // Update state with amount
    model.state.userInput.amount = amount;

    // Start payment processing animation
    modalView.renderPaymentProcessingIndicator();

    // Process the payment
    await model.handlePayment(model.state.userInput);

    // Update transactions after animation completes
    setTimeout(async () => {
      await controlTransactions();
      // Reset the payment form after successful payment
      paymentView.resetForm();
    }, 7000); // Wait for animation to fully complete
  } catch (error) {
    modalView.stopPaymentProcessingIndicator();
    console.error("Payment processing failed:", error.message);
    modalView.openModal(error.message);
  }
};

// Handles transaction loading
const controlTransactions = async function () {
  try {
    transactionsView.renderSpinner();

    // Fetch transactions data
    const transactions = await model.getTransactions();

    // Render transactions
    transactionsView.render(transactions);
  } catch (error) {
    console.error("Error loading transactions:", error);
    transactionsView.renderError(
      "Failed to load transactions. Please try again."
    );
  }
};

// Clear all transactions
const controlClearTransactions = async function () {
  try {
    await model.clearTransactions();
    model.resetState();
    await controlTransactions();
  } catch (error) {
    console.error("Error clearing transactions:", error);
    throw error;
  }
};

// Initialize the application
const init = function () {
  paymentView.addInputListeners();
  paymentView.addHandlerSubmit(controlPayment);

  modalView.addCloseModalListeners();
  modalView.addHandlerPayNow(handleModalPayment);

  transactionsView.addHandlerRender(controlTransactions);
  transactionsView.addHandlerClearTransactions(controlClearTransactions);
};

// Start the application
init();
