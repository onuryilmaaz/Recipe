import { useState, useEffect, useContext } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import toast from "react-hot-toast";

const FavoriteButton = ({ recipeId, className = "" }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, setOpenAuthForm } = useContext(UserContext);

  // Check if recipe is in favorites when component mounts
  useEffect(() => {
    if (user && recipeId) {
      checkFavoriteStatus();
    }
  }, [user, recipeId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.FAVORITES.CHECK(recipeId)
      );
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setOpenAuthForm(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.FAVORITES.TOGGLE(recipeId)
      );

      setIsFavorite(response.data.isFavorite);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Favoriler güncellenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`
        flex items-center justify-center p-2 rounded-full transition-colors
        ${
          isFavorite
            ? "text-red-500 hover:text-red-600"
            : "text-gray-400 hover:text-red-500"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
    >
      {isFavorite ? (
        <FaHeart className="w-5 h-5" />
      ) : (
        <FaRegHeart className="w-5 h-5" />
      )}
    </button>
  );
};

export default FavoriteButton;
