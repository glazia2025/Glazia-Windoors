const express = require("express");
const router = express.Router();
const isUser = require("../middleware/userMiddleware");
const {
  getSystems,
  getSeries,
  getDescriptions,
  getOptionLists,
  previewRate,
  createQuotation,
  listQuotations,
  getQuotationById,
  updateQuotationById,
} = require("../controllers/quotationController");

router.get("/systems", getSystems);
router.get("/systems/:systemType/series", getSeries);
router.get(
  "/systems/:systemType/series/:series/descriptions",
  getDescriptions
);
router.get("/options", getOptionLists);
router.post("/rate-preview", previewRate);
router.post("/", createQuotation);
router.get("/", listQuotations);
router.get("/:id", getQuotationById);
router.post("/:id", updateQuotationById);

module.exports = router;
