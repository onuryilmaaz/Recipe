export const BASE_URL = "http://localhost:8080";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
  DASHBOARD: {
    GET_DASHBOARD_DATA: "/api/dashboard-summary",
  },
  AI: {
    GENERATE_BLOG_POST: "/api/ai/generate",
    GENERATE_FROM_INGREDIENTS: "/api/ai/generate-from-ingredients",
    GENERATE_FROM_TITLE: "/api/ai/generate-from-title",
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
};
