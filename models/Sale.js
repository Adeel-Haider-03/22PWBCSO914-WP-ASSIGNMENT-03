const mongoose = require('mongoose');

// Define the Sale schema
const saleSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Add other properties as needed
});

// Create the Sale model
const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;
