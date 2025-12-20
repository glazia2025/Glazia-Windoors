const express = require("express");
const router = express.Router();
const isAdmin = require("../middleware/adminMiddleware");
const {
  createSystem,
  listSystems,
  updateSystem,
  deleteSystem,
  createSeries,
  listSeries,
  updateSeries,
  deleteSeries,
  createOptionSet,
  listOptionSets,
  updateOptionSet,
  deleteOptionSet,
  createAreaSlab,
  listAreaSlabs,
  updateAreaSlab,
  deleteAreaSlab,
  createBaseRate,
  listBaseRates,
  updateBaseRate,
  deleteBaseRate,
  createHandleRule,
  listHandleRules,
  updateHandleRule,
  deleteHandleRule,
  createHandleOption,
  listHandleOptions,
  updateHandleOption,
  deleteHandleOption,
} = require("../controllers/quotationAdminController");

// Systems
router.post("/systems", isAdmin, createSystem);
router.get("/systems", isAdmin, listSystems);
router.put("/systems/:id", isAdmin, updateSystem);
router.delete("/systems/:id", isAdmin, deleteSystem);

// Series
router.post("/series", isAdmin, createSeries);
router.get("/series", isAdmin, listSeries);
router.put("/series/:id", isAdmin, updateSeries);
router.delete("/series/:id", isAdmin, deleteSeries);

// Option sets
router.post("/option-sets", isAdmin, createOptionSet);
router.get("/option-sets", isAdmin, listOptionSets);
router.put("/option-sets/:id", isAdmin, updateOptionSet);
router.delete("/option-sets/:id", isAdmin, deleteOptionSet);

// Area slabs
router.post("/area-slabs", isAdmin, createAreaSlab);
router.get("/area-slabs", isAdmin, listAreaSlabs);
router.put("/area-slabs/:id", isAdmin, updateAreaSlab);
router.delete("/area-slabs/:id", isAdmin, deleteAreaSlab);

// Base rates
router.post("/base-rates", isAdmin, createBaseRate);
router.get("/base-rates", isAdmin, listBaseRates);
router.put("/base-rates/:id", isAdmin, updateBaseRate);
router.delete("/base-rates/:id", isAdmin, deleteBaseRate);

// Handle rules
router.post("/handle-rules", isAdmin, createHandleRule);
router.get("/handle-rules", isAdmin, listHandleRules);
router.put("/handle-rules/:id", isAdmin, updateHandleRule);
router.delete("/handle-rules/:id", isAdmin, deleteHandleRule);

// Handle options (type+color+rate)
router.post("/handle-options", isAdmin, createHandleOption);
router.get("/handle-options", isAdmin, listHandleOptions);
router.put("/handle-options/:id", isAdmin, updateHandleOption);
router.delete("/handle-options/:id", isAdmin, deleteHandleOption);

module.exports = router;
