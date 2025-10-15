// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const shipmentsRoutes = require('./routes/shipments');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // allow base64 uploads
app.use(bodyParser.urlencoded({ extended: true }));

// API
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentsRoutes);

// serve frontend (public) if present
app.use('/', express.static(path.join(__dirname, '..', 'public')));

// start
connectDB().then(() => {
  app.listen(PORT, () => console.log('Server running on', PORT));
});
