// src/components/CarIcon.jsx
import React from 'react';
import { FaCarSide } from 'react-icons/fa';

const CarIcon = ({ type }) => (
  <span className="car-icon">
    <FaCarSide style={{ marginRight: 5 }} /> {type || 'Car'}
  </span>
);

export default CarIcon;
