// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Add more fields as needed
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
