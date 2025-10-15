// models/Shipment.js
const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  sender: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  receiver: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  packageDetails: {
    weight: String,
    dimensions: String,
    type: String,
    content: String,
    fragile: Boolean,
    value: Number, // for payment
  },
  payment: {
    amount: Number,
    currency: { type: String, default: "USD" },
    paid: { type: Boolean, default: false },
    method: String // e.g., PayPal, Card, Wallet
  },
  status: { type: String, default: "Pending" },
  currentLocation: String,
  destination: String,
  estimatedDelivery: String,
  history: [
    {
      date: String,
      location: String,
      note: String
    }
  ],
  media: [String], // URLs (images/videos)
  coordinates: {
    lat: Number,
    lng: Number
  },
}, { timestamps: true });

module.exports = mongoose.model("Shipment", shipmentSchema);
