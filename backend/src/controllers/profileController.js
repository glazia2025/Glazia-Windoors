const Category = require("../models/Profiles/Category");
const Size = require("../models/Profiles/Size");
const Product = require("../models/Profiles/Product");
const CategorySize = require("../models/Profiles/CategorySize");
const SizeProduct = require("../models/Profiles/SizeProduct");

/* =====================================================
   CATEGORY CONTROLLERS
===================================================== */

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Full category → sizes → products structured response
exports.getCategoryFull = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: "Category not found" });

    const categorySizeLinks = await CategorySize.find({ categoryId }).populate("sizeId");

    const sizeData = [];

    for (const link of categorySizeLinks) {
      const size = link.sizeId;

      const sizeProducts = await SizeProduct.find({ sizeId: size._id })
        .populate("productId");

      sizeData.push({
        size,
        products: sizeProducts.map(sp => sp.productId),
      });
    }

    res.json({
      category,
      sizes: sizeData
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* =====================================================
   SIZE CONTROLLERS
===================================================== */

// Create Size
exports.createSize = async (req, res) => {
  try {
    const size = await Size.create(req.body);

    // Auto-create CategorySize mapping
    if (req.body.categoryId) {
      await CategorySize.create({
        categoryId: req.body.categoryId,
        sizeId: size._id
      });
    }

    res.json(size);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sizes belonging to a category
exports.getSizesByCategory = async (req, res) => {
  try {
    const sizes = await Size.find({ categoryId: req.params.categoryId });
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products for a size
exports.getProductsForSize = async (req, res) => {
  try {
    const sizeId = req.params.sizeId;

    console.log(sizeId, "sizeId");

    const mappings = await SizeProduct.find({ sizeId })
        .populate("productId");

      console.log(mappings, "mappings");

    res.json(mappings.map(m => m.productId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* =====================================================
   PRODUCT CONTROLLERS
===================================================== */

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    // Auto-create mapping if sizeId is provided
    if (req.body.sizeId) {
      await SizeProduct.create({
        sizeId: req.body.sizeId,
        productId: product._id
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// List all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* =====================================================
   MASTER API: FULL DATA STRUCTURE
===================================================== */

// Returns everything:
// Category → Sizes → Products
exports.getFullMasterData = async (req, res) => {
  try {
    const categories = await Category.find({});

    const output = [];

    for (const category of categories) {
      const categorySizes = await CategorySize.find({ categoryId: category._id })
        .populate("sizeId");

      const sizeBlocks = [];

      for (const cs of categorySizes) {
        const size = cs.sizeId;

        const sizeProducts = await SizeProduct.find({ sizeId: size._id })
          .populate("productId");

        sizeBlocks.push({
          size,
          products: sizeProducts.map(sp => sp.productId),
        });
      }

      output.push({
        category,
        sizes: sizeBlocks
      });
    }

    res.json(output);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
