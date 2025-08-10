const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gstNumber: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true }, // This is the mobile number for login
  paUrl: {type: String, required: false, default: null, unique: true}
});

const User = mongoose.model('User', userSchema);

module.exports = User;
