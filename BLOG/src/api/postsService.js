import postsData from "../data/posts.json";
import strapiService from "./strapiService";
import { STRAPI_CONFIG } from "../config/strapi";

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class PostsService {
  constructor() {
    this.posts = [...postsData.posts];
    this.useStrapi = STRAPI_CONFIG.USE_STRAPI;
  }

  // Get all posts
  async getAllPosts(params = {}) {
    if (this.useStrapi) {
      try {
        return await strapiService.getAllPosts(params);
      } catch (error) {
        console.warn("Strapi unavailable, falling back to local data:", error);
        return this.getLocalPosts(params);
      }
    }
    return this.getLocalPosts(params);
  }

  // Get post by ID
  async getPostById(id) {
    if (this.useStrapi) {
      try {
        return await strapiService.getPostById(id);
      } catch (error) {
        console.warn("Strapi unavailable, falling back to local data:", error);
        return this.getLocalPostById(id);
      }
    }
    return this.getLocalPostById(id);
  }

  // Get posts by category
  async getPostsByCategory(category, params = {}) {
    if (this.useStrapi) {
      try {
        return await strapiService.getPostsByCategory(category, params);
      } catch (error) {
        console.warn("Strapi unavailable, falling back to local data:", error);
        return this.getLocalPostsByCategory(category, params);
      }
    }
    return this.getLocalPostsByCategory(category, params);
  }

  // Get posts by author
  async getPostsByAuthor(authorId) {
    if (this.useStrapi) {
      try {
        return await strapiService.getAllPosts({
          filters: { author: authorId },
        });
      } catch (error) {
        console.warn("Strapi unavailable, falling back to local data:", error);
        return this.getLocalPostsByAuthor(authorId);
      }
    }
    return this.getLocalPostsByAuthor(authorId);
  }

  // Search posts
  async searchPosts(query, params = {}) {
    if (this.useStrapi) {
      try {
        return await strapiService.searchPosts(query, params);
      } catch (error) {
        console.warn("Strapi unavailable, falling back to local data:", error);
        return this.getLocalSearchPosts(query, params);
      }
    }
    return this.getLocalSearchPosts(query, params);
  }

  // Create new post
  async createPost(postData) {
    if (this.useStrapi) {
      try {
        return await strapiService.createPost(postData);
      } catch (error) {
        console.warn(
          "Strapi unavailable, falling back to local creation:",
          error
        );
        return this.createLocalPost(postData);
      }
    }
    return this.createLocalPost(postData);
  }

  // Update post
  async updatePost(id, updates) {
    if (this.useStrapi) {
      try {
        return await strapiService.updatePost(id, updates);
      } catch (error) {
        console.warn(
          "Strapi unavailable, falling back to local update:",
          error
        );
        return this.updateLocalPost(id, updates);
      }
    }
    return this.updateLocalPost(id, updates);
  }

  // Delete post
  async deletePost(id) {
    if (this.useStrapi) {
      try {
        return await strapiService.deletePost(id);
      } catch (error) {
        console.warn(
          "Strapi unavailable, falling back to local deletion:",
          error
        );
        return this.deleteLocalPost(id);
      }
    }
    return this.deleteLocalPost(id);
  }

  // Get categories
  async getCategories() {
    if (this.useStrapi) {
      try {
        return await strapiService.getCategories();
      } catch (error) {
        console.warn(
          "Strapi unavailable, falling back to local categories:",
          error
        );
        return this.getLocalCategories();
      }
    }
    return this.getLocalCategories();
  }

  // Get popular posts
  async getPopularPosts(limit = 5) {
    if (this.useStrapi) {
      try {
        return await strapiService.getPopularPosts(limit);
      } catch (error) {
        console.warn(
          "Strapi unavailable, falling back to local popular posts:",
          error
        );
        return this.getLocalPopularPosts(limit);
      }
    }
    return this.getLocalPopularPosts(limit);
  }

  // Get recent posts
  async getRecentPosts(limit = 5) {
    if (this.useStrapi) {
      try {
        return await strapiService.getRecentPosts(limit);
      } catch (error) {
        console.warn(
          "Strapi unavailable, falling back to local recent posts:",
          error
        );
        return this.getLocalRecentPosts(limit);
      }
    }
    return this.getLocalRecentPosts(limit);
  }

  // Like a post
  async likePost(id) {
    if (this.useStrapi) {
      try {
        return await strapiService.updatePost(id, { likes: { increment: 1 } });
      } catch (error) {
        console.warn("Strapi unavailable, falling back to local like:", error);
        return this.likeLocalPost(id);
      }
    }
    return this.likeLocalPost(id);
  }

  // Upload image
  async uploadImage(file) {
    if (this.useStrapi) {
      try {
        return await strapiService.uploadImage(file);
      } catch (error) {
        console.warn("Strapi unavailable, image upload failed:", error);
        throw error;
      }
    }
    // For local development, return a mock URL
    return { url: URL.createObjectURL(file) };
  }

  // ===== LOCAL DATA METHODS (Fallback) =====

  async getLocalPosts(params = {}) {
    await delay(500);
    let filteredPosts = [...this.posts];

    // Apply sorting
    if (params.sort) {
      const [field, order] = params.sort.split(":");
      filteredPosts.sort((a, b) => {
        if (order === "desc") {
          return b[field] - a[field];
        }
        return a[field] - b[field];
      });
    } else {
      // Default sort by date
      filteredPosts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    // Apply pagination
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      filteredPosts = filteredPosts.slice(start, end);
    }

    return filteredPosts;
  }

  getLocalPostById(id) {
    return this.posts.find((post) => post.id === parseInt(id));
  }

  getLocalPostsByCategory(category) {
    return this.posts.filter((post) => post.category === category);
  }

  getLocalPostsByAuthor(authorId) {
    return this.posts.filter((post) => post.authorId === authorId);
  }

  getLocalSearchPosts(query) {
    const lowercaseQuery = query.toLowerCase();
    return this.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowercaseQuery) ||
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.author.toLowerCase().includes(lowercaseQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  createLocalPost(postData) {
    const newPost = {
      id: Date.now(),
      ...postData,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      readTime: this.calculateReadTime(postData.content),
    };
    this.posts.unshift(newPost);
    return newPost;
  }

  updateLocalPost(id, updates) {
    const index = this.posts.findIndex((post) => post.id === parseInt(id));
    if (index !== -1) {
      this.posts[index] = { ...this.posts[index], ...updates };
      return this.posts[index];
    }
    throw new Error("Post not found");
  }

  deleteLocalPost(id) {
    const index = this.posts.findIndex((post) => post.id === parseInt(id));
    if (index !== -1) {
      const deletedPost = this.posts.splice(index, 1)[0];
      return deletedPost;
    }
    throw new Error("Post not found");
  }

  getLocalCategories() {
    const categories = [...new Set(this.posts.map((post) => post.category))];
    return categories.map((category) => ({
      name: category,
      count: this.posts.filter((post) => post.category === category).length,
    }));
  }

  getLocalPopularPosts(limit = 5) {
    return this.posts.sort((a, b) => b.likes - a.likes).slice(0, limit);
  }

  getLocalRecentPosts(limit = 5) {
    return this.posts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  likeLocalPost(id) {
    const post = this.posts.find((post) => post.id === parseInt(id));
    if (post) {
      post.likes += 1;
      return post;
    }
    throw new Error("Post not found");
  }

  calculateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  }
}

export default new PostsService();
