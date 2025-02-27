import * as model from "./model.js";
import paymentView from "./views/paymentView.js";

const controlPayment = async function (userInput) {
  try {
    // Validate user input
    if (!model.validateCardNumber(userInput.cardNumber)) {
      throw new Error("Invalid card number.");
    }
    if (!model.validateExpiryDate(userInput.expiryDate)) {
      throw new Error("Invalid expiry date.");
    }
    if (!model.validateCVV(userInput.cvv, userInput.cardNumber)) {
      throw new Error("Invalid CVV.");
    }

    console.log("Validation successful!");
  } catch (error) {
    console.error("Payment failed:", error.message);
    throw error;
  }
};

// // Load Past Transactions
// const loadTransactions = async function () {
//   try {
//     const transactions = await model.getTransactionHistory();
//     console.log("Transaction history loaded:", transactions);
//     model.state.transactions = transactions; // Update state
//   } catch (error) {
//     console.error("Error loading transactions:", error);
//   }
// };

// Initialize
const init = function () {
  paymentView.addInputListeners(); // Add input formatting
  paymentView.addHandlerSubmit(controlPayment); // Handle form submission
  // loadTransactions(); // Load past transactions
};

init();
