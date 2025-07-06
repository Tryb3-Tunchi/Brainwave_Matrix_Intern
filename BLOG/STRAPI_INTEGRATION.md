# Strapi Integration Guide

This guide explains how to integrate Strapi CMS with your React blogging platform.

## 🚀 Quick Start

### 1. Install Strapi

```bash
# Create a new Strapi project
npx create-strapi-app@latest my-blog-backend --quickstart

# Or install in an existing directory
npx create-strapi-app@latest my-blog-backend
```

### 2. Configure Strapi Content Types

#### Create Post Content Type

1. Go to Strapi Admin Panel (`http://localhost:1337/admin`)
2. Navigate to **Content-Type Builder**
3. Create a new **Collection Type** called `Post`
4. Add the following fields:

```
Title (Text - Short text)
Content (Rich text)
Excerpt (Text - Long text)
Slug (Text - Short text, unique)
Category (Text - Short text)
Tags (JSON)
Likes (Number - Integer)
Cover Image (Media - Single media)
Author (Relation - Many to one with User)
Published At (DateTime)
```

#### Create Category Content Type

1. Create a new **Collection Type** called `Category`
2. Add the following fields:

```
Name (Text - Short text)
Slug (Text - Short text, unique)
Description (Text - Long text)
```

### 3. Configure Permissions

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles**
2. Select **Public** role
3. Enable the following permissions for **Post**:
   - `find`
   - `findOne`
4. Enable the following permissions for **Category**:
   - `find`
   - `findOne`

### 4. Update Configuration

Edit `src/config/strapi.js`:

```javascript
export const STRAPI_CONFIG = {
  // Set to true to use Strapi
  USE_STRAPI: true,

  // Your Strapi server URL
  STRAPI_URL: "http://localhost:1337",

  // API token (optional, for authenticated requests)
  API_TOKEN: "your_api_token_here",

  // ... rest of config
};
```

### 5. Generate API Token (Optional)

1. Go to **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Set:
   - Name: `Blog Frontend`
   - Description: `Token for blog frontend`
   - Token duration: `Unlimited`
   - Token type: `Read-only`
4. Copy the token and add it to your config

## 📝 Content Management

### Adding Blog Posts

1. Go to **Content Manager** → **Post**
2. Click **Create new entry**
3. Fill in the required fields:
   - Title
   - Content (use the rich text editor)
   - Excerpt
   - Category
   - Tags (as JSON array: `["React", "JavaScript"]`)
   - Cover Image (upload or select)
   - Author (select from users)
4. Click **Save** and **Publish**

### Managing Categories

1. Go to **Content Manager** → **Category**
2. Create categories like:
   - Development
   - Design
   - Technology
   - Backend

## 🔧 Advanced Configuration

### Custom API Endpoints

You can extend the Strapi API by creating custom controllers:

```javascript
// api/post/controllers/post.js
module.exports = {
  async custom(ctx) {
    // Your custom logic
    return { message: "Custom endpoint" };
  },
};
```

### Media Upload Configuration

Configure media upload in `config/plugins.js`:

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "cloudinary",
      providerOptions: {
        cloud_name: env("CLOUDINARY_NAME"),
        api_key: env("CLOUDINARY_KEY"),
        api_secret: env("CLOUDINARY_SECRET"),
      },
    },
  },
});
```

### Environment Variables

Create `.env` file in your Strapi project:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
```

## 🚀 Deployment

### Deploy Strapi to Production

1. **Heroku**:

   ```bash
   heroku create your-strapi-app
   git push heroku main
   ```

2. **DigitalOcean**:

   - Use the Strapi one-click app
   - Or deploy manually with Docker

3. **Vercel**:
   - Strapi doesn't work well with Vercel
   - Use Railway or Render instead

### Update Frontend Configuration

After deploying Strapi, update your frontend config:

```javascript
export const STRAPI_CONFIG = {
  USE_STRAPI: true,
  STRAPI_URL: "https://your-strapi-app.herokuapp.com",
  API_TOKEN: "your_production_token",
};
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:

   - Go to **Settings** → **Global Settings** → **Security**
   - Add your frontend URL to CORS origins

2. **Permission Denied**:

   - Check role permissions in **Users & Permissions**
   - Ensure Public role has necessary permissions

3. **Media Not Loading**:

   - Check media upload configuration
   - Verify file permissions on server

4. **API Not Responding**:
   - Check Strapi server logs
   - Verify database connection
   - Ensure all required fields are filled

### Debug Mode

Enable debug mode in Strapi:

```javascript
// config/server.js
module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env("PUBLIC_URL", "http://localhost:1337"),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
  logger: {
    level: "debug",
  },
});
```

## 📚 Additional Resources

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi API Reference](https://docs.strapi.io/dev-docs/api/rest)
- [Strapi Admin Panel](https://docs.strapi.io/dev-docs/admin-panel-customization)
- [Strapi Deployment Guide](https://docs.strapi.io/dev-docs/deployment)

## 🎯 Next Steps

1. Set up user authentication with Strapi
2. Add comment functionality
3. Implement image optimization
4. Add search and filtering
5. Set up webhooks for real-time updates
