import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Navbar from "../../components/layouts/Navbar";
import ModernLoader from "../../components/Loader/ModernLoader";
import Modal from "../../components/Modal";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaLock,
  FaUnlock,
  FaImages,
} from "react-icons/fa";
import toast from "react-hot-toast";

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, setOpenAuthForm } = useContext(UserContext);
  const navigate = useNavigate();

  // Create collection form
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    isPublic: true,
    tags: "",
    color: "#f97316",
  });

  const colors = [
    "#f97316",
    "#ef4444",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ec4899",
    "#06b6d4",
  ];

  useEffect(() => {
    if (!user) {
      setOpenAuthForm(true);
      return;
    }
    fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.COLLECTIONS.GET_MY);
      setCollections(response.data.collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();

    if (!newCollection.name.trim()) {
      toast.error("Koleksiyon adı gerekli");
      return;
    }

    try {
      const tagsArray = newCollection.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      await axiosInstance.post(API_PATHS.COLLECTIONS.CREATE, {
        ...newCollection,
        tags: tagsArray,
      });

      toast.success("Koleksiyon oluşturuldu!");
      setShowCreateModal(false);
      setNewCollection({
        name: "",
        description: "",
        isPublic: true,
        tags: "",
        color: "#f97316",
      });
      fetchCollections();
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Koleksiyon oluşturulamadı");
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm("Bu koleksiyonu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.COLLECTIONS.DELETE(collectionId));
      toast.success("Koleksiyon silindi");
      fetchCollections();
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Koleksiyon silinemedi");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ModernLoader
            size="large"
            type="gradient"
            text="Koleksiyonlar yükleniyor..."
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Koleksiyonlarım
            </h1>
            <p className="text-gray-600">
              {collections.length > 0
                ? `${collections.length} koleksiyonunuz bulunuyor`
                : "Henüz koleksiyonunuz yok"}
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 gap-2"
          >
            <FaPlus />
            Yeni Koleksiyon
          </button>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz koleksiyonunuz yok
              </h3>
              <p className="text-gray-600 mb-6">
                Favori tariflerinizi organize etmek için koleksiyonlar
                oluşturun.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 gap-2"
              >
                <FaPlus />
                İlk Koleksiyonunu Oluştur
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-32 relative"
                  style={{ backgroundColor: collection.color }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    {collection.recipes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1 w-20 h-20">
                        {collection.recipes.slice(0, 4).map((recipe, index) => (
                          <img
                            key={index}
                            src={recipe.coverImageUrl || "/default-recipe.jpg"}
                            alt=""
                            className="w-full h-full object-cover rounded"
                          />
                        ))}
                      </div>
                    ) : (
                      <FaImages className="text-white text-4xl opacity-50" />
                    )}
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1">
                    {collection.isPublic ? (
                      <FaUnlock
                        className="text-white text-sm"
                        title="Herkese açık"
                      />
                    ) : (
                      <FaLock className="text-white text-sm" title="Özel" />
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {collection.name}
                  </h3>

                  {collection.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {collection.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{collection.recipes.length} tarif</span>
                    <span>{collection.isPublic ? "Herkese açık" : "Özel"}</span>
                  </div>

                  {collection.tags && collection.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {collection.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/collections/${collection.slug}`}
                      className="flex-1 text-center bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors text-sm"
                    >
                      Görüntüle
                    </Link>

                    <button
                      onClick={() => handleDeleteCollection(collection._id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Sil"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Yeni Koleksiyon Oluştur"
      >
        <div className="p-6 sm:p-8">
          <form onSubmit={handleCreateCollection} className="space-y-6">
            {/* Collection Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Koleksiyon Adı *
              </label>
              <input
                type="text"
                value={newCollection.name}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm"
                placeholder="Örn: Akşam Yemeği Tarifleri"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Açıklama
              </label>
              <textarea
                value={newCollection.description}
                onChange={(e) =>
                  setNewCollection({
                    ...newCollection,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm resize-none"
                rows="4"
                placeholder="Bu koleksiyon hakkında kısa bir açıklama..."
              />
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Renk
              </label>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCollection({ ...newCollection, color })}
                    className={`w-10 h-10 rounded-full border-3 transition-all duration-200 hover:scale-110 ${
                      newCollection.color === color
                        ? "border-gray-800 ring-2 ring-gray-300 ring-offset-2"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Etiketler
              </label>
              <input
                type="text"
                value={newCollection.tags}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, tags: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm"
                placeholder="kolay, hızlı, sağlıklı (virgülle ayırın)"
              />
            </div>

            {/* Privacy Setting */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newCollection.isPublic}
                  onChange={(e) =>
                    setNewCollection({
                      ...newCollection,
                      isPublic: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Herkese açık yap
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-8">
                Herkese açık koleksiyonlar diğer kullanıcılar tarafından görülebilir
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Oluştur
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default CollectionsPage;
