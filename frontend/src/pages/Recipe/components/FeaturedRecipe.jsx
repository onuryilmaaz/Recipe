

const FeaturedRecipe = ({
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
  averageRating = 0,
  ratingsCount = 0,
  recipeId,
  onClick,
}) => {
  return (
    <div
      className="grid grid-cols-12 bg-white shadow-lg shadow-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={onClick}
    >
      <div className="col-span-6">
        <img
          src={coverImageUrl}
          alt={title}
          className="w-full h-80 object-cover"
        />
      </div>
      <div className="col-span-6">
        <div className="p-6">
          <h2 className="text-lg md:text-2xl font-bold mb-2 line-clamp-3">
            {title}
          </h2>
          <p className="text-gray-700 text-[13px] mb-4 line-clamp-3">
            {description}
          </p>



          <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
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
            {averageRating > 0 && (
              <span className="flex items-center gap-1">
                <span>⭐</span>
                {averageRating.toFixed(1)} ({ratingsCount})
              </span>
            )}
            {views > 0 && (
              <span className="flex items-center gap-1">
                <span>👁️</span>
                {views} görüntülenme
              </span>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-orange-200/50 text-orange-800/80 text-xs font-medium px-3 py-0 rounded-full text-nowrap"
              >
                # {tag}
              </span>
            ))}
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default FeaturedRecipe;
