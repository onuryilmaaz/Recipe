import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import ModernLoader from "../../components/Loader/ModernLoader";
import CharAvatar from "../../components/Cards/CharAvatar";
import Modal from "../../components/Modal";
import {
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaEye,
  FaFlag,
  FaExclamationTriangle,
  FaShieldAlt,
  FaClock,
  FaUser,
  FaCalendar,
  FaComment,
  FaUtensils,
} from "react-icons/fa";
import toast from "react-hot-toast";
import moment from "moment";

const Moderation = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [contentFilter, setContentFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderationStats, setModerationStats] = useState({
    pendingRecipes: 0,
    pendingComments: 0,
    reportedRecipes: 0,
    reportedComments: 0,
    totalFlags: 0,
  });

  useEffect(() => {
    fetchModerationData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [pendingItems, reportedItems, activeTab, searchTerm, contentFilter]);

  const fetchModerationData = async () => {
    try {
      // Fetch pending content
      const pendingResponse = await axiosInstance.get(
        "/api/admin/moderation/pending"
      );
      setPendingItems(pendingResponse.data.items || []);

      // Fetch reported content
      const reportedResponse = await axiosInstance.get(
        "/api/admin/moderation/reported"
      );
      setReportedItems(reportedResponse.data.items || []);

      // Fetch stats
      const statsResponse = await axiosInstance.get(
        "/api/admin/moderation/stats"
      );
      setModerationStats(statsResponse.data.stats || {});
    } catch (error) {
      console.error("Error fetching moderation data:", error);

      // Sample data for development
      const samplePending = [
        {
          _id: "1",
          type: "recipe",
          title: "Deneme Tarifi",
          content: "Bu bir deneme tarifi açıklaması...",
          author: { name: "Test User", _id: "user1" },
          createdAt: new Date(),
          status: "pending",
          flagCount: 0,
        },
        {
          _id: "2",
          type: "comment",
          content: "Bu tarif gerçekten çok güzel!",
          author: { name: "Comment User", _id: "user2" },
          recipe: { title: "Pasta Tarifi", _id: "recipe1" },
          createdAt: new Date(),
          status: "pending",
          flagCount: 0,
        },
      ];

      const sampleReported = [
        {
          _id: "3",
          type: "recipe",
          title: "Şüpheli Tarif",
          content: "Bu tarif spam olabilir...",
          author: { name: "Spam User", _id: "user3" },
          createdAt: new Date(),
          status: "published",
          flagCount: 3,
          flags: [
            { reason: "spam", reportedBy: "user4", date: new Date() },
            { reason: "inappropriate", reportedBy: "user5", date: new Date() },
          ],
        },
      ];

      setPendingItems(samplePending);
      setReportedItems(sampleReported);
      setModerationStats({
        pendingRecipes: 1,
        pendingComments: 1,
        reportedRecipes: 1,
        reportedComments: 0,
        totalFlags: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    const items = activeTab === "pending" ? pendingItems : reportedItems;
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Content type filter
    if (contentFilter !== "all") {
      filtered = filtered.filter((item) => item.type === contentFilter);
    }

    setFilteredItems(filtered);
  };

  const handleApprove = async (itemId, itemType) => {
    try {
      await axiosInstance.patch(`/api/admin/moderation/approve`, {
        itemId,
        itemType,
      });

      toast.success("İçerik onaylandı");
      fetchModerationData();
    } catch (error) {
      console.error("Error approving content:", error);
      toast.error("İçerik onaylanırken hata oluştu");
    }
  };

  const handleReject = async (itemId, itemType, reason = "") => {
    try {
      await axiosInstance.patch(`/api/admin/moderation/reject`, {
        itemId,
        itemType,
        reason,
      });

      toast.success("İçerik reddedildi");
      fetchModerationData();
    } catch (error) {
      console.error("Error rejecting content:", error);
      toast.error("İçerik reddedilirken hata oluştu");
    }
  };

  const handleDismissFlag = async (itemId, itemType) => {
    try {
      await axiosInstance.patch(`/api/admin/moderation/dismiss-flag`, {
        itemId,
        itemType,
      });

      toast.success("Şikayet reddedildi");
      fetchModerationData();
    } catch (error) {
      console.error("Error dismissing flag:", error);
      toast.error("Şikayet reddedilirken hata oluştu");
    }
  };

  const getContentIcon = (type) => {
    return type === "recipe" ? (
      <FaUtensils className="w-4 h-4" />
    ) : (
      <FaComment className="w-4 h-4" />
    );
  };

  const getStatusBadge = (item) => {
    if (item.flagCount > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaFlag className="w-3 h-3" />
          {item.flagCount} şikayet
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <FaClock className="w-3 h-3" />
        Beklemede
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ModernLoader
            size="large"
            type="gradient"
            text="Moderasyon verileri yükleniyor..."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              İçerik Moderasyonu
            </h1>
            <p className="text-gray-600">
              Bekleyen ve şikayet edilen içerikleri yönetin
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Bekleyen Tarifler
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationStats.pendingRecipes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaComment className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Bekleyen Yorumlar
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationStats.pendingComments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaFlag className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Şikayetli Tarifler
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationStats.reportedRecipes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Şikayetli Yorumlar
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationStats.reportedComments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaShieldAlt className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Şikayet
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {moderationStats.totalFlags}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("pending")}
                className={`
                  py-4 px-6 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === "pending"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                Bekleyen İçerik ({pendingItems.length})
              </button>
              <button
                onClick={() => setActiveTab("reported")}
                className={`
                  py-4 px-6 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === "reported"
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                Şikayet Edilen ({reportedItems.length})
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="İçerik ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <select
                value={contentFilter}
                onChange={(e) => setContentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tüm İçerikler</option>
                <option value="recipe">Tarifler</option>
                <option value="comment">Yorumlar</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                {filteredItems.length} öğe gösteriliyor
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="divide-y divide-gray-200">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <FaShieldAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {activeTab === "pending"
                    ? "Bekleyen içerik yok"
                    : "Şikayet edilmiş içerik yok"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === "pending"
                    ? "Tüm içerikler onaylanmış durumda."
                    : "Herhangi bir şikayet bulunmuyor."}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getContentIcon(item.type)}
                        <span className="font-medium text-gray-900">
                          {item.type === "recipe" ? "Tarif" : "Yorum"}
                        </span>
                        {getStatusBadge(item)}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.title ||
                          (item.type === "comment"
                            ? `${item.recipe?.title} tarifine yorum`
                            : "Başlıksız")}
                      </h3>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {item.content}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FaUser className="w-3 h-3" />
                          <span>{item.author?.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaCalendar className="w-3 h-3" />
                          <span>
                            {moment(item.createdAt).format("DD MMM YYYY")}
                          </span>
                        </div>
                        {item.flagCount > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <FaFlag className="w-3 h-3" />
                            <span>{item.flagCount} şikayet</span>
                          </div>
                        )}
                      </div>

                      {/* Flags/Reports */}
                      {item.flags && item.flags.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <h4 className="text-sm font-medium text-red-800 mb-2">
                            Şikayet Sebepleri:
                          </h4>
                          <div className="space-y-1">
                            {item.flags.map((flag, index) => (
                              <div key={index} className="text-sm text-red-700">
                                •{" "}
                                <span className="font-medium">
                                  {flag.reason}
                                </span>
                                {" - "}
                                {moment(flag.date).format("DD MMM")}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Detayları Görüntüle"
                      >
                        <FaEye />
                      </button>

                      {activeTab === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(item._id, item.type)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Onayla"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleReject(item._id, item.type)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Reddet"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleReject(
                                item._id,
                                item.type,
                                "Şikayetler doğrulandı"
                              )
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="İçeriği Kaldır"
                          >
                            <FaTimes />
                          </button>
                          <button
                            onClick={() =>
                              handleDismissFlag(item._id, item.type)
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Şikayeti Reddet"
                          >
                            <FaCheck />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedItem(null);
          }}
          title="İçerik Detayları"
        >
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getContentIcon(selectedItem.type)}
                <span className="font-medium">
                  {selectedItem.type === "recipe" ? "Tarif" : "Yorum"}
                </span>
                {getStatusBadge(selectedItem)}
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  {selectedItem.title ||
                    `${selectedItem.recipe?.title} tarifine yorum`}
                </h3>
                <p className="text-gray-600 mt-2">{selectedItem.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Yazar:</span>
                  <span className="ml-2">{selectedItem.author?.name}</span>
                </div>
                <div>
                  <span className="font-medium">Tarih:</span>
                  <span className="ml-2">
                    {moment(selectedItem.createdAt).format("DD MMM YYYY")}
                  </span>
                </div>
              </div>

              {selectedItem.flags && selectedItem.flags.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Şikayetler:</h4>
                  <div className="space-y-2">
                    {selectedItem.flags.map((flag, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <div className="font-medium">{flag.reason}</div>
                        <div className="text-sm text-gray-600">
                          {moment(flag.date).format("DD MMM YYYY")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Kapat
                </button>
                {selectedItem.type === "recipe" && (
                  <Link
                    to={`/${selectedItem.slug || selectedItem._id}`}
                    className="flex-1 text-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    target="_blank"
                  >
                    Tarifi Görüntüle
                  </Link>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Moderation;
