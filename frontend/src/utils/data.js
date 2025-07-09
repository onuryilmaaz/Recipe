import {
  LuLayoutDashboard,
  LuGalleryVerticalEnd,
  LuMessageSquareQuote,
  LuLayoutTemplate,
  LuTag,
} from "react-icons/lu";
import { FaHeart, FaBookmark, FaUsers, FaShieldAlt } from "react-icons/fa";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Panel",
    icon: LuLayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    id: "02",
    label: "Tarifler",
    icon: LuGalleryVerticalEnd,
    path: "/admin/recipes",
  },
  {
    id: "03",
    label: "Yorumlar",
    icon: LuMessageSquareQuote,
    path: "/admin/comments",
  },
  {
    id: "04",
    label: "Kullanıcılar",
    icon: FaUsers,
    path: "/admin/users",
  },
  {
    id: "05",
    label: "Moderasyon",
    icon: FaShieldAlt,
    path: "/admin/moderation",
  },
];

export const BLOG_NAVBAR_DATA = [
  {
    id: "01",
    label: "Ana Sayfa",
    icon: LuLayoutTemplate,
    path: "/",
  },
  {
    id: "02",
    label: "Favorilerim",
    icon: FaHeart,
    path: "/favorites",
  },
  {
    id: "03",
    label: "Koleksiyonlarım",
    icon: FaBookmark,
    path: "/collections",
  },
];
