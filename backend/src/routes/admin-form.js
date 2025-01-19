const express = require('express');
const isAdmin = require('../middleware/adminMiddleware');
const { addProduct, getProducts, editProduct, deleteProduct, searchProduct, updateTechSheet, getTechSheet } = require('../controllers/productController');
const {addHardware, getHardwares, addAllProducts, editHardware, deleteHardware, searchHardware, saveProductImage} = require('../controllers/hardwareController');
const { updateNalco } = require('../controllers/orderController');
const { getNalco } = require('../controllers/userController');
const router = express.Router();

router.post('/add-product', isAdmin, addProduct);
router.post('/add-hardware', isAdmin, addHardware);
router.get('/getHardwares', getHardwares);
router.post('/add-all', isAdmin, addAllProducts);
router.get('/search-product', searchProduct);
router.get('/search-hardware', searchHardware);
router.get('/get-nalco', getNalco);
router.post('/save-product-images', express.json({ limit: '50mb' }),  saveProductImage);

router.post('/update-tech-sheet', isAdmin, updateTechSheet)
router.put('/edit-product/:category/:productType/:productId', isAdmin, editProduct);
router.delete('/delete-product/:category/:productType/:productId', isAdmin, deleteProduct);
router.get('/getProducts', getProducts);
router.put('/edit-hardware/:option/:productId', isAdmin, editHardware);
router.delete('/delete-hardware/:option/:productId', isAdmin, deleteHardware);
router.post('/update-nalco', isAdmin, updateNalco);
router.get('/get-tech-sheet', getTechSheet);

module.exports = router;
