import React from 'react';

const StarRating = ({ value = 0, onChange, editable = false }) => {
  const stars = [1,2,3,4,5];
  return (
    <div className={`star-rating ${editable ? 'editable' : ''}`} role="img" aria-label={`Rating ${value} out of 5`}>
      {stars.map(n => (
        <span
          key={n}
          className={`star ${n <= value ? 'filled' : 'empty'}`}
          onClick={() => editable && onChange && onChange(n)}
          onKeyDown={(e) => { if (editable && (e.key === 'Enter' || e.key === ' ')) onChange && onChange(n); }}
          tabIndex={editable ? 0 : -1}
          style={{ cursor: editable ? 'pointer' : 'default', fontSize: '18px', marginRight: 4 }}
        >
          { n <= value ? '★' : '☆' }
        </span>
      ))}
    </div>
  );
};

export default StarRating;
