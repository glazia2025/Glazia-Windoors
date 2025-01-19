const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
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

// Define the user order schema
const userOrderSchema = new mongoose.Schema({
    user: { type: userSchema, required: true },
    products: { type: [orderSchema], required: true },
});

const nalcoSchema = new mongoose.Schema({
    nalcoPrice: { type: Number, required: true },
    date: {type: Date, required: true }
});


const UserOrder = mongoose.model('UserOrder', userOrderSchema);
const Nalco = mongoose.model('nalco', nalcoSchema);

module.exports = { UserOrder, Nalco };