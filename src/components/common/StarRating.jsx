import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 'md', // 'sm' | 'md' | 'lg'
  interactive = false,
  onChange = null,
  onHoverChange = null,
  showValue = false,
  count = null
}) {
  const [internalHover, setInternalHover] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7 sm:w-8 sm:h-8'
  };

  const activeValue = internalHover || rating;

  return (
    <div 
      className="inline-flex items-center gap-1.5"
      onMouseLeave={() => {
        if (interactive) {
          setInternalHover(0);
          if (onHoverChange) onHoverChange(0);
        }
      }}
    >
      <div className="flex items-center gap-1">
        {[...Array(maxStars)].map((_, index) => {
          const starNumber = index + 1;
          const isFilled = activeValue >= starNumber;
          const isHalf = !isFilled && activeValue >= starNumber - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => {
                if (interactive && onChange) {
                  onChange(starNumber);
                }
              }}
              onMouseEnter={() => {
                if (interactive) {
                  setInternalHover(starNumber);
                  if (onHoverChange) onHoverChange(starNumber);
                }
              }}
              className={`transition-transform duration-150 p-0.5 focus:outline-none ${
                interactive 
                  ? 'cursor-pointer hover:scale-125 active:scale-110' 
                  : 'cursor-default'
              }`}
              aria-label={`${starNumber} estrela${starNumber > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSizes[size] || starSizes.md} transition-colors duration-150 ${
                  isFilled
                    ? 'text-[#F59E0B] fill-[#F59E0B] drop-shadow-[0_1px_2px_rgba(245,158,11,0.5)]'
                    : isHalf
                    ? 'text-[#F59E0B] fill-[#F59E0B]/50'
                    : 'text-stone-300 stroke-1 fill-transparent hover:text-[#F59E0B]/60'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-mono font-bold text-[#141414] ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}

      {count !== null && (
        <span className="text-xs text-[#57534E] font-reading">
          ({count} {count === 1 ? 'resenha' : 'resenhas'})
        </span>
      )}
    </div>
  );
}

