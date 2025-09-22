import React, { useState } from 'react';

const AdminSwitch = ({ onChange }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleToggle = () => {
    if (!isAdmin) {
      const code = prompt('Enter admin code:');
      if (code !== 'ADMIN123') return alert('Invalid code');
    }
    setIsAdmin(!isAdmin);
    if (onChange) onChange(!isAdmin);
  };

  return (
    <button onClick={handleToggle} className="admin-switch" style={{ padding: '6px 10px', borderRadius: 8 }}>
      {isAdmin ? 'Admin View' : 'Customer View'}
    </button>
  );
};

export default AdminSwitch;
