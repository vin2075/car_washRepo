import React, { useEffect, useState } from 'react';
import { fetchBooking, fetchBookingQR } from '../api';
import { useParams } from 'react-router-dom';

const BookingDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    fetchBooking(id).then(data => setBooking(data)).catch(console.error);
    fetchBookingQR(id).then(url => setQrUrl(url)).catch(() => {});
    return () => { if (qrUrl) URL.revokeObjectURL(qrUrl); };
    // eslint-disable-next-line
  }, [id]);

  if (!booking) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1>{booking.customerName}</h1>
      <p>{booking.carDetails.make} {booking.carDetails.model} — {booking.carDetails.type}</p>
      <p>{booking.serviceType} • {new Date(booking.date).toLocaleDateString()} • {booking.timeSlot}</p>
      <p>₹{booking.price} • {booking.status}</p>
      {qrUrl && <img src={qrUrl} alt="Booking QR" style={{ maxWidth: 220 }} />}
    </div>
  );
};

export default BookingDetail;
