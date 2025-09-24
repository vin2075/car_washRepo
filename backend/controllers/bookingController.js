// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const { generateQRCodeDataURL } = require('../utils/qrGenerator');

const SERVICE_PRICE = {
  'Basic Wash': 800,
  'Deluxe Wash': 1300,
  'Full Detailing': 2000
};

const ADD_ON_PRICE = {
  'Interior Cleaning': 300,
  'Polishing': 500
};

function sanitizePayload(body) {
  const payload = { ...body };

  if (payload.rating === 0 || payload.rating === '0' || payload.rating === '') {
    delete payload.rating;
  }

  if (payload.date && typeof payload.date === 'string') {
    const d = new Date(payload.date);
    if (!isNaN(d)) payload.date = d;
  }

  if (payload.addOns && !Array.isArray(payload.addOns) && typeof payload.addOns === 'string') {
    payload.addOns = payload.addOns.split(',').map(s => s.trim()).filter(Boolean);
  }

  return payload;
}

function computeTotalPrice(serviceType, addOns) {
  const base = SERVICE_PRICE[serviceType] || 0;
  const addOnTotal = (Array.isArray(addOns) ? addOns : [])
    .reduce((sum, a) => sum + (ADD_ON_PRICE[a] || 0), 0);
  return base + addOnTotal;
}

async function createBooking(req, res, next) {
  try {
    console.log('📩 Incoming booking payload:', req.body);
    const payload = sanitizePayload(req.body);

    if (payload.serviceType) {
      payload.price = computeTotalPrice(payload.serviceType, payload.addOns);
    } else {
      payload.price = payload.price || 0;
    }

    const booking = new Booking(payload);
    await booking.save();
    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('❌ Booking creation failed:', err);
    if (err.name === 'ValidationError') {
      const formatted = Object.keys(err.errors).map(k => ({ field: k, message: err.errors[k].message }));
      return res.status(400).json({ success: false, errors: formatted });
    }
    next(err);
  }
}

module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  searchBookings,
  getBookingQRCode
};
