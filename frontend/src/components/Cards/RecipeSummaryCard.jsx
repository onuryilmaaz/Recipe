import { LuEye, LuHeart, LuTrash2 } from "react-icons/lu";

const RecipeSummaryCard = ({
  title,
  coverImageUrl,
  updatedOn,
  tags,
  likes,
  views,
  duration,
  dietType,
  description,
  authorName,
  authProfileImg,
  averageRating = 0,
  ratingsCount = 0,
  recipeId,
  isAdminView,
  onClick,
  onDelete,
}) => {
  return (
    <div
      className="flex items-start gap-4 bg-white p-3 mb-5 rounded-lg cursor-pointer group hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <img
        src={coverImageUrl}
        alt={title}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1">
        <h3 className="text-[13px] md:text-[15px] text-black font-medium">
          {title}
        </h3>



        {/* Duration and Diet Type */}
        <div className="flex items-center gap-3 mt-1.5 mb-2 text-xs text-gray-600">
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

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
          <div className="text-[11px] text-gray-700 font-medium bg-gray-100 px-2.5 py-1 rounded">
            Updated: {updatedOn}
          </div>
          <div className="h-6 w-[1px] bg-gray-300/70" />
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-orange-700 font-medium bg-orange-50 px-2.5 py-1 rounded">
              <LuEye className="text-[16px] text-orange-500" /> {views || 0}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-red-700 font-medium bg-red-50 px-2.5 py-1 rounded">
              <LuHeart className="text-[16px] text-red-500" />
              {Array.isArray(likes) ? likes.length : likes || 0}
            </span>
            {averageRating > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-yellow-700 font-medium bg-yellow-50 px-2.5 py-1 rounded">
                ⭐ {averageRating.toFixed(1)} ({ratingsCount})
              </span>
            )}
          </div>
          <div className="h-6 w-[1px] bg-gray-300/70" />
          <div className="flex items-center gap-2.5">
            {tags.map((tag, index) => (
              <div
                key={`tag_${index}`}
                className="text-xs text-cyan-700 font-medium bg-cyan-100/50 px-2.5 py-1 rounded"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
      {isAdminView && (
        <button
          className="hidden md:group-hover:flex items-center gap-2 text-xs text-rose-500 font-medium bg-rose-50 px-3 py-1 rounded text-nowrap border border-rose-100 hover:border-rose-200 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <LuTrash2 className="" />
          <span className="hidden md:block">Sil</span>
        </button>
      )}
    </div>
  );
};

export default RecipeSummaryCard;
