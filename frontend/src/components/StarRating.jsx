import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({
  rating = 0,
  maxRating = 5,
  onRating = null,
  size = "medium",
  readonly = false,
  showValue = false,
  showCount = false,
  count = 0,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [tempRating, setTempRating] = useState(rating);

  const sizes = {
    small: {
      star: "text-xs sm:text-sm",
      icon: "w-3 h-3 sm:w-4 sm:h-4",
      text: "text-xs",
      spacing: "gap-0.5 sm:gap-1",
      touch: "p-1",
    },
    medium: {
      star: "text-sm sm:text-base",
      icon: "w-4 h-4 sm:w-5 sm:h-5",
      text: "text-sm",
      spacing: "gap-1",
      touch: "p-1 sm:p-1.5",
    },
    large: {
      star: "text-base sm:text-lg",
      icon: "w-5 h-5 sm:w-6 sm:h-6",
      text: "text-base",
      spacing: "gap-1 sm:gap-1.5",
      touch: "p-1.5 sm:p-2",
    },
  };

  const currentSize = sizes[size];

  const handleStarClick = (clickedRating) => {
    if (readonly || !onRating) return;

    const newRating = clickedRating === tempRating ? 0 : clickedRating;
    setTempRating(newRating);
    onRating(newRating);
  };

  const handleStarHover = (hoveredRating) => {
    if (readonly) return;
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const getStarIcon = (index) => {
    const currentRating = readonly ? rating : hoverRating || tempRating;
    const starValue = index + 1;

    if (currentRating >= starValue) {
      return <FaStar className={`${currentSize.icon} text-yellow-400`} />;
    } else if (currentRating >= starValue - 0.5) {
      return (
        <FaStarHalfAlt className={`${currentSize.icon} text-yellow-400`} />
      );
    } else {
      return <FaRegStar className={`${currentSize.icon} text-gray-300`} />;
    }
  };

  const formatRating = (value) => {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  const formatCount = (value) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toString();
  };

  return (
    <div className={`flex items-center ${currentSize.spacing} ${className}`}>
      {/* Stars */}
      <div
        className={`flex items-center ${currentSize.spacing}`}
        onMouseLeave={handleMouseLeave}
        role={readonly ? "img" : "radiogroup"}
        aria-label={`Rating: ${formatRating(rating)} out of ${maxRating} stars`}
      >
        {Array.from({ length: maxRating }, (_, index) => (
          <button
            key={index}
            type="button"
            className={`
              ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
              ${currentSize.touch}
              transition-all duration-150 ease-in-out
              rounded focus:outline-none focus:ring-2 focus:ring-orange-300
              ${readonly ? "" : "active:scale-95"}
            `}
            onClick={() => handleStarClick(index + 1)}
            onMouseEnter={() => handleStarHover(index + 1)}
            onFocus={() => handleStarHover(index + 1)}
            disabled={readonly}
            aria-label={`Rate ${index + 1} star${index + 1 !== 1 ? "s" : ""}`}
            role={readonly ? "presentation" : "radio"}
            aria-checked={readonly ? undefined : tempRating === index + 1}
          >
            {getStarIcon(index)}
          </button>
        ))}
      </div>

      {/* Rating Value */}
      {showValue && (
        <span
          className={`${currentSize.text} font-medium text-gray-700 ml-1 sm:ml-2`}
        >
          {formatRating(rating)}
        </span>
      )}

      {/* Rating Count */}
      {showCount && count > 0 && (
        <span className={`${currentSize.text} text-gray-500 ml-1`}>
          ({formatCount(count)})
        </span>
      )}
    </div>
  );
};

export default StarRating;
