const express = require("express");
const router = express.Router();
const master = require("../controllers/profileController");

// CATEGORY APIs
router.post("/category", master.createCategory);
router.get("/categories", master.getCategories);
router.get("/category/:id/full", master.getCategoryFull);

// SIZE APIs
router.post("/size", master.createSize);
router.get("/sizes/category/:categoryId", master.getSizesByCategory);
router.get("/size/:sizeId/products", master.getProductsForSize);

// PRODUCT APIs
router.post("/product", master.createProduct);
router.get("/products", master.getProducts);

// MASTER STRUCTURED DATA
router.get("/full", master.getFullMasterData);

module.exports = router;
