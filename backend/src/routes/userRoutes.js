const express = require('express');
const { getProducts } = require('../controllers/productController');
const { createUser } = require('../controllers/userController')
const router = express.Router();

router.post('/register', createUser);
router.get('/getProducts', getProducts);

module.exports = router;
