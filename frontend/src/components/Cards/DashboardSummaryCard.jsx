import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const DashboardSummaryCard = ({
  icon,
  label,
  value,
  bgColor,
  color,
  compact = false,
  growth = null,
  className = "",
}) => {
  if (compact) {
    return (
      <div
        className={`bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 sm:p-2.5 ${bgColor} rounded-lg shadow-sm`}>
            <div className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`}>{icon}</div>
          </div>
          {growth !== null && (
            <div
              className={`flex items-center gap-1 text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                growth >= 0
                  ? "text-green-700 bg-green-50"
                  : "text-red-700 bg-red-50"
              }`}
            >
              {growth >= 0 ? (
                <FaArrowUp className="w-3 h-3" />
              ) : (
                <FaArrowDown className="w-3 h-3" />
              )}
              {Math.abs(growth).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
            {value}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-tight">
            {label}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200 ${className}`}
    >
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center ${color} ${bgColor} rounded-lg shadow-sm flex-shrink-0`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
            {value}
          </span>
          {growth !== null && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${
                growth >= 0
                  ? "text-green-700 bg-green-50"
                  : "text-red-700 bg-red-50"
              }`}
            >
              {growth >= 0 ? (
                <FaArrowUp className="w-2.5 h-2.5" />
              ) : (
                <FaArrowDown className="w-2.5 h-2.5" />
              )}
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}%
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
      </div>
    </div>
  );
};

export default DashboardSummaryCard;
