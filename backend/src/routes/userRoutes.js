const express = require('express');
const { getProducts } = require('../controllers/productController');
const { createUser, getUser, updateUser } = require('../controllers/userController')
const router = express.Router();

router.post('/register', createUser);
router.get('/getUser', getUser);
router.put('/updateUser', updateUser);
router.get('/getProducts', getProducts);

module.exports = router;
