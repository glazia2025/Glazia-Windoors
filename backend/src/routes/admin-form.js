const express = require('express');
const isAdmin = require('../middleware/adminMiddleware');
const { addProduct, getProducts, editProduct, deleteProduct, searchProduct } = require('../controllers/productController');
const {addHardware, getHardwares, addAllProducts, editHardware, deleteHardware, searchHardware} = require('../controllers/hardwareController');
const router = express.Router();

router.post('/add-product', isAdmin, addProduct);
router.post('/add-hardware', isAdmin, addHardware);
router.get('/getHardwares', getHardwares);
router.post('/add-all', isAdmin, addAllProducts);
router.get('/search-product', searchProduct);
router.get('/search-hardware', searchHardware);

router.put('/edit-product/:category/:productType/:productId', isAdmin, editProduct);
router.delete('/delete-product/:category/:productType/:productId', isAdmin, deleteProduct);
router.get('/getProducts', getProducts);
router.put('/edit-hardware/:option/:productId', isAdmin, editHardware);
router.delete('/delete-hardware/:option/:productId', isAdmin, deleteHardware);

module.exports = router;
