const mongoose = require('mongoose');

const dbURI = 'mongodb+srv://saur222509:UGPldhqfs6CK4XHI@dashboard.qucre.mongodb.net/?retryWrites=true&w=majority&appName=Dashboard';

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true, 
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit the application if the connection fails
  }
};

module.exports = connectDB;
