const express = require('express');
const Product = require('../models/Product'); // Import the Product model
const isAdmin = require('../middleware/adminMiddleware');
const { addProduct, getProducts, editProduct, deleteProduct, searchProduct } = require('../controllers/productController');
const router = express.Router();

router.post('/add-product', isAdmin, addProduct);
router.get('/search-product', searchProduct);
router.put('/edit-product/:category/:productType/:productId', isAdmin, editProduct);
router.delete('/delete-product/:category/:productType/:productId', isAdmin, deleteProduct);
router.get('/getProducts', getProducts);

module.exports = router;
