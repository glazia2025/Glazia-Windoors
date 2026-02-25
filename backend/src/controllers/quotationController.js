const mongoose = require("mongoose");
const Quotation = require("../models/Quotation/Quotation");
const User = require("../models/User");
const System = require("../models/Quotation/System");
const Series = require("../models/Quotation/Series");
const OptionSet = require("../models/Quotation/OptionSet");
const AreaSlab = require("../models/Quotation/AreaSlab");
const BaseRate = require("../models/Quotation/BaseRate");
const HandleRule = require("../models/Quotation/HandleRule");
const HandleOption = require("../models/Quotation/HandleOption");

const numberOr = (value, fallback = 0) => {
  const asNumber = Number(value);
  return Number.isFinite(asNumber) ? asNumber : fallback;
};

const unique = (list) => Array.from(new Set(list.filter(Boolean)));

const toBooleanFlag = (value) => {
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
};

const { restoreRateMap } = require("../utils/rateMapUtils");

const mapToArray = (map) => {
  const restored = restoreRateMap(map);
  return Object.entries(restored).map(([name, rate]) => ({
    name,
    rate: numberOr(rate, 0),
  }));
};

const buildQuotationPrefix = (name = "") => {
  const compact = name.replace(/[^a-zA-Z]/g, "").toUpperCase();
  const initials = (compact.slice(0, 2) || "XX").padEnd(2, "X");
  return `QU${initials}`;
};

const getNextQuotationId = async (userId) => {
  let name = "";
  if (userId) {
    const user = await User.findById(userId).select("name").lean();
    name = user?.name || "";
  }

  const prefix = buildQuotationPrefix(name);
  console.log("prefix", prefix);
  const latest = await Quotation.findOne({
    "generatedId": new RegExp(`^${prefix}`),
  })
    .sort({ createdAt: -1 })
    .select({ "generatedId": 1 })
    .lean();

  console.log("latest", latest);

  const lastId = latest?.generatedId || "";
  const suffix = Number(lastId.slice(prefix.length));
  const nextValue = Number.isFinite(suffix) && suffix > 0 ? suffix + 1 : 1;
  const nextSuffix = String(nextValue).padStart(3, "0");

  return `${prefix}${nextSuffix}`;
};

const fetchOptionValues = async (type, systemDoc) => {
  if (type === "colorFinish" || type === "meshType" || type === "glassSpec") {
    const globalOption = await OptionSet.findOne({ type, system: { $exists: false } }).lean();
    return mapToArray(globalOption?.values);
  }

  if (systemDoc) {
    const optionSet = await OptionSet.findOne({ type, system: systemDoc._id }).lean();
    if (optionSet?.values) return mapToArray(optionSet.values);
  }
  const globalOption = await OptionSet.findOne({ type, system: { $exists: false } }).lean();
  return mapToArray(globalOption?.values);
};

const pickHandleRule = (rules, systemType, series, description) => {
  if (!rules?.length) return null;
  const exact = rules.find(
    (r) => r.description === description && r.systemType === systemType && r.series === series
  );
  if (exact) return exact;
  const systemMatch = rules.find(
    (r) => r.description === description && r.systemType === systemType && !r.series
  );
  if (systemMatch) return systemMatch;
  const generic = rules.find(
    (r) => r.description === description && !r.systemType && !r.series
  );
  return generic || null;
};

const resolveHandleInfo = (description, seriesMeta, rules, systemType, series) => {
  if (seriesMeta) {
    const matched = seriesMeta.descriptions?.find(
      (item) => item.name === description
    );
    if (matched) {
      return {
        types: matched.handleTypes || [],
        count: numberOr(matched.handleCount, 0),
      };
    }
  }

  const rule = pickHandleRule(rules, systemType, series, description);
  if (rule) {
    return {
      types: rule.handleTypes || [],
      count: numberOr(rule.handleCount, 0),
    };
  }

  return { types: [], count: 0 };
};

