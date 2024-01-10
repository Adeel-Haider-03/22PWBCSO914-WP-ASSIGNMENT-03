const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes'); 


const app = express();


require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api', productRoutes);

// Test route
app.get('/', (req, res) => {
    res.send('Hello, E-commerce MERN Stack!');
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
