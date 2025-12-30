import React from 'react';

interface RatingCircleProps {
  rating?: number;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RatingCircle: React.FC<RatingCircleProps> = ({
  rating = 0,
  totalReviews = 0,
  size = 'md',
  showLabel = true,
}) => {
  const percentage = (rating / 5) * 100;
  
  const sizes = {
    sm: { circle: 20, stroke: 3, text: 'text-xs' },
    md: { circle: 32, stroke: 4, text: 'text-sm' },
    lg: { circle: 40, stroke: 5, text: 'text-base' },
  };
  
  const { circle, stroke, text } = sizes[size];
  const radius = (circle - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (rating >= 4.5) return '#10b981'; // green
    if (rating >= 3.5) return '#3b82f6'; // blue
    if (rating >= 2.5) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  if(totalReviews && totalReviews > 0)
  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: circle, height: circle }}>
        <svg className="transform -rotate-90" width={circle} height={circle}>
          <circle
            cx={circle / 2}
            cy={circle / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-gray-700"
          />
          <circle
            cx={circle / 2}
            cy={circle / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
      </div>
      {showLabel && totalReviews !== undefined && totalReviews > 0 && (
        <span className="text-xs text-gray-400">
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default RatingCircle;
