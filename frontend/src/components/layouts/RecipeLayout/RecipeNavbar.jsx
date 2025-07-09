import { useContext, useState, useEffect } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { Link } from "react-router-dom";
import { LuSearch } from "react-icons/lu";
import { BLOG_NAVBAR_DATA } from "../../../utils/data";

import Logo from "../../../assets/logo.png";
import SideMenu from "../SideMenu";
import { UserContext } from "../../../context/userContext";
import ProfileInfoCard from "../../Cards/ProfileInfoCard";
import Login from "../../Auth/Login";
import SignUp from "../../Auth/SignUp";
import Modal from "../../Modal";
import SearchBarPopUp from "../../../pages/Recipe/components/SearchBarPopUp";

const RecipeNavbar = ({ activeMenu }) => {
  const { user, setOpenAuthForm } = useContext(UserContext);
  const [openSideMenu, setOpenSideMenu] = useState(false);
  const [openSearchBar, setOpenSearchBar] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openSideMenu && !event.target.closest(".mobile-menu-container")) {
        setOpenSideMenu(false);
      }
    };

    if (openSideMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
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
      <div className="bg-white border-b border-gray-200/50 backdrop-blur-[2px] py-3 sm:py-4 px-4 sm:px-7 sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between gap-3 sm:gap-5">
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
                src={Logo}
                alt="logo"
                className="h-[28px] sm:h-[30px] md:h-[32px]"
              />
            </Link>
          </div>

          {/* Center - Navigation (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {BLOG_NAVBAR_DATA.map((item, index) => {
              if (item?.onlySideMenu) return null;
              return (
                <Link key={item.id} to={item.path}>
                  <li className="text-[15px] text-black font-medium list-none relative group cursor-pointer py-2">
                    {item.label}
                    <span
                      className={`absolute inset-x-0 bottom-0 h-[2px] bg-orange-500 transition-all duration-300 origin-left ${
                        activeMenu === item.label ? "scale-x-100" : "scale-x-0"
                      } group-hover:scale-x-100`}
                    ></span>
                  </li>
                </Link>
              );
            })}
          </nav>

          {/* Right side - Search & Auth */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
            <button
              className="p-2 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all duration-200 cursor-pointer"
              onClick={() => setOpenSearchBar(true)}
              aria-label="Search"
            >
              <LuSearch className="text-[20px] sm:text-[22px]" />
            </button>

            {!user ? (
              <button
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-xs sm:text-sm font-semibold text-white px-3 sm:px-5 lg:px-7 py-2 rounded-full hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 cursor-pointer whitespace-nowrap"
                onClick={() => setOpenAuthForm(true)}
              >
                <span className="hidden sm:inline">Login/SignUp</span>
                <span className="sm:hidden">Giriş</span>
              </button>
            ) : (
              <div className="hidden md:block">
                <ProfileInfoCard />
              </div>
            )}
          </div>
        </div>
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
              isBlogMenu
              setOpenSideMenu={setOpenSideMenu}
            />
          </div>
        </>
      )}

      <AuthModel />
      <SearchBarPopUp isOpen={openSearchBar} setIsOpen={setOpenSearchBar} />
    </>
  );
};

export default RecipeNavbar;

const AuthModel = () => {
  const { openAuthForm, setOpenAuthForm } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState("login");

  return (
    <Modal
      isOpen={openAuthForm}
      onClose={() => {
        setOpenAuthForm(false);
        setCurrentPage("login");
      }}
      hideHeader
    >
      <div
        className={`w-full mx-auto ${
          currentPage === "login"
            ? "max-w-sm" // Login için daha kompakt
            : "max-w-md" // SignUp için standart boyut
        }`}
      >
        {currentPage === "login" && <Login setCurrentPage={setCurrentPage} />}
        {currentPage === "signup" && <SignUp setCurrentPage={setCurrentPage} />}
      </div>
    </Modal>
  );
};
