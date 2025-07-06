// Strapi Configuration
export const STRAPI_CONFIG = {
  // Set to true to use Strapi, false to use local JSON data
  USE_STRAPI: false, // Change this to true when you have Strapi running

  // Strapi server URL
  STRAPI_URL: "http://localhost:1337",

  // API token for authenticated requests (optional)
  API_TOKEN: "",

  // Admin token for admin operations (optional)
  ADMIN_TOKEN: "",

  // Content types
  CONTENT_TYPES: {
    POSTS: "posts",
    CATEGORIES: "categories",
    USERS: "users",
    COMMENTS: "comments",
  },

  // API endpoints
  ENDPOINTS: {
    POSTS: "/api/posts",
    CATEGORIES: "/api/categories",
    USERS: "/api/users",
    COMMENTS: "/api/comments",
    UPLOAD: "/api/upload",
  },
};

// Helper function to get full API URL
export const getStrapiURL = (endpoint) => {
  return `${STRAPI_CONFIG.STRAPI_URL}${endpoint}`;
};

// Helper function to get headers with authentication
export const getStrapiHeaders = (includeAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth && STRAPI_CONFIG.API_TOKEN) {
    headers["Authorization"] = `Bearer ${STRAPI_CONFIG.API_TOKEN}`;
  }

  return headers;
};
