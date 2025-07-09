import { useState, useEffect, useContext } from "react";
import { UserContext } from "../context/userContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import Modal from "./Modal";
import { FaBookmark, FaCheck, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

const CollectionSelector = ({ recipeId, className = "" }) => {
  const [showModal, setShowModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setOpenAuthForm } = useContext(UserContext);

  const fetchCollections = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.COLLECTIONS.GET_MY);
      setCollections(response.data.collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    try {
      await axiosInstance.post(
        API_PATHS.COLLECTIONS.ADD_RECIPE(collectionId, recipeId)
      );
      toast.success("Tarif koleksiyona eklendi!");

      // Update local state to show recipe is added
      setCollections((prev) =>
        prev.map((col) =>
          col._id === collectionId
            ? { ...col, recipes: [...col.recipes, { _id: recipeId }] }
            : col
        )
      );
    } catch (error) {
      console.error("Error adding to collection:", error);
      if (error.response?.status === 400) {
        toast.error("Bu tarif zaten koleksiyonda mevcut");
      } else {
        toast.error("Koleksiyona eklenirken hata oluştu");
      }
    }
  };

  const handleRemoveFromCollection = async (collectionId) => {
    try {
      await axiosInstance.delete(
        API_PATHS.COLLECTIONS.REMOVE_RECIPE(collectionId, recipeId)
      );
      toast.success("Tarif koleksiyondan çıkarıldı!");

      // Update local state
      setCollections((prev) =>
        prev.map((col) =>
          col._id === collectionId
            ? { ...col, recipes: col.recipes.filter((r) => r._id !== recipeId) }
            : col
        )
      );
    } catch (error) {
      console.error("Error removing from collection:", error);
      toast.error("Koleksiyondan çıkarılırken hata oluştu");
    }
  };

  const handleClick = () => {
    if (!user) {
      setOpenAuthForm(true);
      return;
    }
    setShowModal(true);
    fetchCollections();
  };

  const isInCollection = (collection) => {
    return collection.recipes.some((recipe) => recipe._id === recipeId);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          flex items-center justify-center p-2 rounded-full transition-colors
          text-gray-400 hover:text-orange-500 hover:bg-orange-50
          ${className}
        `}
        title="Koleksiyona ekle"
      >
        <FaBookmark className="w-5 h-5" />
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Koleksiyona Ekle"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Koleksiyonlar yükleniyor...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Henüz koleksiyonunuz yok
              </h3>
              <p className="text-gray-600 mb-4">
                Tarifleri organize etmek için bir koleksiyon oluşturun.
              </p>
              <button
                onClick={() => {
                  setShowModal(false);
                  // Navigate to collections page
                  window.location.href = "/collections";
                }}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 gap-2"
              >
                <FaPlus />
                Koleksiyon Oluştur
              </button>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {collections.map((collection) => {
                const inCollection = isInCollection(collection);

                return (
                  <div
                    key={collection._id}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                      ${
                        inCollection
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }
                    `}
                    onClick={() =>
                      inCollection
                        ? handleRemoveFromCollection(collection._id)
                        : handleAddToCollection(collection._id)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: collection.color }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {collection.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {collection.recipes.length} tarif
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {inCollection ? (
                        <div className="flex items-center gap-1 text-orange-600">
                          <FaCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">Eklendi</span>
                        </div>
                      ) : (
                        <button className="text-gray-400 hover:text-orange-600">
                          <FaPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-4 border-t">
            <button
              onClick={() => {
                setShowModal(false);
                window.location.href = "/collections";
              }}
              className="w-full text-center text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Tüm koleksiyonları yönet
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CollectionSelector;
