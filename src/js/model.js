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

export const state = {
  userInput: {
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: null, // Initially null since amount is entered later
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

// Function to validate CVV based on card type
export const validateCVV = function (cvv, cardNumber) {
  if (!cvv || !/^[0-9]+$/.test(cvv)) return false;

  const length = cvv.length;
  const cardType = identifyCardType(cardNumber);

  if (length === 3 && ["Visa", "MasterCard", "Discover"].includes(cardType))
    return true;
  if (length === 4 && cardType === "American Express") return true;

  return false;
};

// Save transaction to Firestore
async function saveTransaction(userInput) {
  try {
    const transactionRef = await addDoc(collection(db, "transactions"), {
      cardNumber: userInput.cardNumber.slice(-4), // Save only last 4 digits for security
      expiryDate: userInput.expiryDate,
      amount: userInput.amount,
      timestamp: serverTimestamp(),
    });
    console.log(`✅ Transaction saved with ID: ${transactionRef.id}`);
  } catch (error) {
    console.error("❌ Error saving transaction:", error);
  }
}

// Get past transactions from Firestore
export async function getTransactions() {
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
    return [];
  }
}

// Process a transaction and store it in Firebase
export const processTransaction = async function (amount, cardDetails) {
  console.log("Final userInput before processing:", cardDetails);
  state.currentStatus = "processing";

  // Debugging values before validation
  console.log("🔍 Debugging values before validation:");
  console.log("cardNumber:", cardDetails.cardNumber);
  console.log("expiryDate:", cardDetails.expiryDate);
  console.log("cvv:", cardDetails.cvv);
  console.log("amount:", amount);

  if (
    !validateCardNumber(cardDetails.cardNumber) ||
    !validateExpiryDate(cardDetails.expiryDate) ||
    !validateCVV(cardDetails.cvv, cardDetails.cardNumber)
  ) {
    state.currentStatus = "error";
    throw new Error("Invalid payment details");
  }

  const transaction = {
    amount,
    cardType: identifyCardType(cardDetails.cardNumber),
    status: "approved",
    timestamp: new Date().toLocaleString(),
  };

  await saveTransaction(cardDetails.cardNumber, cardDetails.expiryDate, amount);
  state.transactions.push(transaction);
  state.currentStatus = "success";
};

// Handle the overall payment process// Call this after processing payment is successful
export async function handlePayment(userInput) {
  try {
    console.log("✅ Processing payment with:", userInput);

    // Save the transaction to Firestore
    const docRef = await addDoc(collection(db, "transactions"), {
      cardNumber: userInput.cardNumber.slice(-4), // Store only last 4 digits
      amount: userInput.amount,
      timestamp: serverTimestamp(),
    });

    console.log("✅ Transaction saved with ID:", docRef.id);

    // 🔥 Fetch updated transactions
    return await getTransactions(); // 👈 Return transactions instead of updating UI directly
  } catch (error) {
    console.error("❌ Payment failed:", error.message);
    throw error; // Ensure errors are handled in the controller
  }
}

export const clearTransactions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "transactions", docSnap.id))
    );
    await Promise.all(deletePromises);

    // ✅ Reset state without directly referencing model
    state.userInput = {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      amount: null,
    };

    console.log("✅ All transactions deleted & state reset!");
  } catch (err) {
    console.error("❌ Error deleting transactions:", err);
  }
};
