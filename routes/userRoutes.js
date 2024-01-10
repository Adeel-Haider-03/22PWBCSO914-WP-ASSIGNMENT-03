// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Receipt = require('../models/Receipt');  // Check for correct spelling and capitalization
const jwt = require('jsonwebtoken');
const Product = require('../models/Product'); 
const authMiddleware = require('../middlewares/authMiddleware');

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check the password
    if (password !== user.password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate JWT token for user
    const token = jwt.sign({ userId: user._id, userType: 'user' }, 'your-secret-key', { expiresIn: '1h' });

    // Respond with token
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Fetch user details
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage user's cart
// Assuming you have a route like this in your backend
router.post('/:userId/cart', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure that user.cart is initialized as an array
    user.cart = user.cart || [];

    // Assuming request body includes productName and quantity
    const { productName, quantity } = req.body;

    // Modify the lookup based on the product name
    const product = await Product.findOne({ name: productName });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add or update items in the user's cart
    const existingItem = user.cart.find(item => item.productId.toString() === product._id.toString());

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId: product._id, quantity });
    }

    await user.save();

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// View order history
router.get('/:userId/orders', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assuming orders are stored in a separate field in the user model
    const orders = user.orders || [];

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Manage account details
router.patch('/:userId/account', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Proceed to checkout

router.post('/:userId/checkout', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { paymentMethod } = req.body;

    // Validate and process payment (example: Check if payment method is valid)
    if (paymentMethod !== 'cash-on-delivery' && paymentMethod !== 'debit-credit-card') {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Logic for generating a payment receipt (customize based on your needs)
    const paymentReceipt = new Receipt({
      orderId: Math.floor(Math.random() * 1000),
      amount: calculateTotalAmount(user.cart),
      paymentMethod,
    });

    // Save the receipt to the user's order history
    user.orders = user.orders || [];
    user.orders.push(paymentReceipt);
    await user.save();

    // Clear the user's cart after successful checkout
    user.cart = [];
    await user.save();

    res.json({ message: 'Checkout successful', paymentReceipt, orderId: paymentReceipt.orderId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Example route handling GET request for receipt
router.get('/:userId/checkout/receipt', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const orderId = req.query.orderId;

    // Fetch receipt data based on user ID and orderId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const receipt = user.orders.find(order => order.orderId === orderId);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




function calculateTotalAmount(cart) {
  if (!Array.isArray(cart)) {
    console.error('Cart is not an array:', cart);
    return 0; // or handle the error in an appropriate way
  }

  console.log('Cart type:', typeof cart);
  console.log('Cart length:', cart.length);

  let total = 0;

  for (const item of cart) {
    if (
      item &&
      item.product &&
      typeof item.product === 'object' &&
      typeof item.product.price === 'number' &&
      typeof item.quantity === 'number'
    ) {
      total += item.quantity * item.product.price;
    } else {
      console.error('Invalid item in cart:', item);
      // Skip the current item if it's invalid
    }
  }

  return total;
}




module.exports = router;
