// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');

const SERVICE_PRICE = {
  'Basic Wash': 800,
  'Deluxe Wash': 1300,
  'Full Detailing': 2000
};

const bookings = [
  // past, completed
  {
    customerName: "Rajat Sharma",
    carDetails: { make: "Maruti", model: "Swift", year: 2018, type: "hatchback" },
    serviceType: "Basic Wash",
    date: new Date("2025-09-01T09:00:00Z"),
    timeSlot: "09:00-09:45",
    duration: 45,
    price: SERVICE_PRICE['Basic Wash'],
    status: "Completed",
    rating: 5,
    addOns: ["Interior Cleaning"]
  },

  // future, confirmed
  {
    customerName: "Anika Roy",
    carDetails: { make: "Hyundai", model: "Creta", year: 2021, type: "suv" },
    serviceType: "Deluxe Wash",
    date: new Date("2025-10-05T11:00:00Z"),
    timeSlot: "11:00-12:30",
    duration: 90,
    price: SERVICE_PRICE['Deluxe Wash'],
    status: "Confirmed",
    addOns: ["Polishing"]
  },

  // future, pending luxury
  {
    customerName: "Vikram Patel",
    carDetails: { make: "BMW", model: "5 Series", year: 2022, type: "luxury" },
    serviceType: "Full Detailing",
    date: new Date("2025-09-25T14:00:00Z"),
    timeSlot: "14:00-17:00",
    duration: 180,
    price: SERVICE_PRICE['Full Detailing'],
    status: "Pending",
    addOns: ["Polishing","Interior Cleaning"]
  },

  // past cancelled
  {
    customerName: "Sneha Kumar",
    carDetails: { make: "Honda", model: "City", year: 2016, type: "sedan" },
    serviceType: "Basic Wash",
    date: new Date("2025-09-10T08:00:00Z"),
    timeSlot: "08:00-08:45",
    duration: 45,
    price: SERVICE_PRICE['Basic Wash'],
    status: "Cancelled",
    addOns: []
  },

  // present / today confirmed
  {
    customerName: "Arun Roy",
    carDetails: { make: "Tata", model: "Nexon", year: 2020, type: "suv" },
    serviceType: "Deluxe Wash",
    date: new Date(), // now-ish
    timeSlot: "16:00-17:30",
    duration: 90,
    price: SERVICE_PRICE['Deluxe Wash'],
    status: "Confirmed",
    rating: 4,
    addOns: ["Interior Cleaning"]
  },

  // new sample luxury completed
  {
    customerName: "Maya Singh",
    carDetails: { make: "Audi", model: "A4", year: 2019, type: "luxury" },
    serviceType: "Full Detailing",
    date: new Date("2025-09-30T10:00:00Z"),
    timeSlot: "10:00-13:00",
    duration: 180,
    price: SERVICE_PRICE['Full Detailing'],
    status: "Completed",
    rating: 5,
    addOns: ["Polishing"]
  }
];

async function runSeed() {
  try {
    const dbName = process.env.DB_NAME || 'carWashDB';
    await mongoose.connect(process.env.MONGO_URI, { dbName, useNewUrlParser: true, useUnifiedTopology: true });

    // Insert ignoring duplicates
    const res = await Booking.insertMany(bookings, { ordered: false });
    console.log(`Inserted ${res.length} bookings.`);
  } catch (err) {
    if (err && err.name === 'BulkWriteError') {
      console.warn('Some seed documents were duplicates or partially inserted:', err.message);
    } else {
      console.error('Seed error:', err);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runSeed();
