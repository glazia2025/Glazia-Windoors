const express = require('express');
const Product = require('../models/Product'); // Import the Product model
const isAdmin = require('../middleware/adminMiddleware');
const { addProduct, getProducts } = require('../controllers/productController');
const router = express.Router();

router.post('/add-product', isAdmin, addProduct);

module.exports = router;
