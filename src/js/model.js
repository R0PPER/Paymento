/**
 * MODEL
 * model.js - Handles data and business logic
 */

import { db } from "../../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Centralized state management
export const state = {
  userInput: {
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: null,
  },
  transactions: [],
  currentStatus: "idle", // "idle", "processing", "success", "error"
};

// Card validators
const validators = {
  // Card number validation (13-19 digits)
  cardNumber: (cardNumber) => /^\d{13,19}$/.test(cardNumber),

  // Expiry date validation (MM/YY format, not expired, not > 10 years in future)
  expiryDate: (expiryDate) => {
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;

    const [month, year] = expiryDate.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    return !(
      month < 1 ||
      month > 12 ||
      year < currentYear ||
      year > currentYear + 10 ||
      (year === currentYear && month < currentMonth)
    );
  },

  // CVV validation based on card type
  cvv: (cvv, cardNumber) => {
    if (!cvv || !/^[0-9]+$/.test(cvv)) return false;

    const length = cvv.length;
    const cardType = identifyCardType(cardNumber);

    return (
      (length === 3 && ["Visa", "MasterCard", "Discover"].includes(cardType)) ||
      (length === 4 && cardType === "American Express")
    );
  },

  // Amount validation
  amount: (amount) => {
    const numAmount = Number(amount);
    return !isNaN(numAmount) && numAmount > 0;
  },
};

// Export validation functions
export const validateCardNumber = validators.cardNumber;
export const validateExpiryDate = validators.expiryDate;
export const validateCVV = validators.cvv;
export const validateAmount = validators.amount;

// Validate all payment details at once
export const validatePaymentDetails = ({
  cardNumber,
  expiryDate,
  cvv,
  amount,
}) => {
  const validations = [
    { isValid: !!cardNumber, message: "Card number is required." },
    { isValid: !!expiryDate, message: "Expiry date is required." },
    { isValid: !!cvv, message: "CVV is required." },
    {
      isValid: validators.cardNumber(cardNumber),
      message: "Invalid card number. Please check the format.",
    },
    {
      isValid: validators.expiryDate(expiryDate),
      message:
        "Invalid expiry date. Format should be MM/YY, not expired or 10+ years in the future.",
    },
    {
      isValid: validators.cvv(cvv, cardNumber),
      message: "Invalid CVV. Should be 3 digits (4 for Amex).",
    },
  ];

  // Add amount validation if provided
  if (amount !== null && amount !== undefined) {
    validations.push({
      isValid: validators.amount(amount),
      message: "Invalid amount. Please enter a positive number.",
    });
  }

  // Find first validation failure, if any
  const failedValidation = validations.find((v) => !v.isValid);
  if (failedValidation) {
    return { valid: false, message: failedValidation.message };
  }

  return { valid: true };
};

// Identify card type based on number
export const identifyCardType = (cardNumber) => {
  if (!cardNumber) return "Unknown";

  const length = cardNumber.length;
  const firstTwo = parseInt(cardNumber.substring(0, 2), 10);
  const firstFour = parseInt(cardNumber.substring(0, 4), 10);

  if (length >= 13 && length <= 19 && cardNumber.startsWith("4")) return "Visa";

  if (
    (length === 16 && firstFour >= 2221 && firstFour <= 2720) ||
    (length === 16 && firstTwo >= 51 && firstTwo <= 55)
  )
    return "MasterCard";

  if (length === 15 && (firstTwo === 34 || firstTwo === 37))
    return "American Express";

  if (length >= 16 && length <= 19 && (firstTwo === 65 || firstFour === 6011))
    return "Discover";

  return "Unknown Card Type";
};

// Firebase operations
export const firebaseOperations = {
  // Save transaction to Firestore (only last 4 digits for security)
  saveTransaction: async (userInput) => {
    try {
      const transactionData = {
        cardNumber: userInput.cardNumber.slice(-4),
        expiryDate: userInput.expiryDate,
        amount: userInput.amount,
        timestamp: serverTimestamp(),
      };

      const transactionRef = await addDoc(
        collection(db, "transactions"),
        transactionData
      );
      console.log(`✅ Transaction saved with ID: ${transactionRef.id}`);
      return transactionRef.id;
    } catch (error) {
      console.error("❌ Error saving transaction:", error);
      throw error;
    }
  },

  // Get past transactions from Firestore
  getTransactions: async () => {
    try {
      const transactionsRef = collection(db, "transactions");
      const q = query(transactionsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      let transactions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Add a client-side fallback timestamp if server timestamp isn't ready yet
        if (!data.timestamp) {
          data.timestamp = { seconds: Date.now() / 1000, nanoseconds: 0 };
        }
        transactions.push({ id: doc.id, ...data });
      });

      console.log("📜 Retrieved transactions:", transactions);
      return transactions;
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      throw error;
    }
  },

  // Clear all transactions
  clearTransactions: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "transactions"));
      const deletePromises = querySnapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "transactions", docSnap.id))
      );
      await Promise.all(deletePromises);
      console.log("✅ All transactions deleted!");
      return true;
    } catch (error) {
      console.error("❌ Error deleting transactions:", error);
      throw error;
    }
  },
};

// Handle the payment process
export async function handlePayment(userInput) {
  try {
    state.currentStatus = "processing";
    console.log("✅ Processing payment with:", userInput);

    // Validate payment details
    const validation = validatePaymentDetails(userInput);
    if (!validation.valid) {
      state.currentStatus = "error";
      throw new Error(validation.message);
    }

    // Save transaction and get updated transactions
    await firebaseOperations.saveTransaction(userInput);
    state.currentStatus = "success";

    // Return the updated transactions
    return await firebaseOperations.getTransactions();
  } catch (error) {
    state.currentStatus = "error";
    console.error("❌ Payment failed:", error.message);
    throw error;
  }
}

// Export getTransactions and clearTransactions directly from firebaseOperations
export const { getTransactions, clearTransactions } = firebaseOperations;

// Reset state to initial values
export const resetState = () => {
  state.userInput = {
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: null,
  };
  state.currentStatus = "idle";
};
