import {
  LuLayoutDashboard,
  LuGalleryVerticalEnd,
  LuMessageSquareQuote,
  LuLayoutTemplate,
  LuTag,
} from "react-icons/lu";

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
];

export const BLOG_NAVBAR_DATA = [
  {
    id: "01",
    label: "Ana Sayfa",
    icon: LuLayoutTemplate,
    path: "/",
  },
];
