// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product
router.post('/products', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Fetch products with sorting options
router.get('/', async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    const sortOptions = {};

    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const products = await Product.find().sort(sortOptions);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;
