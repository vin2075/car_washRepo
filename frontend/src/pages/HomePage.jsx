// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import BookingCard from '../components/BookingCard';
import { fetchBookings, deleteBooking } from '../api';
import { Link } from 'react-router-dom';

const SERVICE_OPTIONS = ['', 'Basic Wash', 'Deluxe Wash', 'Full Detailing'];
const ADD_ONS = ['', 'Interior Cleaning', 'Polishing'];

const HomePage = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [addOnFilter, setAddOnFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [timeFrom, setTimeFrom] = useState('');
  const [timeTo, setTimeTo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, [search, statusFilter, serviceFilter, addOnFilter, sortBy, sortDir, timeFrom, timeTo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      if (statusFilter) params.status = statusFilter;
      if (serviceFilter) params.serviceType = serviceFilter;
      if (addOnFilter) params.addOns = addOnFilter;
      if (sortBy) params.sortBy = sortBy;
      if (sortDir) params.sortDir = sortDir;
      if (timeFrom) params.timeFrom = timeFrom;
      if (timeTo) params.timeTo = timeTo;
      const res = await fetchBookings(params);
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // handleDelete: confirm, call API, remove locally on success
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await deleteBooking(id); // soft delete by default
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="homepage">
      <div className="home-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Car Wash Bookings</h1>
        <Link to="/bookings/add" className="btn-book">Book Appointment</Link>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ width: 260 }}>
          <input
            className="search-bar"
            placeholder="Search by name or car"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 12 }}
          />

          <div className="filter-card">
            <h4>Filters</h4>
            <label>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: '100%', marginBottom: 8 }}>
              <option value=''>All</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <label>Service</label>
            <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} style={{ width: '100%', marginBottom: 8 }}>
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Services'}</option>)}
            </select>

            <label>Add-on</label>
            <select value={addOnFilter} onChange={e => setAddOnFilter(e.target.value)} style={{ width: '100%', marginBottom: 8 }}>
              <option value=''>All</option>
              <option>Interior Cleaning</option>
              <option>Polishing</option>
            </select>

            <label>Time (start between)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} />
              <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} />
            </div>

            <hr style={{ margin: '12px 0' }} />

            <label>Sort by</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%', marginBottom: 8 }}>
              <option value="date">Newest</option>
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="status">Status</option>
            </select>

            <select value={sortDir} onChange={e => setSortDir(e.target.value)} style={{ width: '100%' }}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {loading ? <p>Loading...</p> :
            bookings.length === 0 ? <p>No bookings found</p> :
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
                {bookings.map(b => (
                  <BookingCard key={b._1d || b._id} booking={b} onDelete={handleDelete} />
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
};

export default HomePage;
