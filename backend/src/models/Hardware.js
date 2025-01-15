const mongoose = require('mongoose');

// Define the product schema
const singleHardwareSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  sapCode: { type: String, required: true },
  perticular: { type: String, required: true },
  subCategory: { type: String, required: true},
  rate: { type: Number, required: true },
  system: { type: String, required: true }, // Unit, Meter, etc.
  length: { type: String, required: true },
  image: { type: String, required: false },
});

// Define the profile options schema with dynamic categories
const hardwareSchema = new mongoose.Schema(
  {
    categories: {
      type: Map,
      options: { type: [String], required: true },
      products: {
        type: Map,
        of: [singleHardwareSchema],
        required: true,
      },
      required: true,
    },
  },
  { strict: false }
);

const finalHardwareSchema = mongoose.model('hardwareSchema', hardwareSchema);

module.exports = finalHardwareSchema;
