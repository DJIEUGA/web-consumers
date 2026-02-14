import React from 'react';
import { FiStar } from 'react-icons/fi';

interface Props {
  rating: number;
  max?: number;
}

const RatingStars: React.FC<Props> = ({ rating, max = 5 }) => {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    const filled = i <= rating;
    stars.push(
      <FiStar key={i} className={`star ${filled ? 'filled' : ''}`} style={{ color: filled ? '#FFD700' : '#ddd' }} />
    );
  }
  return <div className="rating-stars">{stars}</div>;
};

export default RatingStars;
