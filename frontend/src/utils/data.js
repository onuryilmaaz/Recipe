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
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    id: "02",
    label: "Recipes",
    icon: LuGalleryVerticalEnd,
    path: "/admin/recipes",
  },
  {
    id: "03",
    label: "Comments",
    icon: LuMessageSquareQuote,
    path: "/admin/comments",
  },
];

export const BLOG_NAVBAR_DATA = [
  {
    id: "01",
    label: "Home",
    icon: LuLayoutTemplate,
    path: "/",
  },
  {
    id: "02",
    label: "Tavuk",
    icon: LuTag,
    path: "/tag/Vegan",
  },
  {
    id: "03",
    label: "Sebze",
    icon: LuTag,
    path: "/tag/Sebze",
  },
];
