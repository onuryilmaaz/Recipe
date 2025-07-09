import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HiX, HiTrash } from "react-icons/hi";
import axios from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { toast } from "react-hot-toast";
import ModernLoader from "./Loader/ModernLoader";

const NotificationDropdown = ({ isOpen, onClose, className = "" }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll on mobile
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Fetch notifications
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_PATHS.NOTIFICATIONS.GET_ALL}?page=${pageNum}&limit=10`
      );

      if (response.data.success) {
        const newNotifications = response.data.data;

        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }

        setUnreadCount(response.data.unreadCount);
        setHasMore(pageNum < response.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (reset) {
        toast.error("Bildirimler yüklenirken hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications(1, true);
    }
  }, [isOpen]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(API_PATHS.NOTIFICATIONS.MARK_READ(notificationId));

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(API_PATHS.NOTIFICATIONS.MARK_ALL_READ);

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      toast.success("Tüm bildirimler okundu olarak işaretlendi");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Bildirimler güncellenirken hata oluştu");
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(API_PATHS.NOTIFICATIONS.DELETE(notificationId));

      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );

      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(
        (n) => n._id === notificationId
      );
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      toast.success("Bildirim silindi");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Bildirim silinirken hata oluştu");
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      recipe_like: "❤️",
      recipe_comment: "💬",
      comment_reply: "💭",
      recipe_favorite: "⭐",
      user_follow: "👥",
      collection_follow: "📚",
      recipe_published: "🎉",
      recipe_featured: "⭐",
      comment_like: "👍",
      system_announcement: "📢",
    };
    return icons[type] || "🔔";
  };

  // Format time ago
  const timeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return "Az önce";
    if (diffInMinutes < 60) return `${diffInMinutes}dk`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}s`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}g`;

    return notificationDate.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 sm:hidden"
        onClick={onClose}
      />

      <div className={`absolute right-0 top-12 z-50 ${className}`}>
        <div
          ref={dropdownRef}
          className="w-screen sm:w-96 bg-white sm:rounded-lg shadow-xl border-t sm:border border-gray-200 max-h-[calc(100vh-4rem)] sm:max-h-96 overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                Bildirimler
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-medium px-2 py-1 rounded hover:bg-orange-50 transition-colors"
                  >
                    <span className="hidden sm:inline">
                      Tümünü Okundu İşaretle
                    </span>
                    <span className="sm:hidden">Tümü</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors sm:hidden"
                  aria-label="Close notifications"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="p-8 flex justify-center">
                <ModernLoader size="medium" text="Bildirimler yükleniyor..." />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm">Henüz bildirim yok</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 sm:p-4 transition-colors ${
                      !notification.isRead
                        ? "bg-orange-50 hover:bg-orange-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-lg sm:text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {timeAgo(notification.createdAt)}
                          </span>

                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Okundu işaretle
                            </button>
                          )}
                        </div>

                        {/* Action link */}
                        {notification.link && (
                          <Link
                            to={notification.link}
                            onClick={() => {
                              markAsRead(notification._id);
                              onClose();
                            }}
                            className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
                          >
                            Görüntüle
                          </Link>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label="Delete notification"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Load more button */}
                {hasMore && !loading && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button
                      onClick={loadMore}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Daha fazla yükle
                    </button>
                  </div>
                )}

                {/* Loading more indicator */}
                {loading && notifications.length > 0 && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <ModernLoader size="small" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
