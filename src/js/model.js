import { db } from "../../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export const state = {
  userInput: {
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: 0,
  },
  transactions: [], // This will be updated with Firebase data
  currentStatus: "idle", // Possible states: "idle", "processing", "success", "error"
};

// Function to validate card number (basic check)
export const validateCardNumber = function (cardNumber) {
  return /^\d{13,19}$/.test(cardNumber); // Card number must be between 13-19 digits
};

// Function to validate expiry date
export const validateExpiryDate = function (expiryDate) {
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;

  const [month, year] = expiryDate.split("/").map(Number);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (month < 1 || month > 12) return false;
  if (year < currentYear || year > currentYear + 10) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

// Identify card type based on number
const identifyCardType = function (cardNumber) {
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

// Function to validate CVV based on card type
export const validateCVV = function (cvv, cardNumber) {
  if (!/^\d+$/.test(cvv)) return false;

  const length = cvv.length;
  const cardType = identifyCardType(cardNumber); // Use function argument instead

  if (length === 3 && ["Visa", "MasterCard", "Discover"].includes(cardType))
    return true;
  if (length === 4 && cardType === "American Express") return true;

  return false;
};

// Save transaction to Firestore
export const saveTransaction = async function (cardNumber, expiryDate, amount) {
  try {
    const lastFourDigits = cardNumber.slice(-4); // Store only last 4 digits for security

    const docRef = await addDoc(collection(db, "transactions"), {
      cardNumber: `**** **** **** ${lastFourDigits}`,
      expiryDate,
      amount,
      timestamp: serverTimestamp(),
      status: "pending",
    });

    console.log("Transaction saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw error;
  }
};

// Get past transactions from Firestore
export const getTransactionHistory = async function () {
  try {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    const transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched transactions:", transactions);
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

// Generate a unique transaction ID
const createTransactionId = function () {
  return Math.random().toString(36).slice(2, 11);
};

// Get current timestamp for a transaction
const getTransactionDateTime = function () {
  return new Date().toLocaleString();
};

// Process a transaction and store it in Firebase
export const processTransaction = async function (amount, cardDetails) {
  state.currentStatus = "processing";

  if (
    !validateCardNumber(cardDetails.cardNumber) ||
    !validateExpiryDate(cardDetails.expiryDate) ||
    !validateCVV(cardDetails.cvv)
  ) {
    state.currentStatus = "error";
    throw new Error("Invalid payment details");
  }

  const transaction = {
    id: createTransactionId(),
    amount,
    cardType: identifyCardType(cardDetails.cardNumber),
    status: "approved",
    timestamp: getTransactionDateTime(),
  };

  await saveTransaction(transaction);
  state.transactions.push(transaction);
  state.currentStatus = "success";
};

// Handle the overall payment process
export const handlePayment = async function () {
  try {
    await processTransaction(state.userInput.amount, state.userInput);
    console.log("Payment successful!");
  } catch (err) {
    console.error("Payment failed:", err.message);
  }
};
