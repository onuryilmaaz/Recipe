/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useSearchParams } from "react-router-dom";
import RecipeLayout from "../../components/layouts/RecipeLayout/RecipeLayout";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import RecipeSummaryCard from "./components/RecipeSummaryCard";
import StarRating from "../../components/StarRating";
import moment from "moment";
import {
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaSortAmountDown,
} from "react-icons/fa";

const SearchRecipes = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || ""
  );
  const [filters, setFilters] = useState({
    dietType: searchParams.get("dietType") || "",
    maxDuration: searchParams.get("maxDuration") || "",
    minDuration: searchParams.get("minDuration") || "",
    minRating: searchParams.get("minRating") || "",
    tags: searchParams.get("tags") || "",
    sortBy: searchParams.get("sortBy") || "relevance",
  });

  // Data states
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [availableFilters, setAvailableFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const sortOptions = [
    { value: "relevance", label: "İlgili Sonuçlar" },
    { value: "rating", label: "En Yüksek Puan" },
    { value: "newest", label: "En Yeni" },
    { value: "popular", label: "En Popüler" },
    { value: "duration-asc", label: "Hızlı Hazırlık" },
    { value: "duration-desc", label: "Uzun Hazırlık" },
  ];

  const ratingOptions = [
    { value: "", label: "Tüm Puanlar" },
    { value: "4", label: "4+ Yıldız" },
    { value: "3", label: "3+ Yıldız" },
    { value: "2", label: "2+ Yıldız" },
  ];

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        q: searchQuery,
        ...filters,
        page,
        limit: 12,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const response = await axiosInstance.get(API_PATHS.RECIPE.SEARCH, {
        params,
      });

      if (response.data) {
        setSearchResults(response.data.recipes || []);
        setPagination(response.data.pagination || {});
        setAvailableFilters(response.data.filters || {});
        setAppliedFilters(response.data.appliedFilters || {});
      }
    } catch (error) {
      console.error("Error searching", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilter = (key) => {
    handleFilterChange(key, "");
  };

  const clearAllFilters = () => {
    setFilters({
      dietType: "",
      maxDuration: "",
      minDuration: "",
      minRating: "",
      tags: "",
      sortBy: "relevance",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    handleSearch(page);
  };

  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };

  useEffect(() => {
    handleSearch(currentPage);
  }, [searchQuery, filters, currentPage]);

  useEffect(() => {
    updateURL();
  }, [searchQuery, filters]);

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded ${
            i === pagination.page
              ? "bg-orange-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-8 mb-4">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev}
          className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Önceki
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={!pagination.hasNext}
          className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Sonraki
        </button>
      </div>
    );
  };

  return (
    <RecipeLayout>
      <div className="space-y-6">
        {/* Search Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tarif ara... (örn: domates, makarna)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="lg:w-48">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FaFilter />
              Filtreler
              {showFilters ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            {loading
              ? "Aranıyor..."
              : `${pagination.totalCount || 0} sonuç bulundu${
                  searchQuery ? ` "${searchQuery}" için` : ""
                }`}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Diet Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diyet Türü
                </label>
                <select
                  value={filters.dietType}
                  onChange={(e) =>
                    handleFilterChange("dietType", e.target.value)
                  }
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Tümü</option>
                  {availableFilters.dietTypes?.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Süre (dk)
                </label>
                <input
                  type="number"
                  value={filters.maxDuration}
                  onChange={(e) =>
                    handleFilterChange("maxDuration", e.target.value)
                  }
                  placeholder="60"
                  min="1"
                  max="300"
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Puan
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) =>
                    handleFilterChange("minRating", e.target.value)
                  }
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                >
                  {ratingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiketler
                </label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => handleFilterChange("tags", e.target.value)}
                  placeholder="kolay, hızlı"
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Active Filters & Clear */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === "sortBy") return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                  >
                    {key}: {value}
                    <button
                      onClick={() => clearFilter(key)}
                      className="hover:text-orange-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              {Object.values(filters).some((v) => v && v !== "relevance") && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Tümünü Temizle
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Tarifler aranıyor...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={item.coverImageUrl || "/default-recipe.jpg"}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="mb-3">
                      <StarRating
                        recipeId={item._id}
                        averageRating={item.averageRating || 0}
                        ratingsCount={item.ratingsCount || 0}
                        interactive={false}
                        size="small"
                        showCount={true}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>{item.author?.name || "Yönetici"}</span>
                      {item.duration && <span>{item.duration} dk</span>}
                    </div>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleClick(item)}
                      className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Tarifi Görüntüle
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Sonuç bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              Arama kriterlerinizi değiştirerek tekrar deneyin
            </p>
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>
    </RecipeLayout>
  );
};

export default SearchRecipes;