const getAreaSlabsSorted = async () => {
  const slabs = await AreaSlab.find({}).sort({ order: 1, max: 1 }).lean();
  if (slabs.length >= 3) return slabs.slice(0, 3);
  const defaults = [
    { label: "Small", max: 10 },
    { label: "Medium", max: 20 },
    { label: "Large", max: Number.MAX_SAFE_INTEGER },
  ];
  return [...slabs, ...defaults.slice(slabs.length, 3)];
};

const resolveAreaSlabIndex = (area, slabs) => {
  const safeArea = numberOr(area, 0);
  const slab = slabs.find((item) => safeArea <= item.max);
  if (slab) return slabs.indexOf(slab);
  return slabs.length ? slabs.length - 1 : 0;
};

const resolveBaseRate = async (systemType, series, description, area) => {
  const slabs = await getAreaSlabsSorted();
  const baseRateDoc = await BaseRate.findOne({ systemType, series, description }).lean();
  const areaIndex = Math.min(resolveAreaSlabIndex(area, slabs), 2);
  const rates = Array.isArray(baseRateDoc?.rates)
    ? [...baseRateDoc.rates, 0, 0, 0].slice(0, 3)
    : [0, 0, 0];
  const baseRate = rates[areaIndex] ?? 0;

  return { baseRate, areaIndex, slabs: slabs.slice(0, 3) };
};

const getSystems = async (req, res) => {
  try {
    const systems = await System.find({}, "name").sort({ name: 1 }).lean();
    res.json({ systems: systems.map((item) => item.name) });
  } catch (error) {
    console.error("Error fetching systems:", error);
    res.status(500).json({ message: "Error fetching system list" });
  }
};

const getSeries = async (req, res) => {
  const { systemType } = req.params;
  if (!systemType) {
    return res.status(400).json({ message: "systemType is required" });
  }

  try {
    const systemDoc = await System.findOne({ name: systemType }).lean();
    const seriesFromDb = await Series.find(
      systemDoc ? { system: systemDoc._id } : {},
      "name"
    ).lean();
    const seriesFromRates = await BaseRate.find(
      { systemType },
      "series"
    ).lean();

    const series = unique([
      ...seriesFromDb.map((item) => item.name),
      ...seriesFromRates.map((item) => item.series),
    ]);

    res.json({ series });
  } catch (error) {
    console.error("Error fetching series:", error);
    res.status(500).json({ message: "Error fetching series list" });
  }
};

const getDescriptions = async (req, res) => {
  const { systemType, series } = req.params;
  if (!systemType || !series) {
    return res
      .status(400)
      .json({ message: "systemType and series are required" });
  }

  try {
    const systemDoc = await System.findOne({ name: systemType }).lean();
    const seriesDoc = await Series.findOne(
      systemDoc ? { name: series, system: systemDoc._id } : { name: series }
    )
      .populate("system", "name")
      .lean();

    console.log('systemDoc, seriesDoc', systemDoc, seriesDoc);
    const rateDocs = await BaseRate.find(
      { systemType, series },
      "description rates"
    ).lean();

    console.log('rateDescriptions', rateDocs);

    const dbDescriptions = (seriesDoc?.descriptions || []).map(
      (item) => item.name
    );

    const descriptionList = unique([
      ...dbDescriptions,
      ...rateDocs.map((item) => item.description),
    ]);

    const handleRules = await HandleRule.find({
      description: { $in: descriptionList },
    }).lean();

    const rateMap = rateDocs.reduce((acc, doc) => {
      acc[doc.description] = doc.rates || [];
      return acc;
    }, {});

    const descriptions = descriptionList.map((item) => {
      const handleInfo = resolveHandleInfo(
        item,
        seriesDoc,
        handleRules,
        systemType,
        series
      );
      return {
        name: item,
        handleTypes: handleInfo.types,
        defaultHandleCount: handleInfo.count,
        baseRates: rateMap[item] || [],
      };
    });

    res.json({ descriptions });
  } catch (error) {
    console.error("Error fetching descriptions:", error);
    res.status(500).json({ message: "Error fetching description list" });
  }
};

