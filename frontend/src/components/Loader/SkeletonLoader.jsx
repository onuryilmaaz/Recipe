const SkeletonLoader = ({
  variant = "default",
  count = 1,
  className = "",
  height = "auto",
}) => {
  const variants = {
    default: (
      <div className="animate-pulse space-y-3 sm:space-y-4">
        <div className="h-4 sm:h-6 bg-gray-200 rounded-md w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-11/12"></div>
          <div className="h-3 bg-gray-200 rounded w-10/12"></div>
          <div className="h-3 bg-gray-200 rounded w-9/12"></div>
        </div>
        <div className="bg-gray-100 rounded p-3 sm:p-4 space-y-2">
          <div className="h-2.5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-2.5 bg-gray-300 rounded w-2/3"></div>
          <div className="h-2.5 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    ),

    card: (
      <div className="animate-pulse bg-white rounded-lg sm:rounded-xl border border-gray-100 p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="h-40 sm:h-48 bg-gray-200 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            <div className="space-y-1 flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-2 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    ),

    list: (
      <div className="animate-pulse bg-white rounded-lg border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),

    table: (
      <div className="animate-pulse space-y-2">
        <div className="bg-gray-100 rounded p-2 sm:p-3">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded border border-gray-100 p-2 sm:p-3"
          >
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    ),

    dashboard: (
      <div className="animate-pulse space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6"
            >
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 sm:h-80 bg-gray-100 rounded"></div>
        </div>
      </div>
    ),

    profile: (
      <div className="animate-pulse bg-white rounded-lg sm:rounded-xl border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto sm:mx-0"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto sm:mx-0"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto sm:mx-0"></div>
          </div>
        </div>
      </div>
    ),
  };

  const renderSkeleton = () => {
    if (count === 1) {
      return variants[variant];
    }

    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="mb-4 last:mb-0">
        {variants[variant]}
      </div>
    ));
  };

  return (
    <div
      className={`w-full ${className}`}
      style={{ height: height !== "auto" ? height : undefined }}
      role="status"
      aria-label="Loading content"
    >
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader;
