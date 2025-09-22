import React from 'react';
import { Link } from 'react-router-dom';

export default function BookingCard({ booking, onDelete }) {
  const handleDeleteClick = () => {
    if (onDelete) onDelete(booking._id);
  };

  return (
    <div className="booking-card" style={{ padding: 16, borderRadius: 10 }}>
      <h3>{booking.customerName}</h3>
      <p>{booking.carDetails.make} {booking.carDetails.model} — {booking.carDetails.type}</p>
      <p>{booking.serviceType} • {new Date(booking.date).toLocaleDateString()} • {booking.timeSlot}</p>
      <p>₹{booking.price} • {booking.status}</p>
      <div className="card-actions" style={{ marginTop: 10 }}>
        <Link to={`/bookings/${booking._id}`} className="btn">Details</Link>
        <Link to={`/bookings/edit/${booking._id}`} className="btn" style={{ marginLeft: 8 }}>Edit</Link>
        <button onClick={handleDeleteClick} className="delete" style={{ marginLeft: 8 }}>Delete</button>
      </div>
    </div>
  );
}
