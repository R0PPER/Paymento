export const state = {
  userInput: {
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: 0,
  },
  transactions: [], // Stores past transactions
  currentStatus: "", // "idle", "processing", "success", "error"
};

const validateCardNumber = function (cardNumber) {};

export const validateExpiryDate = function (expiryDate) {
  // Check if format is correct
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;

  const [month, year] = expiryDate.split("/").map(Number);
  const currentYear = new Date().getFullYear() % 100; // Get last two digits of the year (e.g., 25 for 2025)
  const currentMonth = new Date().getMonth() + 1; // Months are 0-based in JS, so +1

  // Check if month is valid
  if (month < 1 || month > 12) return false;

  // Check if year is within a valid range (current year to +10 years)
  if (year < currentYear || year > currentYear + 10) return false;

  // If the year is the same as the current year, ensure the month isn't in the past
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

const validateCVV = function (cvv) {
  if (!/^\d+$/.test(cvv)) return false; // Must be only digits

  const length = cvv.length;
  const cardType = identifyCardType(state.userInput.cardNumber);

  if (
    length === 3 &&
    (cardType === "Visa" ||
      cardType === "MasterCard" ||
      cardType === "Discover")
  )
    return true;
  if (length === 4 && cardType === "American Express") return true;

  return false;
};

const identifyCardType = function (cardNumber) {
  const length = cardNumber.length;
  const firstTwoDigits = parseInt(cardNumber.substring(0, 2), 10);
  const firstThreeDigits = parseInt(cardNumber.substring(0, 3), 10);
  const firstFourDigits = parseInt(cardNumber.substring(0, 4), 10);
  const firstSixDigits = parseInt(cardNumber.substring(0, 6), 10);

  if (length >= 13 && length <= 19 && cardNumber.startsWith("4")) {
    return "Visa";
  } else if (
    (length === 16 && firstFourDigits >= 2221 && firstFourDigits <= 2720) ||
    (length === 16 && firstTwoDigits >= 51 && firstTwoDigits <= 55)
  ) {
    return "MasterCard";
  } else if (
    length === 15 &&
    (firstTwoDigits === 34 || firstTwoDigits === 37)
  ) {
    return "American Express";
  } else if (
    length >= 16 &&
    length <= 19 &&
    (firstTwoDigits === 65 ||
      firstFourDigits === 6011 ||
      (firstThreeDigits >= 644 && firstThreeDigits <= 649) ||
      (firstSixDigits >= 622126 && firstSixDigits <= 622925))
  ) {
    return "Discover";
  }

  return "Unknown Card Type";
};

const processTransaction = function (amount, cardDetails) {};

//Loads stored transactions
const loadTransactions = function () {};

//save transaction to history
const saveTransaction = function () {};

//Get transaction history
const getTransactionHistory = function () {};

//Creates  unique transaction id
const createTransactionId = function () {};

//Returns the current timestamp for a transaction
const getTransactionDateTime = function () {};

export const handlePayment = function () {
  try {
  } catch (err) {}
};
