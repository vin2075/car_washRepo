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
const validateRequest = require('../middlewares/validateRequest');

router.get('/', listBookings);
router.get('/search', searchBookings);
router.get('/:id/qr', getBookingQRCode);
router.get('/:id', getBookingById);

router.post('/', createBookingValidator, validateRequest, createBooking);
router.put('/:id', updateBookingValidator, validateRequest, updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
