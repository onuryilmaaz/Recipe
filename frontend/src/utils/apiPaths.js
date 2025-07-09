export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
    FOLLOW: (userId) => `/api/auth/follow/${userId}`,
    CHECK_FOLLOW: (userId) => `/api/auth/following/${userId}`,
    GET_USER: (userId) => `/api/auth/user/${userId}`,
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
  DASHBOARD: {
    GET_DASHBOARD_DATA: "/api/dashboard-summary",
  },
  AI: {
    GENERATE_FROM_INGREDIENTS: "/api/ai/generate-from-ingredients",
    GENERATE_FROM_TITLE: "/api/ai/generate-from-title",
    GENERATE_COMMENT_REPLY: "/api/ai/generate-comment-reply",
  },
  RECIPE: {
    CREATE: "/api/recipes",
    GET_ALL: "/api/recipes",
    GET_TRENDING_RECIPE: "/api/recipes/trending",
    GET_BY_SLUG: (slug) => `/api/recipes/slug/${slug}`,
    UPDATE: (id) => `/api/recipes/${id}`,
    DELETE: (id) => `/api/recipes/${id}`,
    GET_BY_TAG: (tag) => `/api/recipes/tag/${tag}`,
    SEARCH: "/api/recipes/search",
    INCREMENT_VIEW: (id) => `/api/recipes/${id}/view`,
    LIKE: (id) => `/api/recipes/${id}/like`,
  },
  COMMENTS: {
    ADD: (recipeId) => `/api/comments/${recipeId}`,
    GET_ALL: "/api/comments",
    GET_ALL_BY_POST: (recipeId) => `/api/comments/${recipeId}`,
    UPDATE: (commentId) => `/api/comments/${commentId}`,
    DELETE: (commentId) => `/api/comments/${commentId}`,
  },
  FAVORITES: {
    GET_ALL: "/api/favorites",
    TOGGLE: (recipeId) => `/api/favorites/toggle/${recipeId}`,
    CHECK: (recipeId) => `/api/favorites/check/${recipeId}`,
  },
  RATINGS: {
    GET_ALL: (recipeId) => `/api/ratings/${recipeId}`,
    ADD_UPDATE: (recipeId) => `/api/ratings/${recipeId}`,
    GET_USER: (recipeId) => `/api/ratings/${recipeId}/user`,
    DELETE: (recipeId) => `/api/ratings/${recipeId}`,
  },
  COLLECTIONS: {
    CREATE: "/api/collections",
    GET_MY: "/api/collections/my",
    GET_PUBLIC: "/api/collections/public",
    GET_BY_SLUG: (slug) => `/api/collections/${slug}`,
    UPDATE: (id) => `/api/collections/${id}`,
    DELETE: (id) => `/api/collections/${id}`,
    ADD_RECIPE: (id, recipeId) => `/api/collections/${id}/recipes/${recipeId}`,
    REMOVE_RECIPE: (id, recipeId) =>
      `/api/collections/${id}/recipes/${recipeId}`,
  },
  NOTIFICATIONS: {
    GET_ALL: "/api/notifications",
    GET_UNREAD_COUNT: "/api/notifications/unread-count",
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/read-all",
    DELETE: (id) => `/api/notifications/${id}`,
  },
};
