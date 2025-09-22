// src/pages/AddEditBooking.jsx
import React, { useEffect, useState } from 'react';
import { fetchBooking, createBooking, updateBooking } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';

const SERVICE_MAP = [
  { label: 'Basic Wash', price: 800, defaultDuration: 45 },
  { label: 'Deluxe Wash', price: 1300, defaultDuration: 90 },
  { label: 'Full Detailing', price: 2000, defaultDuration: 180 }
];

const ADD_ONS = [
  { label: 'Interior Cleaning', price: 300 },
  { label: 'Polishing', price: 500 }
];

const CAR_TYPES = ['sedan', 'suv', 'hatchback', 'luxury', 'other'];

// generate 30-minute options from 07:00 to 20:00 in 12-hour format
function generateStartTimes() {
  const res = [];
  const startHour = 7;
  const endHour = 20;
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      const d = new Date(0,0,0,h,m);
      const hh = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;
      const mm = String(d.getMinutes()).padStart(2,'0');
      const ampm = d.getHours() < 12 ? 'AM' : 'PM';
      res.push(`${String(hh).padStart(2,'0')}:${mm} ${ampm}`);
    }
  }
  return res;
}

function parseTime12ToMinutes(t12) {
  // "09:30 AM" => minutes since 00:00
  const [time, ampm] = t12.split(' ');
  const [hh, mm] = time.split(':').map(Number);
  let h = hh % 12;
  if (ampm === 'PM') h += 12;
  return h * 60 + mm;
}

function minutesToTime12(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const hh = (h % 12) === 0 ? 12 : (h % 12);
  return `${String(hh).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ampm}`;
}

const startTimes = generateStartTimes();

function computePrice(serviceLabel, selectedAddOns) {
  const svc = SERVICE_MAP.find(s => s.label === serviceLabel);
  const base = svc ? svc.price : 0;
  const addonsTotal = (selectedAddOns || []).reduce((sum, a) => {
    const found = ADD_ONS.find(x => x.label === a);
    return sum + (found ? found.price : 0);
  }, 0);
  return base + addonsTotal;
}