const getOptionLists = async (req, res) => {
  const { systemType } = req.query;

  try {
    const [colorFinishes, meshTypes, glassSpecs] = await Promise.all([
      fetchOptionValues("colorFinish", null),
      fetchOptionValues("meshType", null),
      fetchOptionValues("glassSpec", null),
    ]);

    const handleOptions = systemType
      ? await HandleOption.find({ systemType }).lean()
      : [];

    res.json({
      colorFinishes,
      meshTypes,
      glassSpecs,
      handleOptions: handleOptions.map((h) => ({
        name: h.name,
        colors: mapToArray(h.colors),
      })),
    });
  } catch (error) {
    console.error("Error fetching option lists:", error);
    res.status(500).json({ message: "Error fetching option lists" });
  }
};

const previewRate = async (req, res) => {
  const {
    systemType,
    series,
    description,
    width,
    height,
    area: areaFromBody,
    quantity = 1,
  } = req.body;

  if (!systemType || !series || !description) {
    return res.status(400).json({
      message: "systemType, series and description are required to calculate",
    });
  }

  const computedArea =
    numberOr(areaFromBody, 0) || numberOr(width, 0) * numberOr(height, 0);
  const { baseRate, areaIndex, slabs } = await resolveBaseRate(
    systemType,
    series,
    description,
    computedArea
  );

  const handleRules = await HandleRule.find({ description }).lean();
  const handleInfo = resolveHandleInfo(
    description,
    null,
    handleRules,
    systemType,
    series
  );

  const amount = baseRate * (computedArea || 1) * numberOr(quantity, 1);

  res.json({
    rate: baseRate,
    amount,
    area: computedArea,
    areaSlabIndex: areaIndex,
    slabs,
    handleInfo: {
      types: handleInfo.types,
      defaultHandleCount: handleInfo.count,
    },
  });
};

const createQuotation = async (req, res) => {
  const {
    breakdown,
    items = [],
    customerDetails = {},
    quotationDetails = {},
    globalConfig = {},
  } = req.body;

  try {
    const generatedId = await getNextQuotationId(req.user?.userId);
    console.log('generatedId', generatedId);
    const quotation = await Quotation.create({
      user: req.user?.userId,
      items,
      customerDetails,
      quotationDetails: {
        ...quotationDetails
      },

      generatedId,

      globalConfig,
      breakdown,
    });

    res.status(201).json({ quotation });
  } catch (error) {
    console.error("Error creating quotation:", error);
    res.status(500).json({ message: "Error creating quotation" });
  }
};
const listQuotations = async (req, res) => {
  const { systemType, series, description, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (req.user?.role !== "admin") filter.user = req.user?.userId;

  if (systemType) filter.systemType = systemType;
  if (series) filter.series = series;
  if (description) filter.description = description;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  try {
    const [quotations, total] = await Promise.all([
      Quotation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("_id user customerDetails quotationDetails breakdown generatedId createdAt updatedAt") // keep list light
        .lean(),
      Quotation.countDocuments(filter),
    ]);

    res.json({
      quotations,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching quotations:", error);
    res.status(500).json({ message: "Error fetching quotations" });
  }
};

const getQuotationById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid quotation id" });
    }

    const quotation = await Quotation.findById(req.params.id).lean();
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (
      req.user?.role !== "admin" &&
      quotation.user &&
      req.user?.userId &&
      quotation.user.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({ quotation });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({ message: "Error fetching quotation" });
  }
};

const updateQuotationById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid quotation id" });
    }

    const quotation = await Quotation.findById(req.params.id).lean();
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ updatedQuotation });
  } catch (error) {
    console.error("Error fetching quotation:", error);
    res.status(500).json({ message: "Error fetching quotation" });
  }
};

module.exports = {
  getSystems,
  getSeries,
  getDescriptions,
  getOptionLists,
  previewRate,
  createQuotation,
  listQuotations,
  getQuotationById,
  updateQuotationById,
};
