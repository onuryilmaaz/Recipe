import { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { HiChevronDown, HiUser, HiLogout, HiCog } from "react-icons/hi";
import CharAvatar from "./CharAvatar";

const ProfileInfoCard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/");
    setIsOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Profile Image */}
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.name}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full object-cover"
          />
        ) : (
          <CharAvatar
            fullName={user.name || ""}
            widht="w-8 sm:w-10"
            height="h-8 sm:h-10"
            style="text-xs sm:text-sm"
          />
        )}

        {/* User Info - Hidden on mobile */}
        <div className="hidden lg:block text-left">
          <div className="text-sm font-semibold text-black leading-tight">
            {user.name || ""}
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            {user.email || ""}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <HiChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in-up">
          {/* User Info - Show on mobile in dropdown */}
          <div className="lg:hidden px-4 py-3 border-b border-gray-100">
            <div className="text-sm font-semibold text-black">
              {user.name || ""}
            </div>
            <div className="text-xs text-gray-500">{user.email || ""}</div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HiUser className="w-4 h-4" />
              Profil
            </button>

            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HiCog className="w-4 h-4" />
              Ayarlar
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <HiLogout className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoCard;
