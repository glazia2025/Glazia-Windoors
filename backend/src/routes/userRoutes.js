const express = require('express');
const { getProducts } = require('../controllers/productController');
const { createUser, getUser } = require('../controllers/userController')
const router = express.Router();

router.post('/register', createUser);
router.get('/getUser', getUser);
router.get('/getProducts', getProducts);

module.exports = router;
