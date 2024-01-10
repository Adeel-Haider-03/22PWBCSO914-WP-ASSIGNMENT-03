// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const authMiddleware = require('../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');


// Admin registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const admin = new Admin({ username, email, password });
    const newAdmin = await admin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check the password
    if (password !== admin.password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate JWT token for admin
    const token = jwt.sign({ adminId: admin._id, userType: 'admin' }, 'your-secret-key', { expiresIn: '1h' });

    // Respond with token
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Additional admin functionality endpoints
router.get('/:adminId', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch admin details
router.get('/:adminId', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin panel (No authMiddleware applied here)
router.get('/:adminId/panel', async (req, res) => {
  res.json({ message: 'Admin panel accessed' });
});

// Manage products
router.post('/:adminId/products', authMiddleware, async (req, res) => {
  try {
    const { name, price } = req.body;

    const newProduct = new Product({ name, price });
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:adminId/products/:productId', authMiddleware, async (req, res) => {
  try {
    const { name, price } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      { name, price },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:adminId/products/:productName', authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.deleteOne({ name: req.params.productName });

    if (deletedProduct.deletedCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Logic for fetching sales data
const fetchSalesData = async () => {
  try {
    // Assuming you have a Sale model
    const salesData = await Sale.find().sort({ timestamp: 'desc' });

    // Customize the response based on your needs
    const formattedSalesData = salesData.map(sale => ({
      orderId: sale.orderId,
      amount: sale.amount,
      timestamp: sale.timestamp,
      // Add other properties as needed
    }));

    return formattedSalesData;
  } catch (error) {
    throw new Error(`Error fetching sales data: ${error.message}`);
  }
};

/// View sales data
router.get('/:adminId/sales', authMiddleware, async (req, res) => {
  try {
    // Fetch sales data using the defined logic
    const salesData = await fetchSalesData();

    res.json({ salesData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
