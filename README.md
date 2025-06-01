# MERN Blog Management System (Backend)

A secure, modular, and production-ready RESTful API built with Node.js, Express, and MongoDB. This backend powers a blog management system featuring:

* **User authentication** (JWT-based)
* **Role-based access control** (admin vs. author)
* **Post management** (create, read, update, delete, publish/draft)
* **Public blog view** (search & pagination)
* **Input validation** (Joi)
* **Security hardening** (Helmet, rate limiting, sanitization)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)

   * [Environment Variables](#environment-variables)
   * [Install Dependencies](#install-dependencies)
   * [Run Locally](#run-locally)
5. [Folder Structure](#folder-structure)
6. [API Documentation](#api-documentation)

   * [Authentication](#authentication)

     * `POST /api/v1/auth/register`
     * `POST /api/v1/auth/login`
     * `GET  /api/v1/auth/me`
   * [Posts](#posts)

     * `GET    /api/v1/posts/public`
     * `GET    /api/v1/posts/:id`
     * `GET    /api/v1/posts`
     * `POST   /api/v1/posts`
     * `PUT    /api/v1/posts/:id`
     * `DELETE /api/v1/posts/:id`
7. [Validation Schemas](#validation-schemas)
8. [Security & Middleware](#security--middleware)

   * [Helmet](#helmet)
   * [Rate Limiting](#rate-limiting)
   * [Sanitization](#sanitization)
   * [Error Handling](#error-handling)
9. [Scripts](#scripts)
10. [Deployment](#deployment)
11. [Contributing](#contributing)
12. [License](#license)

---

## Features

* **Authentication & Authorization**

  * JWT-based login/register
  * Role-based access (admins, authors)
* **CRUD for Posts**

  * Admins can create, update, delete, and view all posts
  * Authors (if role expanded) could view/modify own posts (current setup restricts creation/updating/deletion to admins)
* **Public Blog View**

  * Any user (guest or authenticated) can list published posts with search & pagination
  * Viewing a single post enforces “draft vs. published” logic server-side
* **Input Validation**

  * All request payloads are validated using Joi schemas
* **Security Hardening**

  * Secure headers with Helmet
  * Rate limiting (100 requests per 15 minutes per IP)
  * Request sanitization (NoSQL injection & XSS prevention)
* **Error Handling**

  * Centralized `ErrorResponse` class
  * Consistent JSON error format

---

## Tech Stack

* **Node.js** (v14.x or later)
* **Express**
* **MongoDB** (Mongoose ODM)
* **Joi** (request validation)
* **bcrypt** (password hashing)
* **jsonwebtoken** (JWT generation & verification)
* **Helmet** (HTTP headers security)
* **express-rate-limit** (throttling)
* **express-mongo-sanitize** & **xss-clean** (input sanitization)

---

## Prerequisites

* **Node.js** (>= v14)
* **npm** (>= v6) or **yarn**
* **MongoDB** (local installation or Atlas connection)

---

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mern-blog-system/backend
   ```

2. **Environment Variables**
   Create a `.env` file in the `/backend` directory. Copy from `.env.example` (if provided) or define the following variables:

   ```ini
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mern_blog_system
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=7d
   ```

   * `PORT`: Port on which the server will run (default: 5000).
   * `MONGODB_URI`: MongoDB connection string (local or Atlas).
   * `JWT_SECRET`: Secret key for signing JWTs.
   * `JWT_EXPIRES_IN`: Token expiration (e.g., `7d`, `1h`).

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Run Locally**

   * **Development mode (with nodemon)**

     ```bash
     npm run dev
     ```
   * **Production mode**

     ```bash
     npm start
     ```

   The server will be available at `http://localhost:5000` (unless `PORT` is changed).

---

## Folder Structure

```
/backend
├── src
│   ├── config
│   │   └── db.js                   # MongoDB connection
│   ├── controllers
│   │   ├── authController.js       # Auth endpoints
│   │   └── postController.js       # Post endpoints
│   ├── middlewares
│   │   ├── auth.js                 # protect & authorize
│   │   ├── error.js                # error handler
│   │   ├── rateLimiter.js          # express-rate-limit config
│   │   ├── sanitize.js             # express-mongo-sanitize & xss-clean
│   │   └── validateRequest.js      # Joi validation middleware
│   ├── models
│   │   ├── User.js                 # User schema (Mongoose)
│   │   └── Post.js                 # Post schema (Mongoose)
│   ├── routes
│   │   ├── authRoutes.js           # /api/v1/auth/*
│   │   └── postRoutes.js           # /api/v1/posts/*
│   ├── services
│   │   ├── authService.js          # Business logic for auth
│   │   └── postService.js          # Business logic for posts
│   ├── utils
│   │   └── errorResponse.js        # Custom ErrorResponse class
│   ├── validation
│   │   ├── authSchemas.js          # Joi schemas for auth
│   │   └── postSchemas.js          # Joi schemas for posts
│   ├── app.js                      # Express app config
│   └── server.js                   # Entry point (starts server)
├── .env                            # Environment variables (gitignored)
├── .gitignore
└── package.json
```

---

## API Documentation

All endpoints are prefixed with `/api/v1`. Request and response examples assume `Content-Type: application/json` and, for protected routes, an `Authorization: Bearer <token>` header.

### Authentication

#### Register a New User

* **URL**: `POST /api/v1/auth/register`
* **Description**: Create a new user account.
* **Access**: Public (Rate-limited: max 10 reqs per 15 minutes)

##### Request Body

```jsonc
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "admin"          // Optional; defaults to "author" if omitted
}
```

* `name` (string, required)
* `email` (string, required, valid email)
* `password` (string, required, min length 6)
* `role` (string, optional, one of: `"admin"`, `"author"`)

##### Response (201 Created)

```jsonc
{
  "success": true,
  "token": "<jwt-token>",
  "user": {
    "id": "60a123abc45def67890123ab",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin"
  }
}
```

##### Validation Errors (400 Bad Request)

```jsonc
{
  "success": false,
  "error": "Name is required, Email is required, Password is required"
}
```

---

#### Login User

* **URL**: `POST /api/v1/auth/login`
* **Description**: Authenticate existing user, return JWT.
* **Access**: Public (Rate-limited: max 10 reqs per 15 minutes)

##### Request Body

```jsonc
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

##### Response (200 OK)

```jsonc
{
  "success": true,
  "token": "<jwt-token>",
  "user": {
    "id": "60a123abc45def67890123ab",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin"
  }
}
```

##### Authentication Errors (401 Unauthorized)

```jsonc
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

#### Get Current User

* **URL**: `GET /api/v1/auth/me`
* **Description**: Retrieve authenticated user’s details.
* **Access**: Private (requires `Authorization: Bearer <token>`)

##### Response (200 OK)

```jsonc
{
  "success": true,
  "data": {
    "_id": "60a123abc45def67890123ab",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "admin",
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T12:00:00.000Z"
  }
}
```

---

### Posts

#### List Published Posts (Public)

* **URL**: `GET /api/v1/posts/public`
* **Description**: Retrieve paginated list of all published posts.
* **Access**: Public

##### Query Parameters

| Parameter | Type    | Required | Description                                      |
| --------- | ------- | -------- | ------------------------------------------------ |
| `page`    | integer | No       | Page number (default: 1)                         |
| `limit`   | integer | No       | Items per page (default: 10, max: 100)           |
| `search`  | string  | No       | Full-text search term (searches title + content) |

##### Example

```
GET /api/v1/posts/public?page=2&limit=5&search=javascript
```

##### Response (200 OK)

```jsonc
{
  "success": true,
  "count": 5,
  "page": 2,
  "totalPages": 4,
  "total": 20,
  "data": [
    {
      "_id": "60b234def67a1234567890bc",
      "title": "Understanding Closures in JavaScript",
      "content": "Closures are a fundamental ...",
      "status": "published",
      "publishedAt": "2023-08-15T08:00:00.000Z",
      "author": {
        "_id": "60a123abc45def67890123ab",
        "name": "Alice"
      },
      "createdAt": "2023-08-14T10:00:00.000Z",
      "updatedAt": "2023-08-14T10:00:00.000Z"
    },
    // …4 more posts
  ]
}
```

##### Validation Errors (400 Bad Request)

```jsonc
{
  "success": false,
  "error": "Page must be at least 1, Limit cannot exceed 100"
}
```

---

#### Get Single Post by ID

* **URL**: `GET /api/v1/posts/:id`
* **Description**: Retrieve a single post by its ID.

  * If post is “published,” anyone can view.
  * If post is “draft,” only author or admin can view.
* **Access**: Public (but service enforces draft permissions)

##### URL Parameters

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| `id`      | string | Yes      | 24-character MongoDB ObjectId |

##### Example

```
GET /api/v1/posts/60b234def67a1234567890bc
```

##### Response (200 OK)

```jsonc
{
  "success": true,
  "data": {
    "_id": "60b234def67a1234567890bc",
    "title": "Understanding Closures in JavaScript",
    "content": "Closures are a fundamental ...",
    "status": "published",
    "publishedAt": "2023-08-15T08:00:00.000Z",
    "author": {
      "_id": "60a123abc45def67890123ab",
      "name": "Alice",
      "email": "alice@example.com",
      "role": "admin"
    },
    "createdAt": "2023-08-14T10:00:00.000Z",
    "updatedAt": "2023-08-14T10:00:00.000Z"
  }
}
```

##### Authorization Errors (403 Forbidden)

```jsonc
{
  "success": false,
  "error": "Not authorized to view this post"
}
```

##### Validation Errors (400 Bad Request)

```jsonc
{
  "success": false,
  "error": "Invalid post ID"
}
```

---

#### List All Posts (Author & Admin)

* **URL**: `GET /api/v1/posts`
* **Description**:

  * **Author** (role = “author”): lists only their own posts.
  * **Admin** (role = “admin”): lists all posts.
* **Access**: Private (`Authorization: Bearer <token>`)

##### Response (200 OK)

```jsonc
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60b234def67a1234567890bc",
      "title": "Understanding Closures in JavaScript",
      "content": "Closures are a fundamental ...",
      "status": "published",
      "publishedAt": "2023-08-15T08:00:00.000Z",
      "author": {
        "_id": "60a123abc45def67890123ab",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "createdAt": "2023-08-14T10:00:00.000Z",
      "updatedAt": "2023-08-14T10:00:00.000Z"
    },
    // …more posts
  ]
}
```

---

#### Create a Post (Admin Only)

* **URL**: `POST /api/v1/posts`
* **Description**: Create a new post. Only users with role = “admin” may perform this.
* **Access**: Private (`Authorization: Bearer <token>`)

##### Request Body

```jsonc
{
  "title": "My First Post",
  "content": "Hello world!",
  "status": "published"   // Optional; defaults to "draft"
}
```

* `title` (string, required)
* `content` (string, required)
* `status` (string, optional, one of: `"draft"`, `"published"`; defaults to `"draft"`)

##### Response (201 Created)

```jsonc
{
  "success": true,
  "data": {
    "_id": "60c345efa01b234567890abc",
    "title": "My First Post",
    "content": "Hello world!",
    "status": "published",
    "publishedAt": "2023-09-01T12:00:00.000Z",
    "author": "60a123abc45def67890123ab",
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T12:00:00.000Z"
  }
}
```

##### Authorization Errors (403 Forbidden)

```jsonc
{
  "success": false,
  "error": "User role (author) is not authorized to access this route"
}
```

##### Validation Errors (400 Bad Request)

```jsonc
{
  "success": false,
  "error": "Title is required, Content is required"
}
```

---

#### Update a Post (Admin Only)

* **URL**: `PUT /api/v1/posts/:id`
* **Description**: Update an existing post. Only admins may update. If changing `status` from `"draft"` to `"published"`, `publishedAt` is set automatically.
* **Access**: Private (`Authorization: Bearer <token>`)

##### URL Parameters

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| `id`      | string | Yes      | 24-character MongoDB ObjectId |

##### Request Body (one or more fields)

```jsonc
{
  "title": "Updated Title",          // optional
  "content": "Updated content",      // optional
  "status": "published"              // optional (must be "draft" or "published")
}
```

* At least **one** of `title`, `content`, or `status` must be included.

##### Response (200 OK)

```jsonc
{
  "success": true,
  "data": {
    "_id": "60c345efa01b234567890abc",
    "title": "Updated Title",
    "content": "Updated content",
    "status": "published",
    "publishedAt": "2023-09-01T14:00:00.000Z",
    "author": "60a123abc45def67890123ab",
    "createdAt": "2023-09-01T12:00:00.000Z",
    "updatedAt": "2023-09-01T14:00:00.000Z"
  }
}
```

##### Authorization Errors (403 Forbidden)

```jsonc
{
  "success": false,
  "error": "User role (author) is not authorized to access this route"
}
```

##### Validation Errors (400 Bad Request)

```jsonc
{
  "success": false,
  "error": "If provided, title cannot be empty"
}
```

---

#### Delete a Post (Admin Only)

* **URL**: `DELETE /api/v1/posts/:id`
* **Description**: Permanently delete a post. Only admins may delete.
* **Access**: Private (`Authorization: Bearer <token>`)

##### URL Parameters

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| `id`      | string | Yes      | 24-character MongoDB ObjectId |

##### Response (200 OK)

```jsonc
{
  "success": true,
  "data": {}
}
```

##### Authorization Errors (403 Forbidden)

```jsonc
{
  "success": false,
  "error": "User role (author) is not authorized to access this route"
}
```

##### Validation Errors (400 Bad Request)

```jsonc
{
  "success": false,
  "error": "Invalid post ID"
}
```

---

## Validation Schemas

All request validation is handled via **Joi** in `src/validation`. Key schemas include:

* **`authSchemas.js`**

  * `registerSchema`: name (required), email (required, valid), password (required, min 6), optional role (`"admin"`|`"author"`)
  * `loginSchema`: email (required, valid), password (required)

* **`postSchemas.js`**

  * `getPostParamsSchema`: `id` must be 24‐char hex string
  * `createPostSchema`: `title` (required), `content` (required), optional `status` (`"draft"`|`"published"`)
  * `updatePostSchema`: optional `title`, `content`, `status` (must be valid) with `.or('title', 'content', 'status')` to ensure at least one field
  * `getPublicPostsQuerySchema`: optional `page` (integer ≥1), optional `limit` (integer 1–100), optional `search` (string)

---

## Security & Middleware

### Helmet

* **Location**: Mounted globally in `src/app.js` via `app.use(helmet())`.
* **Purpose**: Sets common HTTP headers to protect against well-known web vulnerabilities (e.g., `X-Frame-Options`, `Strict-Transport-Security`).

### Rate Limiting

* **Location**: `src/middlewares/rateLimiter.js` (configured with `windowMs = 15 minutes`, `max = 100 requests`).
* **Usage**:

  * Globally: `app.use(apiLimiter)` limits every incoming request.
  * Or per-route: applied to auth & post‐creation endpoints (e.g., `router.post('/register', apiLimiter, ...)`).
* **Response**: HTTP 429 with JSON:

  ```jsonc
  {
    "success": false,
    "error": "Too many requests from this IP, please try again after 15 minutes"
  }
  ```

### Sanitization

* **Location**: `src/middlewares/sanitize.js`
* **Components**:

  * `express-mongo-sanitize()`: Removes any keys containing `$` or `.` to prevent NoSQL injections.
  * `xssClean()`: Sanitizes user input to prevent XSS (removes `<script>` tags, etc.).
* **Usage**: Applied globally via `app.use(sanitizeRequest)` in `app.js`.

### Error Handling

* **Centralized Handler**: `src/middlewares/error.js`

  * Catches all `ErrorResponse` (custom errors) and Mongoose errors.
  * Returns consistent JSON:

    ```jsonc
    {
      "success": false,
      "error": "Human-readable message"
    }
    ```
  * Handles:

    * Invalid ObjectId (`CastError`) → 404
    * Duplicate key (`11000`) → 400
    * Validation errors (`ValidationError`) → 400

---

## Scripts

In `package.json`, the following scripts are defined:

```jsonc
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "lint": "eslint . --ext .js",
  "lint:fix": "eslint . --ext .js --fix"
}
```

* **`npm run dev`**: Start server in development mode with nodemon (auto‐restart on file changes).
* **`npm start`**: Run server in production mode.
* **`npm run lint` / `npm run lint:fix`**: Lint code using ESLint (if configured).

---

## Deployment

1. **Set Environment Variables** on your hosting platform (e.g., Heroku, DigitalOcean, AWS):

   * `MONGODB_URI` (pointing to a production MongoDB Atlas cluster)
   * `JWT_SECRET` (secure secret string)
   * `JWT_EXPIRES_IN` (e.g., `7d`)
   * `NODE_ENV=production`
   * `PORT` (if required; e.g., `5000`)

2. **Deploy Steps** (Heroku example):

   ```bash
   heroku create mern-blog-backend
   heroku config:set MONGODB_URI=<your-production-mongodb-uri>
   heroku config:set JWT_SECRET=<your-secret>
   heroku config:set JWT_EXPIRES_IN=7d
   heroku config:set NODE_ENV=production
   git push heroku develop:main
   ```

3. **Verify** the server is live, then update your frontend’s `REACT_APP_API_URL` to point to the production backend URL.

---

## Contributing

1. **Fork** the repository.
2. **Create** a new branch:

   ```bash
   git checkout -b feat/your-feature
   ```
3. **Implement** your changes, following existing code style.
4. **Validate** new routes with appropriate Joi schemas and add unit tests (if available).
5. **Commit** your changes (`git commit -m "feat: description"`).
6. **Push** to your fork (`git push origin feat/your-feature`).
7. **Open** a Pull Request with a clear description of your changes.

Please ensure that your code follows the existing folder structure, uses services for business logic, and includes validation & security considerations.

---

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute as per the terms.
