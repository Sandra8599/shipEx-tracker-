// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendMail(to, subject, html) {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP not configured — skipping email');
    return;
  }
  await transporter.sendMail({
    from: `"ShipEx" <no-reply@shipex.com>`,
    to,
    subject,
    html
  });
}
module.exports = { sendMail };
