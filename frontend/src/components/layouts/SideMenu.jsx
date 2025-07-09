import { BLOG_NAVBAR_DATA, SIDE_MENU_DATA } from "../../utils/data";
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import CharAvatar from "../Cards/CharAvatar";
import { useContext } from "react";
import { UserContext } from "../../context/userContext";

const SideMenu = ({ activeMenu, isBlogMenu, setOpenSideMenu }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }

    if (setOpenSideMenu) {
      setOpenSideMenu(false);
    }
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
    if (setOpenSideMenu) {
      setOpenSideMenu(false);
    }
  };

  return (
    <div className="w-full lg:w-64 h-full lg:h-[calc(100vh-61px)] bg-white lg:border-r border-gray-200/50 p-4 lg:p-5 lg:sticky lg:top-[61px] z-20">
      {user && (
        <div className="flex flex-col items-center justify-center gap-1 mt-3 mb-6 lg:mb-7 pb-4 border-b border-gray-100 lg:border-none">
          {user?.profileImageUrl ? (
            <img
              src={user?.profileImageUrl || ""}
              alt="Profile Image"
              className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-400 rounded-full object-cover"
            />
          ) : (
            <CharAvatar
              fullName={user?.name || ""}
              widht="w-16 lg:w-20"
              height="h-16 lg:h-20"
              style="text-lg lg:text-xl"
            />
          )}
          <div className="text-center">
            <h5 className="text-gray-950 font-semibold leading-6 mt-1 text-sm lg:text-base">
              {user.name || ""}
            </h5>
            <p className="text-xs lg:text-[13px] font-medium text-gray-600 break-all">
              {user.email || ""}
            </p>
          </div>
        </div>
      )}

      <nav className="space-y-1">
        {(isBlogMenu ? BLOG_NAVBAR_DATA : SIDE_MENU_DATA).map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-3 lg:gap-4 text-sm lg:text-[15px] font-medium rounded-lg py-3 px-4 lg:px-6 mb-2 lg:mb-3 cursor-pointer transition-all duration-200 ${
              activeMenu === item.label
                ? "text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-200"
                : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
            }`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-lg lg:text-xl flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}

        {user && (
          <button
            className="w-full flex items-center gap-3 lg:gap-4 text-sm lg:text-[15px] font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg py-3 px-4 lg:px-6 mb-2 lg:mb-3 cursor-pointer transition-all duration-200 mt-4 border-t border-gray-100 pt-6"
            onClick={() => handleLogout()}
          >
            <LuLogOut className="text-lg lg:text-xl flex-shrink-0" />
            <span>Çıkış</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default SideMenu;
