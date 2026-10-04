# API Documentation - Authentication

This document outlines the authentication and user management endpoints for the prodesignity-api.

## Base URL
(Assume standard local development URL, e.g., `http://localhost:8000/api`)

---

## Authentication Endpoints

### POST /api/auth/register
Registers a new user. The role is automatically set to `user`.

- **Request Body:**
  ```json
  {
    "fullName": "John Doe",
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

- **Response (201 Created):**
  ```json
  {
    "message": "User registered"
  }
  ```

---

### POST /api/auth/login
Authenticates a user and returns a JWT token.

- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
  *Note: The `token` should be used in the `Authorization` header (`Bearer <token>`) for protected routes.*

---

## Homepage CMS

Homepage marketing copy lives in `homepage_sections` (one row per section).
Admins update JSON via the admin routes; the public site reads it on each request (cached ~60s on the frontend).

### GET /api/homepage
Public. Returns every seeded section.

- **Response (200):**
  ```json
  {
    "sections": {
      "hero": { "label": "Hero", "content": { "...": "..." }, "updatedAt": "..." },
      "pricing": { "label": "Pricing plans", "content": { "...": "..." }, "updatedAt": "..." }
    }
  }
  ```

Section keys: `hero`, `stats`, `brands`, `process`, `recentProjects`, `pricing`, `team`.

### GET /api/homepage/:key
Public. One section by key.

### GET /api/admin/homepage
Admin only. Same payload as public list, plus `keys`.

### PUT /api/admin/homepage/:key
Admin only. Replace a section's JSON object.

- **Request Body:**
  ```json
  {
    "content": { "pill": "Monthly Retainers", "plans": [] },
    "label": "Pricing plans"
  }
  ```
  `label` is optional. `content` must be a JSON object.
