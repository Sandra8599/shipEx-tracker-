// db.js
const mongoose = require('mongoose');
const { MONGO_URI } = process.env;

module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing in env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected');
};
