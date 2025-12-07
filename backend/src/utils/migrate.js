require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

// Collection names
const SOURCE = "profileoptions";
const COLL_CATEGORIES = "categories";
const COLL_SIZES = "sizes";
const COLL_PRODUCTS = "products";
const COLL_CATEGORY_SIZES = "categorySizes";
const COLL_SIZE_PRODUCTS = "sizeProducts";

async function runMigration() {
  try {
    await connectDB();
    const db = mongoose.connection.db;

    console.log("🔗 Connected to MongoDB");

    const sourceDoc = await db.collection(SOURCE).findOne();
    if (!sourceDoc) {
      console.log("❌ No source data found");
      return process.exit(1);
    }

    // Clear destination collections
    await Promise.all([
      db.collection(COLL_CATEGORIES).deleteMany({}),
      db.collection(COLL_SIZES).deleteMany({}),
      db.collection(COLL_PRODUCTS).deleteMany({}),
      db.collection(COLL_CATEGORY_SIZES).deleteMany({}),
      db.collection(COLL_SIZE_PRODUCTS).deleteMany({})
    ]);

    console.log("🧹 Cleared destination collections");

    const categoriesObj = sourceDoc.categories;

    for (const categoryName of Object.keys(categoriesObj)) {
      const categoryData = categoriesObj[categoryName];

      // INSERT CATEGORY (AUTO-ID)
      const categoryInsert = await db.collection(COLL_CATEGORIES).insertOne({
        name: categoryName,
        description: `${categoryName} window system`
      });

      const categoryId = categoryInsert.insertedId;

      console.log(`📁 Category created: ${categoryName} → ${categoryId}`);

      const sizes = categoryData.options || [];
      const rates = categoryData.rate || {};
      const enabled = categoryData.enabled || {};
      const productsMap = categoryData.products || {};

      for (const sizeLabel of sizes) {

        // INSERT SIZE (AUTO-ID)
        const sizeInsert = await db.collection(COLL_SIZES).insertOne({
          categoryId,
          label: sizeLabel,
          rate: Number(rates[sizeLabel]) || 0,
          enabled: Boolean(enabled[sizeLabel])
        });

        const sizeId = sizeInsert.insertedId;

        console.log(`   ➤ Size added: ${sizeLabel} → ${sizeId}`);

        // INSERT category → size mapping
        await db.collection(COLL_CATEGORY_SIZES).insertOne({
          categoryId,
          sizeId
        });

        const productList = productsMap[sizeLabel] || [];

        // Deduplicate products by sapCode or id
        const seen = new Set();
        const uniqueProducts = productList.filter(p => {
          const key = p.sapCode || p.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        for (const prod of uniqueProducts) {
          const productKey = prod.sapCode || prod.id;

          // UPSERT PRODUCT (AUTO-ID only if new)
          let productDoc = await db.collection(COLL_PRODUCTS).findOne({
            uniqueKey: productKey
          });

          let productId;

          if (!productDoc) {
            const insert = await db.collection(COLL_PRODUCTS).insertOne({
              uniqueKey: productKey,
              sapCode: prod.sapCode,
              part: prod.part,
              description: prod.description,
              degree: prod.degree,
              per: prod.per,
              kgm: prod.kgm,
              length: prod.length,
              image: prod.image || null
            });

            productId = insert.insertedId;
          } else {
            productId = productDoc._id;

            // Update existing product
            await db.collection(COLL_PRODUCTS).updateOne(
              { _id: productId },
              {
                $set: {
                  sapCode: prod.sapCode,
                  part: prod.part,
                  description: prod.description,
                  degree: prod.degree,
                  per: prod.per,
                  kgm: prod.kgm,
                  length: prod.length,
                  image: prod.image || null
                }
              }
            );
          }

          // UPSERT mapping (will NOT duplicate)
          await db.collection(COLL_SIZE_PRODUCTS).updateOne(
            { sizeId, productId },
            { $set: { sizeId, productId } },
            { upsert: true }
          );

          console.log(`      • Linked Product ${productKey} → ${productId}`);
        }
      }
    }

    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
