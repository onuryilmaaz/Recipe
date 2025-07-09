import React, { useState, useContext, useEffect } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import toast from "react-hot-toast";

const StarRating = ({
  recipeId = null,
  rating = 0,
  averageRating = 0,
  ratingsCount = 0,
  maxRating = 5,
  onRatingUpdate = null,
  size = "medium",
  readonly = false,
  interactive = false,
  showValue = false,
  showCount = false,
  count = 0,
  className = "",
}) => {
  const { user, setOpenAuthForm } = useContext(UserContext);
  const [hoverRating, setHoverRating] = useState(0);
  const [tempRating, setTempRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justRated, setJustRated] = useState(false);

  // Use averageRating for display if provided, otherwise use rating
  const displayRating = averageRating || rating;
  const displayCount = ratingsCount || count;

  const sizes = {
    small: {
      star: "text-xs sm:text-sm",
      icon: "w-3 h-3 sm:w-4 sm:h-4",
      text: "text-xs",
      spacing: "gap-1",
      touch: "p-1.5",
      container: "p-3",
    },
    medium: {
      star: "text-sm sm:text-base",
      icon: "w-5 h-5 sm:w-6 sm:h-6",
      text: "text-sm",
      spacing: "gap-1.5",
      touch: "p-2",
      container: "p-4",
    },
    large: {
      star: "text-base sm:text-lg",
      icon: "w-6 h-6 sm:w-7 sm:h-7",
      text: "text-base",
      spacing: "gap-2",
      touch: "p-2.5",
      container: "p-5",
    },
  };

  const currentSize = sizes[size];

  useEffect(() => {
    if (justRated) {
      const timer = setTimeout(() => setJustRated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justRated]);

  const submitRating = async (newRating) => {
    if (!recipeId || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axiosInstance.post(API_PATHS.RATINGS.ADD_UPDATE(recipeId), {
        rating: newRating,
      });

      setJustRated(true);
      toast.success(
        <div className="flex items-center gap-2">
          <div className="text-yellow-500">
            <FaStar />
          </div>
          <span>Değerlendirmeniz kaydedildi! ⭐</span>
        </div>,
        {
          duration: 3000,
          style: {
            background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
            color: "#92400E",
            border: "1px solid #F59E0B",
          },
        }
      );

      // Call the update callback to refresh recipe data
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Değerlendirme kaydedilemedi. Lütfen tekrar deneyin.", {
        style: {
          background: "linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)",
          color: "#991B1B",
          border: "1px solid #EF4444",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (clickedRating) => {
    if (readonly || !interactive) return;

    // Check if user is logged in
    if (!user) {
      toast.error(
        <div className="flex items-center gap-2">
          <span>Değerlendirme yapmak için giriş yapmalısınız</span>
        </div>,
        {
          style: {
            background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
            color: "#92400E",
            border: "1px solid #F59E0B",
          },
        }
      );
      setOpenAuthForm(true);
      return;
    }

    const newRating = clickedRating === tempRating ? 0 : clickedRating;
    setTempRating(newRating);

    // Submit rating to backend
    if (newRating > 0) {
      submitRating(newRating);
    }
  };

  const handleStarHover = (hoveredRating) => {
    if (readonly || !interactive) return;
    setHoverRating(hoveredRating);
  };

  const handleMouseLeave = () => {
    if (readonly || !interactive) return;
    setHoverRating(0);
  };

  const getStarIcon = (index) => {
    const currentRating = readonly
      ? displayRating
      : hoverRating || displayRating;
    const starValue = index + 1;
    const isHovered = hoverRating >= starValue;
    const isFilled = currentRating >= starValue;
    const isHalf =
      currentRating >= starValue - 0.5 && currentRating < starValue;

    const baseClasses = `${currentSize.icon} transition-all duration-200 ease-out`;

    if (isHovered && interactive && !readonly) {
      return (
        <FaStar
          className={`${baseClasses} text-yellow-400 drop-shadow-md transform scale-110`}
        />
      );
    } else if (isFilled) {
      return (
        <FaStar className={`${baseClasses} text-yellow-400 drop-shadow-sm`} />
      );
    } else if (isHalf) {
      return (
        <FaStarHalfAlt
          className={`${baseClasses} text-yellow-400 drop-shadow-sm`}
        />
      );
    } else {
      return (
        <FaRegStar
          className={`${baseClasses} text-gray-300 hover:text-gray-400`}
        />
      );
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
    <div className={`${className}`}>
      {/* Main Rating Container */}
      <div
        className={`
        bg-gradient-to-br from-white to-amber-50 
        border border-amber-200/50 rounded-2xl 
        ${currentSize.container}
        ${
          justRated
            ? "ring-2 ring-yellow-400 ring-opacity-50 shadow-lg"
            : "shadow-sm hover:shadow-md"
        }
        transition-all duration-300 ease-in-out
      `}
      >
        {/* Header */}
        {interactive && (
          <div className="text-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-1">
              Bu tarifi değerlendir
            </h4>
            <p className="text-sm text-gray-600">
              {user
                ? "Yıldızlara tıklayarak puan verin"
                : "Değerlendirmek için giriş yapın"}
            </p>
          </div>
        )}

        {/* Stars Container */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex items-center ${currentSize.spacing} justify-center`}
            onMouseLeave={handleMouseLeave}
            role={readonly ? "img" : "radiogroup"}
            aria-label={`Rating: ${formatRating(
              displayRating
            )} out of ${maxRating} stars`}
          >
            {Array.from({ length: maxRating }, (_, index) => (
              <button
                key={index}
                type="button"
                className={`
                  ${
                    readonly || !interactive
                      ? "cursor-default"
                      : "cursor-pointer"
                  }
                  ${currentSize.touch}
                  transition-all duration-200 ease-out
                  rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400
                  ${
                    readonly || !interactive
                      ? ""
                      : "hover:scale-125 active:scale-105"
                  }
                  ${isSubmitting ? "opacity-50 cursor-wait" : ""}
                  ${
                    hoverRating >= index + 1 && interactive && !readonly
                      ? "transform scale-110"
                      : ""
                  }
                  ${justRated ? "animate-pulse" : ""}
                `}
                onClick={() => handleStarClick(index + 1)}
                onMouseEnter={() => handleStarHover(index + 1)}
                onFocus={() => handleStarHover(index + 1)}
                disabled={readonly || !interactive || isSubmitting}
                aria-label={`Rate ${index + 1} star${
                  index + 1 !== 1 ? "s" : ""
                }`}
                role={readonly ? "presentation" : "radio"}
                aria-checked={readonly ? undefined : tempRating === index + 1}
              >
                {getStarIcon(index)}
              </button>
            ))}
          </div>

          {/* Rating Info */}
          <div className="flex items-center gap-3 text-center">
            {/* Average Rating */}
            {displayRating > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-600">
                  {formatRating(displayRating)}
                </span>
                <span className="text-sm text-gray-500">/ 5</span>
              </div>
            )}

            {/* Rating Count */}
            {displayCount > 0 && (
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">
                  {formatCount(displayCount)} değerlendirme
                </div>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          {isSubmitting && (
            <div className="flex items-center gap-2 text-yellow-600">
              <div className="animate-spin w-4 h-4 border-2 border-yellow-300 border-t-yellow-600 rounded-full"></div>
              <span className="text-sm">Kaydediliyor...</span>
            </div>
          )}

          {/* Thank You Message */}
          {justRated && (
            <div className="text-center animate-fade-in">
              <div className="text-green-600 font-medium text-sm">
                ✨ Teşekkürler! Değerlendirmeniz kaydedildi.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StarRating;
