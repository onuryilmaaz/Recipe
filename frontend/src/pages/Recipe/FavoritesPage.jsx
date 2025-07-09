import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layouts/Navbar";
import ModernLoader from "../../components/Loader/ModernLoader";
import FavoriteButton from "../../components/FavoriteButton";
import StarRating from "../../components/StarRating";
import { FaClock, FaEye } from "react-icons/fa";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setOpenAuthForm } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      setOpenAuthForm(true);
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.FAVORITES.GET_ALL);
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteUpdate = () => {
    // Refresh favorites list when a recipe is removed from favorites
    fetchFavorites();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ModernLoader
            size="large"
            type="gradient"
            text="Favoriler yükleniyor..."
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Favori Tariflerim
          </h1>
          <p className="text-gray-600">
            {favorites.length > 0
              ? `${favorites.length} favori tarifiniz bulunuyor`
              : "Henüz favori tarifiniz yok"}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz favori tarifiniz yok
              </h3>
              <p className="text-gray-600 mb-6">
                Beğendiğiniz tarifleri favorilerinize ekleyerek daha sonra
                kolayca bulabilirsiniz.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                Tarifleri Keşfet
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={recipe.coverImageUrl || "/default-recipe.jpg"}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <FavoriteButton
                      recipeId={recipe._id}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="font-medium">{recipe.author?.name}</span>
                  </div>
                  
                  <div className="mb-3">
                    <StarRating
                      recipeId={recipe._id}
                      averageRating={recipe.averageRating || 0}
                      ratingsCount={recipe.ratingsCount || 0}
                      interactive={false}
                      size="small"
                      showCount={true}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    {recipe.duration && (
                      <div className="flex items-center">
                        <FaClock className="w-4 h-4 mr-1" />
                        <span>{recipe.duration} dk</span>
                      </div>
                    )}

                    <div className="flex items-center">
                      <FaEye className="w-4 h-4 mr-1" />
                      <span>{recipe.views || 0}</span>
                    </div>
                  </div>

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{recipe.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/${recipe.slug}`}
                    className="block w-full text-center bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Tarifi Görüntüle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
