const express = require('express');
const { getProducts, getProfileHierarchy, testRun } = require('../controllers/productController');
const { createUser, getUser, updateUser } = require('../controllers/userController');
const { createOrder, getOrders, sendEmail, createPayment, uploadPaymentProof } = require('../controllers/orderController');
const { getHardwareHeirarchy } = require('../controllers/hardwareController');
const isUser = require('../middleware/userMiddleware');
const router = express.Router();

router.post('/register', createUser);
router.get('/getUser', isUser, getUser);
router.put('/updateUser', isUser, updateUser);
router.post('/pi-generate', isUser, express.json({ limit: "50mb" }), createOrder);
router.post('/add-payment', isUser, express.json({ limit: "50mb" }), createPayment);
router.get('/getOrders', isUser, getOrders);
router.get('/get-profile-heirarchy', isUser, getProfileHierarchy);
router.get('/get-hardware-heirarchy', isUser, getHardwareHeirarchy);
router.post('/send-email', isUser, sendEmail);
router.post('/upload-payment-proof', isUser, express.json({ limit: "50mb" }), uploadPaymentProof)
router.get('/getProducts', getProducts);

module.exports = router;
