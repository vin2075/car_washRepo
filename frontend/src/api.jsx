// src/api.js
import axios from 'axios';

/*const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});*/

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api'
      : 'https://car-washrepo-1.onrender.com/api'),
});

export const fetchBookings = async (params = {}) => {
  const res = await API.get('/bookings', { params });
  return res.data?.success ? { data: res.data.data, meta: res.data.meta || {} } : { data: [], meta: {} };
};

export const fetchBooking = async (id) => {
  const res = await API.get(`/bookings/${id}`);
  return res.data?.success ? res.data.data : null;
};

export const createBooking = async (payload) => {
  const res = await API.post('/bookings', payload);
  if (!res.data?.success) throw new Error('Create booking failed');
  return res.data.data;
};

export const updateBooking = async (id, payload) => {
  const res = await API.put(`/bookings/${id}`, payload);
  if (!res.data?.success) throw new Error('Update booking failed');
  return res.data.data;
};

export const deleteBooking = async (id, hard = false) => {
  const res = await API.delete(`/bookings/${id}`, { params: { hard } });
  return res.data;
};

export const searchBookings = async (q) => {
  const res = await API.get('/bookings/search', { params: { q } });
  return res.data?.success ? res.data.data : [];
};

export const fetchBookingQR = async (id) => {
  const resp = await API.get(`/bookings/${id}/qr`, { responseType: 'arraybuffer' });
  const blob = new Blob([resp.data], { type: 'image/png' });
  return URL.createObjectURL(blob);
};

export default API;
