// routes/shipments.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const Shipment = require('../models/Shipment');
const User = require('../models/User');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function authMiddleware(req, res, next){
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).end();
  try {
    const data = jwt.verify(auth, JWT_SECRET);
    req.userId = data.id;
    next();
  } catch (e) {
    res.status(401).end();
  }
}

// generate tracking
function genTracking() {
  return 'SHPX' + Math.floor(100000 + Math.random()*900000);
}

// create shipment (authenticated or anonymous)
router.post('/create', async (req, res) => {
  // body may include base64 images/videos array or cloud URLs
  const {
    sender, receiver, pkg, notes, location, userToken
  } = req.body;

  // optional attach user if token provided in body (or use auth header)
  let userId = null;
  try {
    const headerToken = req.headers.authorization?.split(' ')[1] || userToken;
    if (headerToken) userId = jwt.verify(headerToken, JWT_SECRET).id;
  } catch {}

  let tracking;
  // ensure unique tracking
  for (let i=0;i<6;i++){
    tracking = genTracking();
    const exists = await Shipment.findOne({ tracking });
    if (!exists) break;
  }

  const s = await Shipment.create({
    tracking,
    userId: userId || null,
    sender: sender || {},
    receiver: receiver || {},
    package: {
      weightKg: pkg?.weightKg || 0,
      size: pkg?.size || {},
      type: pkg?.type || 'Box',
      photos: pkg?.photos || [],
      videos: pkg?.videos || []
    },
    location: location || {},
    notes: notes || '',
    status: 'Created',
    createdAt: new Date()
  });

  res.json({ ok: true, shipment: s });
});

// track by tracking number (public)
router.get('/track/:tracking', async (req, res) => {
  const t = req.params.tracking;
  const s = await Shipment.findOne({ tracking: t });
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});

// list shipments for user (protected)
router.get('/my', authMiddleware, async (req, res) => {
  const list = await Shipment.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(list);
});

// update status / admin (simple update)
router.post('/update/:tracking', async (req, res) => {
  const t = req.params.tracking;
  const data = req.body;
  const s = await Shipment.findOneAndUpdate({ tracking: t }, { ...data, updatedAt: new Date() }, { new: true });
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});

// upload base64 image/video to Cloudinary (client will call)
router.post('/upload', async (req, res) => {
  // expects { fileBase64: "data:image/..." }
  const { fileBase64 } = req.body;
  if (!fileBase64) return res.status(400).json({ message: 'No file' });
  try {
    const uploaded = await cloudinary.uploader.upload(fileBase64, { folder: 'shipex_files' });
    res.json({ url: uploaded.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;
