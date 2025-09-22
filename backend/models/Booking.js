const mongoose = require('mongoose');

const CarDetailsSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  type: { type: String, enum: ['sedan','suv','hatchback','luxury','other'], default: 'other' }
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, index: true },
  carDetails: { type: CarDetailsSchema, required: true },
  serviceType: { type: String, enum: ['Basic Wash','Deluxe Wash','Full Detailing'], required: true, index: true },
  date: { type: Date, required: true, index: true },
  timeSlot: { type: String, required: true },
  duration: { type: Number, default: 60 },
  price: { type: Number, required: true },
  status: { type: String, enum: ['Pending','Confirmed','Completed','Cancelled'], default: 'Pending', index: true },
  rating: { type: Number, min: 1, max: 5, default: null },
  addOns: [String],
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

BookingSchema.index({ customerName: 'text', 'carDetails.make': 'text', 'carDetails.model':'text' });

module.exports = mongoose.model('Booking', BookingSchema);
