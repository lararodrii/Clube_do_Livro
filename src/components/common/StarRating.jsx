import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 'md', // 'sm' | 'md' | 'lg'
  interactive = false,
  onChange = null,
  showValue = false,
  count = null
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const activeValue = hoverRating || rating;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(maxStars)].map((_, index) => {
          const starNumber = index + 1;
          const isFilled = activeValue >= starNumber;
          const isHalf = !isFilled && activeValue >= starNumber - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starNumber)}
              onMouseEnter={() => interactive && setHoverRating(starNumber)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`transition-transform ${
                interactive ? 'cursor-pointer hover:scale-125 focus:outline-none' : 'cursor-default'
              }`}
              aria-label={`${starNumber} estrela${starNumber > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} transition-colors ${
                  isFilled
                    ? 'text-gold-500 fill-gold-500'
                    : isHalf
                    ? 'text-gold-500 fill-gold-500/50'
                    : 'text-stone-300 stroke-1'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold text-ink-800 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {count !== null && (
        <span className="text-xs text-ink-500">
          ({count} {count === 1 ? 'resenha' : 'resenhas'})
        </span>
      )}
    </div>
  );
}
