const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

// Define the order schema
const orderSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  description: { type: String, required: false },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
});

// Define the payment shema
const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  cycle: { type: Number, required: true },
  proof: { type: String, required: false },
  proofAdded: { type: Boolean, required: false },
  proofAddedAt: { type: Date, required: false },
  isApproved: { type: Boolean, default: false },
  dueDate: { type: Date },
  depositedAmount: { type: Number, required: false }, // Amount deposited by user as entered by admin during approval
});

// Define the user order schema
const userOrderSchema = new mongoose.Schema(
  {
    user: { type: userSchema, required: true },
    products: { type: [orderSchema], required: true },
    payments: [{ type: paymentSchema }],
    totalAmount: { type: Number, required: false },
    biltyDoc: { type: String },
    eWayBill: { type: String },
    driverInfo: {
      name: { type: String },
      phone: { type: String },
      description: { type: String },
    },
    taxInvoice: { type: String },
    isComplete: { type: Boolean, default: false },
    completedAt: { type: Date },
    deliveryType: {
      type: String,
      enum: ['SELF', 'FULL', 'PART'],
      required: true,
    },
  },
  { timestamps: true }
);

const nalcoSchema = new mongoose.Schema({
  nalcoPrice: { type: Number, required: true },
  date: { type: Date, required: true },
});

const UserOrder = mongoose.model("UserOrder", userOrderSchema);
const Nalco = mongoose.model("nalco", nalcoSchema);

module.exports = { UserOrder, Nalco };
