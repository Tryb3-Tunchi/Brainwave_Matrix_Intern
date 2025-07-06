import {
  STRAPI_CONFIG,
  getStrapiURL,
  getStrapiHeaders,
} from "../config/strapi";

class StrapiService {
  constructor() {
    this.baseURL = STRAPI_CONFIG.STRAPI_URL;
    this.apiToken = STRAPI_CONFIG.API_TOKEN;
  }

  // Helper method to make API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Add API token if available
    if (this.apiToken) {
      defaultHeaders["Authorization"] = `Bearer ${this.apiToken}`;
    }

    const config = {
      headers: defaultHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Strapi API Error:", error);
      throw error;
    }
  }

  // Get all blog posts
  async getAllPosts(params = {}) {
    const queryParams = new URLSearchParams();

    // Add pagination
    if (params.page) queryParams.append("pagination[page]", params.page);
    if (params.pageSize)
      queryParams.append("pagination[pageSize]", params.pageSize);

    // Add sorting
    if (params.sort) queryParams.append("sort", params.sort);

    // Add filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        queryParams.append(`filters[${key}][$contains]`, value);
      });
    }

    // Add populate for relations
    queryParams.append("populate", "*");

    const endpoint = `/posts?${queryParams.toString()}`;
    const response = await this.makeRequest(endpoint);

    return response.data.map((item) => this.formatPost(item));
  }

  // Get a single post by ID
  async getPostById(id) {
    const endpoint = `/posts/${id}?populate=*`;
    const response = await this.makeRequest(endpoint);

    return this.formatPost(response.data);
  }

  // Get posts by category
  async getPostsByCategory(category, params = {}) {
    const filters = { ...params.filters, category };
    return this.getAllPosts({ ...params, filters });
  }

  // Search posts
  async searchPosts(query, params = {}) {
    const filters = {
      $or: [
        { title: { $contains: query } },
        { content: { $contains: query } },
        { excerpt: { $contains: query } },
      ],
    };

    return this.getAllPosts({ ...params, filters });
  }

  // Get categories
  async getCategories() {
    const endpoint = "/categories?populate=*";
    const response = await this.makeRequest(endpoint);

    return response.data.map((category) => ({
      id: category.id,
      name: category.attributes.name,
      slug: category.attributes.slug,
      count: category.attributes.posts?.data?.length || 0,
    }));
  }

  // Create a new post
  async createPost(postData) {
    const endpoint = "/posts";
    const response = await this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({
        data: {
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          slug: this.generateSlug(postData.title),
          category: postData.category,
          tags: postData.tags,
          author: postData.authorId,
          coverImage: postData.coverImage,
          publishedAt: new Date().toISOString(),
        },
      }),
    });

    return this.formatPost(response.data);
  }

  // Update a post
  async updatePost(id, updates) {
    const endpoint = `/posts/${id}`;
    const response = await this.makeRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify({
        data: updates,
      }),
    });

    return this.formatPost(response.data);
  }

  // Delete a post
  async deletePost(id) {
    const endpoint = `/posts/${id}`;
    await this.makeRequest(endpoint, {
      method: "DELETE",
    });

    return { success: true };
  }

  // Get popular posts (by likes or views)
  async getPopularPosts(limit = 5) {
    return this.getAllPosts({
      sort: "likes:desc",
      pageSize: limit,
    });
  }

  // Get recent posts
  async getRecentPosts(limit = 5) {
    return this.getAllPosts({
      sort: "publishedAt:desc",
      pageSize: limit,
    });
  }

  // Format Strapi response to match our app structure
  formatPost(strapiPost) {
    const attributes = strapiPost.attributes;

    return {
      id: strapiPost.id,
      title: attributes.title,
      content: attributes.content,
      excerpt: attributes.excerpt,
      slug: attributes.slug,
      author: attributes.author?.data?.attributes?.username || "Unknown Author",
      authorId: attributes.author?.data?.id,
      authorAvatar:
        attributes.author?.data?.attributes?.avatar?.data?.attributes?.url ||
        `https://ui-avatars.com/api/?name=${
          attributes.author?.data?.attributes?.username || "User"
        }&background=random`,
      createdAt: attributes.publishedAt || attributes.createdAt,
      updatedAt: attributes.updatedAt,
      tags: attributes.tags || [],
      category: attributes.category || "Uncategorized",
      likes: attributes.likes || 0,
      comments: attributes.comments?.data?.length || 0,
      readTime: this.calculateReadTime(attributes.content),
      coverImage:
        attributes.coverImage?.data?.attributes?.url ||
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
    };
  }

  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  }

  // Calculate read time
  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }

  // Upload image to Strapi
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("files", file);

    const endpoint = "/upload";
    const response = await this.makeRequest(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: formData,
    });

    return response[0]; // Return the first uploaded file
  }
}

export default new StrapiService();
