const mongoose = require('mongoose');

// Define the product schema
const singleProductSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  sapCode: { type: String, required: true },
  description: { type: String, required: true },
  rate: { type: Number, required: true },
  per: { type: String, required: true }, // Unit, Meter, etc.
  kgm: { type: Number, required: true },
  length: { type: String, required: true },
  image: { type: String, required: false },
});

// Define the profile options schema with dynamic categories
const productSchema = new mongoose.Schema(
  {
    // Dynamic fields for categories (e.g., Casement, Sliding, etc.)
    categories: {
      type: Map,
      of: new mongoose.Schema({
        options: { type: [String], required: true },
        products: {
          type: Map,
          of: [singleProductSchema],
          required: true,
        },
      }),
      required: true,
    },
  },
  { strict: false } // Allow flexibility in adding new categories
);

const finalProductSchema = mongoose.model('productSchema', productSchema);

module.exports = finalProductSchema;
