import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layouts/Navbar";
import ModernLoader from "../../components/Loader/ModernLoader";
import StarRating from "../../components/StarRating";
import {
  FaEdit,
  FaTrash,
  FaLock,
  FaUnlock,
  FaClock,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";
import moment from "moment";

const CollectionDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCollection();
  }, [slug]);

  const fetchCollection = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.COLLECTIONS.GET_BY_SLUG(slug)
      );
      setCollection(response.data);
    } catch (error) {
      console.error("Error fetching collection:", error);
      if (error.response?.status === 404) {
        setError("Koleksiyon bulunamadı");
      } else if (error.response?.status === 403) {
        setError("Bu koleksiyona erişim izniniz yok");
      } else {
        setError("Koleksiyon yüklenirken hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecipe = async (recipeId) => {
    if (
      !window.confirm(
        "Bu tarifi koleksiyondan çıkarmak istediğinizden emin misiniz?"
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(
        API_PATHS.COLLECTIONS.REMOVE_RECIPE(collection._id, recipeId)
      );
      toast.success("Tarif koleksiyondan çıkarıldı");

      // Update local state
      setCollection((prev) => ({
        ...prev,
        recipes: prev.recipes.filter((recipe) => recipe._id !== recipeId),
      }));
    } catch (error) {
      console.error("Error removing recipe:", error);
      toast.error("Tarif çıkarılamadı");
    }
  };

  const handleDeleteCollection = async () => {
    if (!window.confirm("Bu koleksiyonu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.COLLECTIONS.DELETE(collection._id));
      toast.success("Koleksiyon silindi");
      navigate("/collections");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Koleksiyon silinemedi");
    }
  };

  const isOwner = user && collection && user._id === collection.author._id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ModernLoader
            size="large"
            type="gradient"
            text="Koleksiyon yükleniyor..."
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
            <p className="text-gray-600 mb-6">
              Aradığınız koleksiyon mevcut değil veya erişim izniniz yok.
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Koleksiyonlara Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collection Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div
            className="h-32 rounded-lg mb-6 relative overflow-hidden"
            style={{ backgroundColor: collection.color }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              {collection.recipes.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 w-40 h-20">
                  {collection.recipes.slice(0, 8).map((recipe, index) => (
                    <img
                      key={index}
                      src={recipe.coverImageUrl || "/default-recipe.jpg"}
                      alt=""
                      className="w-full h-full object-cover rounded"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-white text-4xl opacity-50">📚</div>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {collection.name}
                </h1>
                {collection.isPublic ? (
                  <FaUnlock className="text-green-600" title="Herkese açık" />
                ) : (
                  <FaLock className="text-gray-500" title="Özel koleksiyon" />
                )}
              </div>

              {collection.description && (
                <p className="text-gray-600 mb-4">{collection.description}</p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <span>{collection.recipes.length} tarif</span>
                <span>Oluşturan: {collection.author.name}</span>
                <span>
                  {moment(collection.createdAt).format("DD MMM YYYY")}
                </span>
              </div>

              {collection.tags && collection.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collection.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isOwner && (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleDeleteCollection}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Koleksiyonu Sil"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recipes Grid */}
        {collection.recipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bu koleksiyonda henüz tarif yok
            </h3>
            <p className="text-gray-600">
              {isOwner
                ? "Tarif sayfalarından bu koleksiyona tarif ekleyebilirsiniz."
                : "Koleksiyon sahibi henüz tarif eklememiş."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collection.recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={recipe.coverImageUrl || "/default-recipe.jpg"}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />

                  {isOwner && (
                    <button
                      onClick={() => handleRemoveRecipe(recipe._id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      title="Koleksiyondan Çıkar"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>

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

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>{recipe.author?.name || "Yönetici"}</span>
                    <div className="flex items-center gap-3">
                      {recipe.duration && (
                        <div className="flex items-center gap-1">
                          <FaClock className="w-3 h-3" />
                          <span>{recipe.duration} dk</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <FaEye className="w-3 h-3" />
                        <span>{recipe.views || 0}</span>
                      </div>
                    </div>
                  </div>

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

export default CollectionDetailPage;