export default function AddEditBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState({
    customerName: '',
    carDetails: { make: '', model: '', year: '', type: '' },
    serviceType: '',
    date: '',
    timeSlot: '',
    duration: '',
    price: '',
    addOns: [],
    rating: 0,
    status: 'Pending'
  });

  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [durationDisabled, setDurationDisabled] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBooking(id).then(data => {
        if (!data) return;
        const dateStr = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
        setBooking(prev => ({
          ...prev,
          ...data,
          date: dateStr,
          duration: data.duration,
          price: data.price,
          addOns: data.addOns || [],
          carDetails: data.carDetails || { make: '', model: '', year: '', type: '' }
        }));
        if (data.timeSlot) {
          const start = data.timeSlot.split('-')[0].trim();
          setSelectedStartTime(start);
          setDurationDisabled(false);
        }
      }).catch(console.error);
    }
  }, [id]);

  // when serviceType changes auto set price & duration
  const handleServiceChange = (value) => {
    const svc = SERVICE_MAP.find(s => s.label === value);
    const newDuration = svc ? svc.defaultDuration : booking.duration;
    const newPrice = computePrice(value, booking.addOns);

    setBooking(prev => ({
      ...prev,
      serviceType: value,
      duration: prev.duration ? prev.duration : newDuration,
      price: newPrice
    }));
  };

  // when start time picked: enable duration, build timeSlot
  const handleStartTime = (t12) => {
    setSelectedStartTime(t12);
    setDurationDisabled(false);

    const dur = Number(booking.duration) || (SERVICE_MAP.find(s => s.label === booking.serviceType)?.defaultDuration || 60);
    const startMin = parseTime12ToMinutes(t12);
    const endMin = startMin + Number(dur);
    const endT = minutesToTime12(endMin);

    setBooking(prev => ({
      ...prev,
      timeSlot: `${t12} - ${endT}`,
      duration: Number(dur)
    }));
  };

  // when duration changed by user, update timeSlot end
  const handleDurationChange = (durVal) => {
    const dur = Number(durVal) || 0;
    setBooking(prev => {
      const startT = selectedStartTime;
      let newTimeSlot = prev.timeSlot;
      if (startT) {
        const startMin = parseTime12ToMinutes(startT);
        const endMin = startMin + dur;
        const endT = minutesToTime12(endMin);
        newTimeSlot = `${startT} - ${endT}`;
      }
      return { ...prev, duration: dur, timeSlot: newTimeSlot };
    });
  };

  // toggle add-on and recompute price instantly
  const handleAddOnToggle = (addOnLabel, checked) => {
    const next = checked ? [...booking.addOns, addOnLabel] : booking.addOns.filter(a => a !== addOnLabel);
    const newPrice = computePrice(booking.serviceType, next);
    setBooking(prev => ({ ...prev, addOns: next, price: newPrice }));
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('carDetails.')) {
      const key = name.split('.')[1];
      setBooking(prev => ({ ...prev, carDetails: { ...prev.carDetails, [key]: value } }));
      return;
    }

    if (name === 'serviceType') {
      handleServiceChange(value);
      return;
    }

    if (name === 'startTime') {
      handleStartTime(value);
      return;
    }

    if (name === 'duration') {
      handleDurationChange(value);
      return;
    }

    // generic fields
    setBooking(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: booking.customerName,
        carDetails: {
          make: booking.carDetails.make,
          model: booking.carDetails.model,
          year: booking.carDetails.year ? Number(booking.carDetails.year) : undefined,
          type: booking.carDetails.type || 'other'
        },
        serviceType: booking.serviceType,
        date: booking.date,
        timeSlot: booking.timeSlot,
        duration: Number(booking.duration),
        // price is optional (server will compute authoritative final price) — still send it for clarity
        price: computePrice(booking.serviceType, booking.addOns),
        addOns: booking.addOns || [],
        rating: booking.rating || undefined,
        status: booking.status || 'Pending'
      };

      if (id) await updateBooking(id, payload);
      else await createBooking(payload);

      navigate('/');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        alert('Validation errors: ' + JSON.stringify(err.response.data.errors));
      } else {
        alert('Save failed');
      }
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2>{id ? 'Edit' : 'Add'} Booking</h2>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input name="customerName" placeholder="Customer Name" value={booking.customerName} onChange={handleInput} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input name="carDetails.make" placeholder="Car Make" value={booking.carDetails.make} onChange={handleInput} required />
          <input name="carDetails.model" placeholder="Car Model" value={booking.carDetails.model} onChange={handleInput} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <select name="carDetails.type" value={booking.carDetails.type} onChange={handleInput}>
            <option value="">Car Type (choose)</option>
            {CAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input name="carDetails.year" placeholder="Year (optional)" value={booking.carDetails.year || ''} onChange={handleInput} />
        </div>

        <label>Service Type</label>
        <select name="serviceType" value={booking.serviceType} onChange={handleInput} required>
          <option value="">Select service</option>
          {SERVICE_MAP.map(s => <option key={s.label} value={s.label}>{s.label} — ₹{s.price}</option>)}
        </select>

        <label>Date</label>
        <input type="date" name="date" value={booking.date} onChange={handleInput} required />

        <label>Start time (pick one)</label>
        <select name="startTime" value={selectedStartTime} onChange={handleInput} required>
          <option value="">Choose start time</option>
          {startTimes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label>Duration (minutes)</label>
        <input
          type="number"
          name="duration"
          value={booking.duration || ''}
          onChange={handleInput}
          disabled={durationDisabled}
          min={10}
          step={5}
          required
        />

        <label>Time slot</label>
        <input name="timeSlot" value={booking.timeSlot} readOnly />

        <label>Price (auto)</label>
        <input name="price" value={booking.price || ''} readOnly />

        <label>Add-ons</label>
        <div>
          {ADD_ONS.map(a => (
            <label key={a.label} style={{ marginRight: 12 }}>
              <input
                name="addOn"
                type="checkbox"
                value={a.label}
                checked={booking.addOns.includes(a.label)}
                onChange={e => handleAddOnToggle(a.label, e.target.checked)}
              /> {a.label} — ₹{a.price}
            </label>
          ))}
        </div>

        <label>Rating</label>
        <StarRating value={booking.rating} editable={true} onChange={v => setBooking(prev => ({ ...prev, rating: v }))} />

        <div>
          <button type="submit" style={{ padding: '8px 16px' }}>{id ? 'Update' : 'Add'} Booking</button>
        </div>
      </form>
    </div>
  );
}
