const express = require('express');
const { getProducts, getProfileHierarchy } = require('../controllers/productController');
const { createUser, getUser, updateUser } = require('../controllers/userController');
const { createOrder, getOrders, sendEmail } = require('../controllers/orderController');
const { getHardwareHeirarchy } = require('../controllers/hardwareController');
const router = express.Router();

router.post('/register', createUser);
router.get('/getUser', getUser);
router.put('/updateUser', updateUser);
router.post('/pi-generate', createOrder);
router.get('/getOrders', getOrders);
router.get('/get-profile-heirarchy', getProfileHierarchy);
router.get('/get-hardware-heirarchy', getHardwareHeirarchy);
router.post('/send-email', sendEmail)

module.exports = router;
