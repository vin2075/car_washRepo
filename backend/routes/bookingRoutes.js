// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();

const {
  listBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  searchBookings,
  getBookingQRCode
} = require('../controllers/bookingController');

const { createBookingValidator, updateBookingValidator } = require('../validators/bookingValidators');
const validateRequest = require('../middlewares/validateRequest'); // your validator middleware

// Routes
router.get('/', listBookings);            // GET all bookings
router.get('/search', searchBookings);    // search bookings
router.get('/:id/qr', getBookingQRCode);  // get QR for booking
router.get('/:id', getBookingById);       // get booking by ID

// Use validators + validateRequest middleware before controller
router.post('/', createBookingValidator, validateRequest, createBooking);          // create booking
router.put('/:id', updateBookingValidator, validateRequest, updateBooking);        // update booking
router.delete('/:id', deleteBooking);     // delete booking

module.exports = router;
