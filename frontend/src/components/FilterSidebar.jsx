import React from 'react';

function FilterSidebar({ filter, setFilter }) {
  return (
    <select value={filter} onChange={e => setFilter(e.target.value)}>
      <option value="">All Status</option>
      <option value="Pending">Pending</option>
      <option value="Confirmed">Confirmed</option>
      <option value="Completed">Completed</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  );
}

export default FilterSidebar;
