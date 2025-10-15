// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resetToken: { type: String },
  resetExpires: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
