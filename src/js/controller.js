import * as model from "./model.js";
import paymentView from "./views/paymentView.js";

const controlPayment = async function () {
  try {
    const expiryDate = paymentView.getExpiryDate();

    if (!model.validateExpiryDate(expiryDate)) {
      throw new Error("Invalid expiry date format.");
    }
  } catch (err) {
    console.error(err);
  }
};

// Initialize
const init = function () {
  model.validateExpiryDate("12/27");
  paymentView.paymentListeners();
  paymentView.addHandlerSubmit(controlPayment);
};

init();
