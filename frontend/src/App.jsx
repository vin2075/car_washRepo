// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddEditBooking from './pages/AddEditBooking';
import BookingDetail from './pages/BookingDetail';
import AboutUs from './pages/About';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <div className="logo">CarWash</div>
        <nav>
          <Link to="/" style={{ marginRight: 12 }}>Home</Link>
          <Link to="/about" style={{ marginRight: 12 }}>About</Link>
        </nav>
      </header>

      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/bookings/add" element={<AddEditBooking />} />
          <Route path="/bookings/edit/:id" element={<AddEditBooking />} />
          <Route path="/bookings/:id" element={<BookingDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
