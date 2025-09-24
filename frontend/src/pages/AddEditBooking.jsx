import React, { useState, useEffect } from 'react';
import { fetchBooking, createBooking, updateBooking } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function AddEditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState({
    customerName: '',
    carDetails: { make: '', model: '', year: '', type: '' },
    serviceType: '',
    date: '',
    timeSlot: '',
    duration: 60,
    price: 0,
    status: 'Pending',
    rating: 0,
    addOns: []
  });

  useEffect(() => {
    if (id) {
      fetchBooking(id).then(data => {
        if (!data) return;
        const dateStr = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
        setBooking(prev => ({ ...prev, ...data, date: dateStr }));
      }).catch(console.error);
    }
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('carDetails.')) {
      const key = name.split('.')[1];
      setBooking(prev => ({ ...prev, carDetails: { ...prev.carDetails, [key]: value } }));
    } else {
      setBooking(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { ...booking, date: booking.date };
      if (id) await updateBooking(id, payload);
      else await createBooking(payload);
      navigate('/');
    } catch (err) {
      console.error('❌ Save failed:', err.message);
      alert('Save failed. Check console for details.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <input name="customerName" placeholder="Customer Name" value={booking.customerName} onChange={handleChange} required />
      <input name="carDetails.make" placeholder="Car Make" value={booking.carDetails.make} onChange={handleChange} required />
      <input name="carDetails.model" placeholder="Car Model" value={booking.carDetails.model} onChange={handleChange} required />
      <input name="carDetails.type" placeholder="Car Type" value={booking.carDetails.type} onChange={handleChange} />
      <input name="serviceType" placeholder="Service Type" value={booking.serviceType} onChange={handleChange} required />
      <input type="date" name="date" value={booking.date} onChange={handleChange} required />
      <input name="timeSlot" placeholder="Time Slot" value={booking.timeSlot} onChange={handleChange} required />
      <input type="number" name="duration" placeholder="Duration (min)" value={booking.duration} onChange={handleChange} required />
      <input type="number" name="price" placeholder="Price" value={booking.price} onChange={handleChange} required />
      <select name="status" value={booking.status} onChange={handleChange}>
        <option>Pending</option>
        <option>Confirmed</option>
        <option>Completed</option>
        <option>Cancelled</option>
      </select>
      <button type="submit">{id ? 'Update' : 'Add'} Booking</button>
    </form>
  );
}
