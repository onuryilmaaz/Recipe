import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import ModernLoader from "../../components/Loader/ModernLoader";
import CharAvatar from "../../components/Cards/CharAvatar";
import Modal from "../../components/Modal";
import Input from "../../components/Inputs/Input";
import {
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaEye,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaCrown,
  FaCalendar,
  FaEnvelope,
  FaClock,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUserShield,
  FaComment,
  FaUtensils,
  FaHeart,
  FaExclamationTriangle,
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import toast from "react-hot-toast";
import moment from "moment";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: null, // 'ban', 'unban', 'delete'
    user: null,
    title: "",
    message: "",
    confirmText: "",
    icon: null,
    bgColor: "",
    textColor: "",
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    admins: 0,
  });

  // Edit User Form State
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
  });
  const [editFormErrors, setEditFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/users");
      const usersData = response.data.users || response.data || [];
      setUsers(usersData);

      // Calculate stats
      const stats = {
        total: usersData.length,
        active: usersData.filter((user) => user.status !== "banned").length,
        banned: usersData.filter((user) => user.status === "banned").length,
        admins: usersData.filter((user) => user.role === "admin").length,
      };
      setUserStats(stats);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Kullanıcılar yüklenemedi");

      // Fallback data for demo
      const sampleUsers = [
        {
          _id: "1",
          name: "Admin",
          email: "admin@gmail.com",
          role: "admin",
          status: "active",
          createdAt: new Date(),
          lastLogin: new Date(),
          recipesCount: 0,
          commentsCount: 0,
          profileImageUrl: null,
        },
        {
          _id: "2",
          name: "Lilly Jane",
          email: "lilly@gmail.com",
          role: "user",
          status: "active",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          lastLogin: new Date(),
          recipesCount: 3,
          commentsCount: 8,
          profileImageUrl: null,
        },
        {
          _id: "3",
          name: "Test",
          email: "test@gmail.com",
          role: "user",
          status: "active",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastLogin: new Date(),
          recipesCount: 0,
          commentsCount: 0,
          profileImageUrl: null,
        },
        {
          _id: "4",
          name: "Onur Yılmaz",
          email: "onur@gmail.com",
          role: "user",
          status: "active",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lastLogin: new Date(),
          recipesCount: 3,
          commentsCount: 12,
          profileImageUrl: null,
        },
      ];
      setUsers(sampleUsers);
      setUserStats({
        total: 4,
        active: 4,
        banned: 0,
        admins: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "createdAt" || sortBy === "lastLogin") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setEditFormErrors({});
    setShowUserModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      setEditFormErrors({});

      // Validation
      const errors = {};
      if (!editForm.name.trim()) errors.name = "İsim zorunludur";
      if (!editForm.email.trim()) errors.email = "E-posta zorunludur";
      if (!/^\S+@\S+\.\S+$/.test(editForm.email)) {
        errors.email = "Geçerli bir e-posta adresi girin";
      }

      if (Object.keys(errors).length > 0) {
        setEditFormErrors(errors);
        return;
      }

      setActionLoading("update");

      // Update user role if changed
      if (editForm.role !== selectedUser.role) {
        await axiosInstance.patch(`/api/admin/users/${selectedUser._id}/role`, {
          role: editForm.role,
        });
      }

      // Update user status if changed
      if (editForm.status !== selectedUser.status) {
        await axiosInstance.patch(
          `/api/admin/users/${selectedUser._id}/status`,
          {
            status: editForm.status,
          }
        );
      }

      toast.success("Kullanıcı başarıyla güncellendi");
      setShowUserModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Kullanıcı güncellenemedi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = (user) => {
    const action = user.status === "banned" ? "unban" : "ban";

    setConfirmationModal({
      isOpen: true,
      type: action,
      user: user,
      title: action === "ban" ? "Kullanıcıyı Banla" : "Banı Kaldır",
      message:
        action === "ban"
          ? `${user.name} kullanıcısını banlamak istediğinizden emin misiniz? Bu kullanıcı platformdaki tüm erişimini kaybedecek.`
          : `${user.name} kullanıcısının banını kaldırmak istediğinizden emin misiniz? Kullanıcı tekrar platforma erişebilecek.`,
      confirmText: action === "ban" ? "Evet, Banla" : "Evet, Banı Kaldır",
      icon:
        action === "ban" ? (
          <FaBan className="w-8 h-8" />
        ) : (
          <FaCheckCircle className="w-8 h-8" />
        ),
      bgColor: action === "ban" ? "bg-amber-50" : "bg-emerald-50",
      textColor: action === "ban" ? "text-amber-600" : "text-emerald-600",
    });
  };

  const confirmBanUser = async () => {
    const { user, type } = confirmationModal;

    try {
      setActionLoading(user._id);
      await axiosInstance.patch(`/api/admin/users/${user._id}/status`, {
        status: type === "ban" ? "banned" : "active",
      });

      toast.success(
        type === "ban" ? "Kullanıcı banlandı" : "Kullanıcı banı kaldırıldı"
      );
      setConfirmationModal({ ...confirmationModal, isOpen: false });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("İşlem gerçekleştirilemedi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = (user) => {
    setConfirmationModal({
      isOpen: true,
      type: "delete",
      user: user,
      title: "Kullanıcıyı Sil",
      message: `${user.name} kullanıcısını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve kullanıcının tüm verileri silinecektir.`,
      confirmText: "Evet, Kalıcı Olarak Sil",
      icon: <FaTrash className="w-8 h-8" />,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    });
  };

  const confirmDeleteUser = async () => {
    const { user } = confirmationModal;

    try {
      setActionLoading(user._id);
      await axiosInstance.delete(`/api/admin/users/${user._id}`);
      toast.success("Kullanıcı silindi");
      setConfirmationModal({ ...confirmationModal, isOpen: false });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Kullanıcı silinemedi");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      banned: "bg-red-50 text-red-700 border-red-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
    };

    const icons = {
      active: <FaCheckCircle className="w-3 h-3" />,
      banned: <FaBan className="w-3 h-3" />,
      pending: <FaClock className="w-3 h-3" />,
    };

    const labels = {
      active: "Aktif",
      banned: "Banlı",
      pending: "Beklemede",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-50 text-purple-700 border-purple-200",
      user: "bg-blue-50 text-blue-700 border-blue-200",
    };

    const icons = {
      admin: <FaCrown className="w-3 h-3" />,
      user: <FaUsers className="w-3 h-3" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[role]}`}
      >
        {icons[role]}
        {role === "admin" ? "Admin" : "Kullanıcı"}
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
            text="Kullanıcılar yükleniyor..."
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                <FaUsers className="w-6 h-6" />
              </div>
              Kullanıcı Yönetimi
            </h1>
            <p className="text-gray-600 mt-1">
              Platformdaki tüm kullanıcıları yönetin ve düzenleyin
            </p>
          </div>

          <button
            onClick={() => setShowUserModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2.5 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FaUserPlus className="w-4 h-4" />
            Yeni Kullanıcı
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100/60 rounded-xl">
                <FaUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100/60 rounded-xl">
                <FaUserCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Aktif Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100/60 rounded-xl">
                <FaUserTimes className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Banlı Kullanıcı
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.banned}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100/60 rounded-xl">
                <FaCrown className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.admins}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Kullanıcı ara (isim, e-posta)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50/50"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                showFilters
                  ? "bg-orange-50 border-orange-200 text-orange-600"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaFilter className="w-4 h-4" />
              Filtreler
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50/50"
              >
                <option value="createdAt">Katılım Tarihi</option>
                <option value="name">İsim</option>
                <option value="lastLogin">Son Giriş</option>
                <option value="recipesCount">Tarif Sayısı</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {sortOrder === "asc" ? (
                  <FaSortAmountUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <FaSortAmountDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50/50"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="banned">Banlı</option>
                    <option value="pending">Beklemede</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50/50"
                  >
                    <option value="all">Tüm Roller</option>
                    <option value="admin">Admin</option>
                    <option value="user">Kullanıcı</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-gray-600 bg-gray-50/50 px-4 py-2.5 rounded-xl border border-gray-200">
                    <span className="font-medium">{filteredUsers.length}</span>{" "}
                    kullanıcı gösteriliyor
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* User Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {user.profileImageUrl ? (
                    <img
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                      src={user.profileImageUrl}
                      alt={user.name}
                    />
                  ) : (
                    <CharAvatar
                      fullName={user.name}
                      widht="w-12"
                      height="h-12"
                      style="text-base"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaEnvelope className="w-3 h-3" />
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <HiDotsVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Status and Role */}
              <div className="flex items-center gap-2 mb-4">
                {getStatusBadge(user.status)}
                {getRoleBadge(user.role)}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                    <FaUtensils className="w-3 h-3" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {user.recipesCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">Tarif</div>
                </div>
                <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <FaComment className="w-3 h-3" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {user.commentsCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">Yorum</div>
                </div>
                <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                  <div className="flex items-center justify-center gap-1 text-pink-600 mb-1">
                    <FaHeart className="w-3 h-3" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {user.likesCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">Beğeni</div>
                </div>
              </div>

              {/* Join Date */}
              <div className="mb-4 p-3 bg-gray-50/50 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCalendar className="w-3 h-3" />
                  <span className="font-medium">Katılım:</span>
                  {moment(user.createdAt).format("DD MMM YYYY")}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  to={`/user/${user._id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <FaEye className="w-3 h-3" />
                  Görüntüle
                </Link>

                <button
                  onClick={() => handleEditUser(user)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-medium"
                >
                  <FaEdit className="w-3 h-3" />
                  Düzenle
                </button>

                <button
                  onClick={() => handleBanUser(user)}
                  disabled={actionLoading === user._id}
                  className={`px-3 py-2 rounded-xl transition-colors text-sm font-medium ${
                    user.status === "banned"
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  }`}
                >
                  {actionLoading === user._id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : user.status === "banned" ? (
                    <FaCheckCircle className="w-3 h-3" />
                  ) : (
                    <FaBan className="w-3 h-3" />
                  )}
                </button>

                <button
                  onClick={() => handleDeleteUser(user)}
                  disabled={actionLoading === user._id}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FaUsers className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Kullanıcı bulunamadı
            </h3>
            <p className="text-gray-500 mb-6">
              Arama kriterlerinize uygun kullanıcı bulunamadı.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRoleFilter("all");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        <Modal
          isOpen={confirmationModal.isOpen}
          onClose={() =>
            setConfirmationModal({ ...confirmationModal, isOpen: false })
          }
          title=""
        >
          <div className="space-y-6 text-center">
            {/* Icon */}
            <div
              className={`w-20 h-20 mx-auto ${confirmationModal.bgColor} rounded-full flex items-center justify-center`}
            >
              <div className={confirmationModal.textColor}>
                {confirmationModal.icon}
              </div>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {confirmationModal.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {confirmationModal.message}
              </p>
            </div>

            {/* User Info */}
            {confirmationModal.user && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center justify-center gap-3">
                  {confirmationModal.user.profileImageUrl ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={confirmationModal.user.profileImageUrl}
                      alt={confirmationModal.user.name}
                    />
                  ) : (
                    <CharAvatar
                      fullName={confirmationModal.user.name}
                      widht="w-10"
                      height="h-10"
                      style="text-sm"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {confirmationModal.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {confirmationModal.user.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning Box */}
            {confirmationModal.type === "delete" && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaExclamationTriangle className="w-3 h-3 text-red-600" />
                  </div>
                  <div className="text-left">
                    <h6 className="font-semibold text-red-800 mb-1">
                      ⚠️ Dikkat!
                    </h6>
                    <p className="text-sm text-red-700">
                      Bu işlem geri alınamaz. Kullanıcının tüm tarifleri,
                      yorumları ve diğer verileri kalıcı olarak silinecektir.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {confirmationModal.type === "ban" && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaBan className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <h6 className="font-semibold text-amber-800 mb-1">
                      Banlama İşlemi
                    </h6>
                    <p className="text-sm text-amber-700">
                      Kullanıcı platformdaki tüm erişimini kaybedecek ve giriş
                      yapamayacaktır.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() =>
                  setConfirmationModal({ ...confirmationModal, isOpen: false })
                }
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold"
              >
                İptal
              </button>

              <button
                onClick={() => {
                  if (confirmationModal.type === "delete") {
                    confirmDeleteUser();
                  } else {
                    confirmBanUser();
                  }
                }}
                disabled={actionLoading === confirmationModal.user?._id}
                className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                  confirmationModal.type === "delete"
                    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    : confirmationModal.type === "ban"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    : "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                }`}
              >
                {actionLoading === confirmationModal.user?._id ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  confirmationModal.confirmText
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
            setEditForm({
              name: "",
              email: "",
              role: "user",
              status: "active",
            });
            setEditFormErrors({});
          }}
          title=""
        >
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FaEdit className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedUser ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı Ekle"}
              </h3>
              <p className="text-gray-600">
                {selectedUser
                  ? "Kullanıcı bilgilerini ve izinlerini güncelleyin"
                  : "Platforma yeni kullanıcı ekleyin"}
              </p>
            </div>

            {/* User Info Display */}
            {selectedUser && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {selectedUser.profileImageUrl ? (
                      <img
                        className="h-16 w-16 rounded-2xl object-cover border-3 border-white shadow-lg"
                        src={selectedUser.profileImageUrl}
                        alt={selectedUser.name}
                      />
                    ) : (
                      <div className="relative">
                        <CharAvatar
                          fullName={selectedUser.name}
                          widht="w-16"
                          height="h-16"
                          style="text-xl"
                        />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedUser.name}
                    </h4>
                    <p className="text-gray-600 flex items-center gap-2 mb-2">
                      <FaEnvelope className="w-4 h-4" />
                      {selectedUser.email}
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedUser.status)}
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedUser.recipesCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tarif</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedUser.commentsCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Yorum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">
                      {selectedUser.likesCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Beğeni</div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="space-y-5">
              <div className="bg-gray-50/50 p-6 rounded-2xl space-y-4">
                <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaUserShield className="w-5 h-5 text-orange-600" />
                  Kullanıcı Bilgileri
                </h5>

                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="İsim"
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    error={editFormErrors.name}
                    placeholder="Kullanıcı adı girin"
                    disabled={!selectedUser}
                  />

                  <Input
                    label="E-posta"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    error={editFormErrors.email}
                    placeholder="E-posta adresi girin"
                    disabled={!selectedUser}
                  />
                </div>
              </div>

              <div className="bg-purple-50/50 p-6 rounded-2xl space-y-4">
                <h5 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaCrown className="w-5 h-5 text-purple-600" />
                  Yetki ve Durum
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Kullanıcı Rolü
                    </label>
                    <div className="relative">
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none text-gray-900 font-medium"
                      >
                        <option value="user">👤 Kullanıcı</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                      <FaCrown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500">
                      {editForm.role === "admin"
                        ? "Tam platform erişimi"
                        : "Sınırlı kullanıcı erişimi"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Hesap Durumu
                    </label>
                    <div className="relative">
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white appearance-none text-gray-900 font-medium"
                      >
                        <option value="active">✅ Aktif</option>
                        <option value="banned">🚫 Banlı</option>
                        <option value="pending">⏳ Beklemede</option>
                      </select>
                      <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4 pointer-events-none" />
                    </div>
                    <p className="text-xs text-gray-500">
                      {editForm.status === "active"
                        ? "Kullanıcı platformu kullanabilir"
                        : editForm.status === "banned"
                        ? "Kullanıcının erişimi engellenmiş"
                        : "Kullanıcı onay bekliyor"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning for Admin Role */}
              {editForm.role === "admin" && selectedUser?.role !== "admin" && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUserShield className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h6 className="font-semibold text-amber-800 mb-1">
                        Dikkat!
                      </h6>
                      <p className="text-sm text-amber-700">
                        Bu kullanıcıya admin yetkisi veriyorsunuz. Admin
                        kullanıcılar platformdaki tüm verilere erişebilir ve
                        değişiklik yapabilir.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ban Warning */}
              {editForm.status === "banned" &&
                selectedUser?.status !== "banned" && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaBan className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h6 className="font-semibold text-red-800 mb-1">
                          Kullanıcı Banlanacak
                        </h6>
                        <p className="text-sm text-red-700">
                          Bu kullanıcının platformdaki tüm erişimi engellenecek
                          ve giriş yapamayacak.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t-2 border-gray-100">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  setEditForm({
                    name: "",
                    email: "",
                    role: "user",
                    status: "active",
                  });
                  setEditFormErrors({});
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
              >
                <span>İptal</span>
              </button>

              {selectedUser && (
                <button
                  onClick={handleUpdateUser}
                  disabled={actionLoading === "update"}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white rounded-xl hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {actionLoading === "update" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Güncelleniyor...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="w-5 h-5" />
                      <span>Değişiklikleri Kaydet</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Users;
