const express = require("express");
const isAdmin = require("../middleware/adminMiddleware");
const {
  addProduct,
  getProducts,
  editProduct,
  deleteProduct,
  searchProduct,
  updateTechSheet,
  getTechSheet,
} = require("../controllers/productController");
const {
  addHardware,
  getHardwares,
  addAllProducts,
  editHardware,
  deleteHardware,
  searchHardware,
  saveProductImage,
} = require("../controllers/hardwareController");
const { updateNalco, approvePayment, completeOrder } = require("../controllers/orderController");
const { getNalco } = require("../controllers/userController");
const isUser = require("../middleware/userMiddleware");
const router = express.Router();

router.post("/add-product", isAdmin, addProduct);
router.post("/add-hardware", isAdmin, addHardware);
router.get("/getHardwares", isUser, getHardwares);
router.post("/add-all", isAdmin, addAllProducts);
router.get("/search-product", isUser, searchProduct);
router.get("/search-hardware", isUser, searchHardware);
router.get("/get-nalco", getNalco);
router.post(
  "/save-product-images",
  isAdmin,
  express.json({ limit: "50mb" }),
  saveProductImage
);

router.post("/update-tech-sheet", isAdmin, updateTechSheet);
router.put(
  "/edit-product/:category/:productType/:productId",
  isAdmin,
  editProduct
);
router.delete(
  "/delete-product/:category/:productType/:productId",
  isAdmin,
  deleteProduct
);
router.get("/getProducts", isUser, getProducts);
router.put("/edit-hardware/:option/:productId", isAdmin, editHardware);
router.delete("/delete-hardware/:option/:productId", isAdmin, deleteHardware);
router.post("/update-nalco", isAdmin, updateNalco);
router.get("/get-tech-sheet", isUser, getTechSheet);
router.post("/approve-payment", isAdmin, approvePayment);
router.post("/complete-order", isAdmin, express.json({ limit: "50mb" }), completeOrder);

module.exports = router;
