// backend/controllers/bookingController.js
const Booking = require('../models/Booking');
const { generateQRCodeDataURL } = require('../utils/qrGenerator');

// price mapping according to your requirement
const SERVICE_PRICE = {
  'Basic Wash': 800,
  'Deluxe Wash': 1300,
  'Full Detailing': 2000
};

// add-on fixed fees (server-side authoritative)
const ADD_ON_PRICE = {
  'Interior Cleaning': 300,
  'Polishing': 500
};

// --- helper to sanitize incoming payloads (kept from your earlier snippet) ---
function sanitizePayload(body) {
  const payload = { ...body };

  if (payload.rating === 0 || payload.rating === '0' || payload.rating === '' ) {
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

// --- controllers ---
async function listBookings(req, res, next) {
  try {
    const {
      page = 1, limit = 8, serviceType, carType, status, startDate, endDate,
      sortBy, sortDir = 'desc', addOns, timeFrom, timeTo
    } = req.query;

    const filter = { deleted: false };
    if (serviceType) filter.serviceType = serviceType;
    if (carType) filter['carDetails.type'] = carType;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (addOns) {
      const arr = String(addOns).split(',').map(s => s.trim()).filter(Boolean);
      if (arr.length) filter.addOns = { $all: arr };
    }

    const allowedSort = ['createdAt', 'date', 'price', 'duration', 'status'];
    const sortOptions = {};
    if (sortBy && allowedSort.includes(sortBy)) sortOptions[sortBy] = sortDir === 'asc' ? 1 : -1;
    else sortOptions.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const items = await Booking.find(filter).sort(sortOptions).skip(skip).limit(Number(limit));
    const total = await Booking.countDocuments(filter);

    // optional time slot filter (timeFrom/timeTo are "HH:MM")
    let finalItems = items;
    if (timeFrom || timeTo) {
      const from = timeFrom || '00:00';
      const to = timeTo || '23:59';
      const inRange = (ts) => {
        if (!ts || typeof ts !== 'string') return false;
        const start = ts.split('-')[0].trim();
        return start >= from && start <= to;
      };
      finalItems = items.filter(b => inRange(b.timeSlot));
    }

    return res.json({
      success: true,
      data: finalItems,
      meta: { total, page: Number(page), limit: Number(limit) }
    });
  } catch (err) { next(err); }
}

async function getBookingById(req, res, next) {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b || b.deleted) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: b });
  } catch (err) { next(err); }
}

async function createBooking(req, res, next) {
  try {
    const payload = sanitizePayload(req.body);

    // Enforce price server-side: base service price + add-on fees
    if (payload.serviceType) {
      payload.price = computeTotalPrice(payload.serviceType, payload.addOns);
    } else {
      // fallback: if serviceType missing, keep provided price or zero
      payload.price = payload.price || 0;
    }

    const booking = new Booking(payload);
    await booking.save();
    res.status(201).json({ success:true, data: booking });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const formatted = Object.keys(err.errors).map(k => ({ field: k, message: err.errors[k].message }));
      return res.status(400).json({ success: false, errors: formatted });
    }
    next(err);
  }
}

async function updateBooking(req, res, next) {
  try {
    const payload = sanitizePayload(req.body);

    // If updating serviceType/addOns, recompute price server-side
    if (payload.serviceType) {
      payload.price = computeTotalPrice(payload.serviceType, payload.addOns);
    } else if (payload.addOns && payload.addOns.length) {
      // if only addOns changed, attempt recompute using current serviceType from DB
      const existing = await Booking.findById(req.params.id).select('serviceType');
      if (existing && existing.serviceType) {
        payload.price = computeTotalPrice(existing.serviceType, payload.addOns);
      }
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: updated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const formatted = Object.keys(err.errors).map(k => ({ field: k, message: err.errors[k].message }));
      return res.status(400).json({ success: false, errors: formatted });
    }
    next(err);
  }
}

async function deleteBooking(req, res, next) {
  try {
    const { hard } = req.query;
    if (hard === 'true') {
      const removed = await Booking.findByIdAndDelete(req.params.id);
      if (!removed) return res.status(404).json({ success:false, message:'Not found' });
      return res.json({ success:true, message:'Deleted' });
    } else {
      const soft = await Booking.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
      if (!soft) return res.status(404).json({ success:false, message:'Not found' });
      return res.json({ success:true, data: soft });
    }
  } catch (err) { next(err); }
}

async function searchBookings(req, res, next) {
  try {
    const q = req.query.q || '';
    if (!q) return res.json({ success:true, data: [] });
    const items = await Booking.find({ $text: { $search: q }, deleted: false }).limit(50);
    res.json({ success:true, data: items });
  } catch (err) { next(err); }
}

async function getBookingQRCode(req, res, next) {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b || b.deleted) return res.status(404).json({ success: false, message: 'Not found' });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const bookingUrl = `${clientUrl}/bookings/${b._id}`;

    const dataUrl = await generateQRCodeDataURL(bookingUrl);
    const base64 = dataUrl.split(',')[1];
    const imgBuffer = Buffer.from(base64, 'base64');

    res.set('Content-Type', 'image/png');
    return res.send(imgBuffer);
  } catch (err) { next(err); }
}

// export everything as an object so require(...) destructuring works
module.exports = {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  searchBookings,
  getBookingQRCode
};
