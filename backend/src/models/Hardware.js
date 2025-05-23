const mongoose = require('mongoose');

// Define the product schema
const singleHardwareSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  sapCode: { type: String, required: true },
  perticular: { type: String, required: true },
  subCategory: { type: String, required: true},
  rate: { type: Number, required: true },
  system: { type: String, required: true }, // Unit, Meter, etc.
  moq: { type: String, required: true },
  image: { type: String, required: false },
});

// Define the profile options schema with dynamic categories
const hardwareOptionsSchema = new mongoose.Schema(
  {
    options: { type: [String], required: true },
    products: {
      type: Map,
      of: [singleHardwareSchema],
      required: true,
    },
  },
  { strict: false }
);

const HardwareOptions = mongoose.model('hardwareSchema', hardwareOptionsSchema);

module.exports = HardwareOptions;
