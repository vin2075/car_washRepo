// backend/validators/bookingValidators.js
const { body } = require('express-validator');

const createBookingValidator = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  // Do not require carDetails to be an object (validate its fields individually)
  body('carDetails.make').trim().notEmpty().withMessage('Car make is required'),
  body('carDetails.model').trim().notEmpty().withMessage('Car model is required'),
  body('carDetails.year').optional().isInt({ min: 1900 }).withMessage('Invalid year'),
  body('carDetails.type').optional().isIn(['sedan','suv','hatchback','luxury','other']).withMessage('Invalid car type'),

  body('serviceType').notEmpty().isIn(['Basic Wash','Deluxe Wash','Full Detailing']).withMessage('Invalid serviceType'),

  // Accept dates in ISO format — will be converted by .toDate()
  body('date').notEmpty().withMessage('Date is required').isISO8601().toDate(),

  body('timeSlot').notEmpty().withMessage('Time slot is required'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  // Make price optional here because backend enforces price from serviceType
  body('price').optional().isNumeric().withMessage('Price must be a number'),

  body('status').optional().isIn(['Pending','Confirmed','Completed','Cancelled']).withMessage('Invalid status'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating between 1 and 5'),
  body('addOns').optional().isArray().withMessage('addOns must be an array'),
];

const updateBookingValidator = [
  // For update allow optional fields but validate types
  body('customerName').optional().trim().notEmpty().withMessage('Customer name required'),
  body('carDetails').optional(), // allow object if present; specific nested validators below remain optional
  body('carDetails.make').optional().trim().notEmpty().withMessage('Car make required'),
  body('carDetails.model').optional().trim().notEmpty().withMessage('Car model required'),
  body('serviceType').optional().isIn(['Basic Wash','Deluxe Wash','Full Detailing']).withMessage('Invalid serviceType'),
  body('date').optional().isISO8601().toDate(),
  body('timeSlot').optional().notEmpty().withMessage('Time slot required'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('status').optional().isIn(['Pending','Confirmed','Completed','Cancelled']).withMessage('Invalid status'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating between 1 and 5'),
  body('addOns').optional().isArray().withMessage('addOns must be an array')
];

module.exports = { createBookingValidator, updateBookingValidator };
