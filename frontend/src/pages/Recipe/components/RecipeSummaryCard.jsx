import { useNavigate } from "react-router-dom";
import { LuTrash2, LuHeart, LuEye } from "react-icons/lu";
import { FaEdit, FaHeart } from "react-icons/fa";

const RecipeSummaryCard = ({
  title,
  coverImageUrl,
  description,
  tags = [],
  updatedOn,
  authorName,
  authProfileImg,
  duration,
  dietType,
  views,
  likes,
  averageRating = 0,
  ratingsCount = 0,
  onClick,
  onDelete,
  isAdminView = false,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white shadow-lg shadow-gray-100 rounded-xl overflow-hidden cursor-pointer relative"
      onClick={onClick}
    >
      {isAdminView && onDelete && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-50 transition-colors"
            title="Edit Recipe"
          >
            <FaEdit className="text-sm" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
            title="Delete Recipe"
          >
            <LuTrash2 className="text-sm" />
          </button>
        </div>
      )}
      <img
        src={coverImageUrl}
        alt={title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4 md:p-6">
        <h2 className="text-base md:text-lg font-bold mb-2 line-clamp-3">
          {title}
        </h2>
        <p className="text-gray-700 text-xs mb-3 line-clamp-3">{description}</p>
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
          {duration && (
            <span className="flex items-center gap-1">
              <span>⏱️</span>
              {duration} dk
            </span>
          )}
          {dietType && (
            <span className="flex items-center gap-1">
              <span>🥗</span>
              {dietType}
            </span>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <button
              key={index}
              className="bg-orange-200/50 text-orange-800/80 text-xs font-medium px-3 py-0.5 rounded-full text-nowrap cursor-pointer hover:bg-orange-300/50"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/tag/${tag}`);
              }}
            >
              # {tag}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={authProfileImg}
              alt={authorName}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <p className="text-gray-600 text-sm">{authorName}</p>
              <p className="text-gray-500 text-xs">{updatedOn}</p>
            </div>
          </div>

          {/* Views, Likes and Rating */}
          <div className="flex items-center gap-3">
            {views !== undefined && (
              <div className="flex items-center gap-1 text-gray-500">
                <LuEye className="text-sm" />
                <span className="text-xs">{views}</span>
              </div>
            )}
            {likes !== undefined && (
              <div className="flex items-center gap-1 text-red-500">
                <FaHeart className="text-sm" />
                <span className="text-xs">
                  {Array.isArray(likes) ? likes.length : likes}
                </span>
              </div>
            )}
            {averageRating > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <span className="text-sm">⭐</span>
                <span className="text-xs">
                  {averageRating.toFixed(1)} ({ratingsCount})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSummaryCard;
