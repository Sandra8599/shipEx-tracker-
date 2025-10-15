// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const { sendMail } = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const u = await User.create({ name, email, passwordHash: hash });
  const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: u._id, email: u.email, name: u.name }});
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ email });
  if (!u) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: u._id, email: u.email, name: u.name }});
});

// forgot password -> send reset email
router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  const u = await User.findOne({ email });
  if (!u) return res.json({ ok: true }); // don't reveal
  const token = crypto.randomBytes(20).toString('hex');
  u.resetToken = token;
  u.resetExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await u.save();
  const url = `${process.env.FRONTEND_URL}/reset.html?token=${token}&email=${encodeURIComponent(email)}`;
  const html = `<p>Reset your ShipEx password <a href="${url}">Reset password</a></p>`;
  await sendMail(email, 'Reset your password', html);
  res.json({ ok: true });
});

// reset password
router.post('/reset', async (req, res) => {
  const { email, token, newPassword } = req.body;
  const u = await User.findOne({ email, resetToken: token, resetExpires: { $gt: Date.now() }});
  if (!u) return res.status(400).json({ message: 'Invalid or expired token' });
  u.passwordHash = await bcrypt.hash(newPassword, 10);
  u.resetToken = undefined; u.resetExpires = undefined;
  await u.save();
  res.json({ ok: true });
});

module.exports = router;
