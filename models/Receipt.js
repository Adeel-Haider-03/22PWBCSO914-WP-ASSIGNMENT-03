// Example Receipt model definition
const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderId: { type: String, required: true }, // Make sure this field exists
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  // ... other fields as needed
});

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
