import { useState, useContext, useEffect } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { BiBell } from "react-icons/bi";
import SideMenu from "./SideMenu";
import NotificationDropdown from "../NotificationDropdown";
import { UserContext } from "../../context/userContext";
import axios from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

import LOGO from "../../assets/logo.png";
import { Link } from "react-router-dom";

const Navbar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(UserContext);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await axios.get(API_PATHS.NOTIFICATIONS.GET_UNREAD_COUNT);
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch unread count on component mount and set up polling
  useEffect(() => {
    if (user) {
      fetchUnreadCount();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openSideMenu && !event.target.closest(".mobile-menu-container")) {
        setOpenSideMenu(false);
      }
    };

    if (openSideMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent body scroll when menu is open
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [openSideMenu]);

  return (
    <>
      <div className="flex items-center justify-between gap-3 sm:gap-5 bg-white border-b border-gray-200/50 backdrop-blur-[2px] py-3 sm:py-4 px-4 sm:px-7 sticky top-0 z-30">
        {/* Left side - Menu & Logo */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            className="block lg:hidden text-black p-1 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => {
              setOpenSideMenu(!openSideMenu);
            }}
            aria-label="Toggle menu"
          >
            {openSideMenu ? (
              <HiOutlineX className="text-xl sm:text-2xl" />
            ) : (
              <HiOutlineMenu className="text-xl sm:text-2xl" />
            )}
          </button>
          <Link to="/" className="flex-shrink-0">
            <img
              src={LOGO}
              alt="logo"
              className="h-[22px] sm:h-[24px] md:h-[26px]"
            />
          </Link>
        </div>

        {/* Right side - Notifications (only if user is logged in) */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
              aria-label="Notifications"
            >
              {/* Bell Icon - Fixed */}
              <BiBell className="w-5 h-5 sm:w-6 sm:h-6" />

              {/* Unread count badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {openSideMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setOpenSideMenu(false)}
          />

          {/* Mobile Menu */}
          <div className="mobile-menu-container fixed top-[57px] sm:top-[61px] left-0 right-0 bottom-0 bg-white z-50 lg:hidden overflow-y-auto">
            <SideMenu
              activeMenu={activeMenu}
              setOpenSideMenu={setOpenSideMenu}
            />
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
