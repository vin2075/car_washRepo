require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// quick API root so GET /api won't 404 (fixes a lot of frontend dev noise)
app.get('/api', (req, res) => res.json({ success: true, message: 'API root. Use /api/bookings' }));

// NEW
app.get('/', (req, res) => {
  res.send('Car Wash Backend is running 🚀. Use /api for API endpoints.');
});


// Routes
app.use('/api/bookings', bookingRoutes);

// Error middleware (should be after routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
