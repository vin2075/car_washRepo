import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  // timeout: 5000,
});

// Backend returns { success:true, data:..., meta:? }
export const fetchBookings = async (params = {}) => {
  const res = await API.get('/bookings', { params });
  return res.data && res.data.success ? { data: res.data.data, meta: res.data.meta || {} } : { data: [], meta: {} };
};

export const fetchBooking = async (id) => {
  const res = await API.get(`/bookings/${id}`);
  return res.data && res.data.success ? res.data.data : null;
};

export const createBooking = async (payload) => {
  const res = await API.post('/bookings', payload);
  return res.data && res.data.success ? res.data.data : null;
};

export const updateBooking = async (id, payload) => {
  const res = await API.put(`/bookings/${id}`, payload);
  return res.data && res.data.success ? res.data.data : null;
};

export const deleteBooking = async (id, hard = false) => {
  const res = await API.delete(`/bookings/${id}`, { params: { hard } });
  return res.data;
};

export const searchBookings = async (q) => {
  const res = await API.get('/bookings/search', { params: { q } });
  return res.data && res.data.success ? res.data.data : [];
};

export const fetchBookingQR = async (id) => {
  const resp = await API.get(`/bookings/${id}/qr`, { responseType: 'arraybuffer' });
  const blob = new Blob([resp.data], { type: 'image/png' });
  return URL.createObjectURL(blob);
};

export default API;
