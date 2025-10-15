// models/Shipment.js
const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
  tracking: { type: String, unique: true, required: true }, // SHPXxxxxxx
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sender: {
    name: String,
    phone: String,
    address: String,
    country: String
  },
  receiver: {
    name: String,
    phone: String,
    address: String,
    country: String
  },
  package: {
    weightKg: Number,
    size: { length: Number, width: Number, height: Number },
    type: String, // e.g., "Box", "Envelope", "Pallet"
    photos: [String], // cloudinary urls
    videos: [String]  // cloudinary urls
  },
  status: { type: String, default: 'Created' }, // Created, In Transit, Delivered, etc.
  location: { lat: Number, lng: Number, name: String },
  eta: String,
  carrier: { type: String, default: 'ShipEx' },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Shipment', ShipmentSchema);
