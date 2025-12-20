const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        refCode: { type: String },
        location: { type: String },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        area: { type: Number, default: 0 },
        systemType: { type: String },
        series: { type: String },
        description: { type: String },
        colorFinish: { type: String },
        glassSpec: { type: String },
        handleType: { type: String },
        handleColor: { type: String },
        handleCount: { type: Number, default: 0 },
        meshPresent: { type: Boolean, default: false },
        meshType: { type: String },
        rate: { type: Number, default: 0 },
        quantity: { type: Number, default: 1 },
        amount: { type: Number, default: 0 },
        refImage: { type: String },
        remarks: { type: String },
      },
    ],
    customerDetails: {
      name: { type: String, default: "" },
      company: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    quotationDetails: {
      id: { type: String, default: "" },
      date: {
        type: String,
        default: () => new Date().toISOString().split("T")[0],
      },
      opportunity: { type: String, default: "" },
      terms: {
        type: String,
        default:
          "1. Prices are valid for 30 days from the date of quotation.\n2. Payment terms: 50% advance, 50% on delivery.\n3. Delivery time: 15-20 working days.",
      },
      notes: { type: String, default: "" },
    },
    breakdown: {
      totalAmount: { type: Number },
      profitPercentage: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);
