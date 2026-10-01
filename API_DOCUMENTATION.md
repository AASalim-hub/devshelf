# DevShelf API Documentation

> Complete technical and learning reference for the DevShelf REST API.  
> This specification documents all available endpoints, required headers, request payloads, response bodies, and error scenarios.

---

## Table of Contents

1. [API Architecture & Standards](#1-api-architecture--standards)
2. [HTTP Status Codes Reference](#2-http-status-codes-reference)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Endpoints: Health](#4-endpoints-health)
5. [Endpoints: Authentication](#5-endpoints-authentication)
6. [Endpoints: User Profile](#6-endpoints-user-profile)
7. [Endpoints: Developer Resources](#7-endpoints-developer-resources)
8. [Endpoints: Code Snippets](#8-endpoints-code-snippets)
9. [Endpoints: Developer Tasks](#9-endpoints-developer-tasks)
10. [Common Client Errors & Debugging](#10-common-client-errors--debugging)

---

## 1. API Architecture & Standards

### Base URL
- **Local HTTP Development:** `http://localhost:5259`
- **Interactive UI (Scalar):** `http://localhost:5259/scalar/v1`
- **OpenAPI Schema:** `http://localhost:5259/openapi/v1.json`

### Protocol Conventions
- All requests containing a JSON payload must include the header:
  ```http
  Content-Type: application/json
  ```
- All endpoints returning data serialize JSON responses with camelCase keys (`id`, `userName`, `createdAt`).
- All timestamps follow the ISO 8601 UTC standard (e.g., `2026-10-01T20:30:00.000Z`).
- Identifiers for users and records are formatted as standard RFC 4122 GUIDs / UUIDs (e.g., `3fa85f64-5717-4562-b3fc-2c963f66afa6`).

---

## 2. HTTP Status Codes Reference

The backend uses standard HTTP status codes to communicate outcome states:

| Status Code | Meaning | When Returned in DevShelf |
|---|---|---|
| **`200 OK`** | Request succeeded | Successful `GET`, `PUT`, `PATCH`, or `POST /api/auth/login` |
| **`201 Created`** | Resource created | Successful `POST` to `/api/resources`, `/api/snippets`, or `/api/tasks` with a `Location` header pointing to `GetById` |
| **`204 No Content`** | Success with no response body | Successful `DELETE` operation |
| **`400 Bad Request`** | Client sent invalid data | Missing required fields (e.g. empty title or duplicate email) |
| **`401 Unauthorized`** | Missing or invalid auth credentials | Missing Bearer token, expired token, or token signed with wrong key |
| **`404 Not Found`** | Resource does not exist | Specified `{id}` does not exist, or belongs to a different user |

---

## 3. Authentication & Authorization

### The JWT Bearer Scheme
DevShelf uses stateless **JSON Web Tokens (JWT)**.
- When a user logs in via `POST /api/auth/login`, the server generates a cryptographically signed token using HMAC-SHA256.
- The client stores this token and supplies it in the `Authorization` header on all protected requests:

```http
Authorization: Bearer <your_jwt_token_here>
```

### Claim Isolation & Security
Protected controllers do not accept a `userId` in the request body or query string. Instead, the backend extracts the user ID directly from the cryptographic claims encoded inside the token:
```csharp
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```
This guarantees **strict tenant isolation**: User A can never read, modify, or delete records created by User B, even if User A guesses the record's GUID.

---

## 4. Endpoints: Health

### Check API Server Health
Provides a lightweight status check without requiring database queries or authentication.

- **Method:** `GET`
- **Route:** `/api/health`
- **Auth Required:** No

#### Request Headers
```http
Accept: application/json
```

#### Successful Response: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-10-01T20:30:15.123456Z",
  "version": "1.0.0"
}
```

---

## 5. Endpoints: Authentication

### 5.1 Register New User
Registers a new developer account and securely hashes the password using BCrypt.

- **Method:** `POST`
- **Route:** `/api/auth/register`
- **Auth Required:** No

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `userName` | string | Yes | Unique public username |
| `email` | string | Yes | Unique email address used for login |
| `password` | string | Yes | Plain text password (hashed on backend via BCrypt) |

```json
{
  "userName": "alex",
  "email": "alex@example.com",
  "password": "Password123!"
}
```

#### Successful Response: `200 OK`
```json
{
  "message": "Registration successful"
}
```

#### Error Response: `400 Bad Request` (Email Taken)
```json
{
  "error": "Email already taken"
}
```

---

### 5.2 Login User
Authenticates user credentials and returns a signed JWT access token.

- **Method:** `POST`
- **Route:** `/api/auth/login`
- **Auth Required:** No

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Registered account email |
| `password` | string | Yes | Account password |

```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```

#### Successful Response: `200 OK`
```json
{
  "id": "e6fbb11d-b873-4552-824c-97dc71694f4b",
  "userName": "alex",
  "email": "alex@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Response: `400 Bad Request` (Invalid Credentials)
> **Note:** For security purposes, the message does not disclose whether the email or password was the incorrect field.
```json
{
  "error": "Invalid email or password"
}
```

---

## 6. Endpoints: User Profile

### Get Current User Profile
Retrieves the logged-in user's identity details decoded from their active JWT token claims.

- **Method:** `GET`
- **Route:** `/api/profile`
- **Auth Required:** **Yes** (`Bearer <token>`)

#### Request Headers
```http
Authorization: Bearer <your_jwt_token>
Accept: application/json
```

#### Successful Response: `200 OK`
```json
{
  "id": "e6fbb11d-b873-4552-824c-97dc71694f4b",
  "userName": "alex",
  "email": "alex@example.com",
  "fetchedAt": "2026-10-01T20:35:10.512Z"
}
```

#### Error Response: `401 Unauthorized`
Returned if the `Authorization` header is omitted, malformed, or has an expired token.

---

## 7. Endpoints: Developer Resources

Endpoints for bookmarking documentation, tutorials, articles, and dev tools. All endpoints require authentication.

### 7.1 List All Resources
Returns all resources belonging to the authenticated user, ordered from newest to oldest.

- **Method:** `GET`
- **Route:** `/api/resources`
- **Auth Required:** **Yes**

#### Request Headers
```http
Authorization: Bearer <your_jwt_token>
```

#### Successful Response: `200 OK`
```json
[
  {
    "id": "673f4e35-515a-4933-911b-bb990e66c6b4",
    "title": "React 19 Documentation",
    "url": "https://react.dev",
    "notes": "Reference for hooks and actions",
    "type": "docs",
    "userId": "e6fbb11d-b873-4552-824c-97dc71694f4b",
    "createdAt": "2026-10-01T20:25:14.595Z",
    "updatedAt": null
  }
]
```

---

### 7.2 Get Resource by ID
Retrieves a single resource by its GUID. Only succeeds if the record belongs to the calling user.

- **Method:** `GET`
- **Route:** `/api/resources/{id}`
- **Auth Required:** **Yes**

#### URL Parameters
- `id` (GUID, required): The unique identifier of the resource.

#### Successful Response: `200 OK`
```json
{
  "id": "673f4e35-515a-4933-911b-bb990e66c6b4",
  "title": "React 19 Documentation",
  "url": "https://react.dev",
  "notes": "Reference for hooks and actions",
  "type": "docs",
  "userId": "e6fbb11d-b873-4552-824c-97dc71694f4b",
  "createdAt": "2026-10-01T20:25:14.595Z",
  "updatedAt": null
}
```

#### Error Response: `404 Not Found`
```json
{
  "error": "Resource not found"
}
```

---

### 7.3 Create Resource
Creates a new resource attached to the authenticated user.

- **Method:** `POST`
- **Route:** `/api/resources`
- **Auth Required:** **Yes**

#### Request Body
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string | Yes | — | Resource title |
| `url` | string | Yes | — | Complete resource URL |
| `notes` | string | No | `null` | Optional markdown notes / comments |
| `type` | string | No | `"article"` | Category: `article`, `video`, `tool`, `docs`, `other` |

```json
{
  "title": "React 19 Documentation",
  "url": "https://react.dev",
  "notes": "Reference for hooks and actions",
  "type": "docs"
}
```

#### Successful Response: `201 Created`
- Header: `Location: /api/resources/{newId}`
- Body:
```json
{
  "id": "673f4e35-515a-4933-911b-bb990e66c6b4",
  "title": "React 19 Documentation",
  "url": "https://react.dev",
  "notes": "Reference for hooks and actions",
  "type": "docs",
  "userId": "e6fbb11d-b873-4552-824c-97dc71694f4b",
  "createdAt": "2026-10-01T20:25:14.595Z",
  "updatedAt": null
}
```

#### Error Response: `400 Bad Request`
```json
{
  "error": "Title is required"
}
```

---

### 7.4 Update Resource
Updates an existing resource owned by the authenticated user.

- **Method:** `PUT`
- **Route:** `/api/resources/{id}`
- **Auth Required:** **Yes**

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | New title |
| `url` | string | Yes | New URL |
| `notes` | string | No | Updated notes |
| `type` | string | No | Updated category |

```json
{
  "title": "React 19 Official Documentation (Updated)",
  "url": "https://react.dev/learn",
  "notes": "Updated notes with react compiler info",
  "type": "docs"
}
```

#### Successful Response: `200 OK`
```json
{
  "id": "673f4e35-515a-4933-911b-bb990e66c6b4",
  "title": "React 19 Official Documentation (Updated)",
  "url": "https://react.dev/learn",
  "notes": "Updated notes with react compiler info",
  "type": "docs",
  "userId": "e6fbb11d-b873-4552-824c-97dc71694f4b",
  "createdAt": "2026-10-01T20:25:14.595Z",
  "updatedAt": "2026-10-01T20:40:02.120Z"
}
```

---

### 7.5 Delete Resource
Removes a resource belonging to the authenticated user.

- **Method:** `DELETE`
- **Route:** `/api/resources/{id}`
- **Auth Required:** **Yes**

#### Successful Response: `204 No Content`
(Empty response body)

#### Error Response: `404 Not Found`
```json
{
  "error": "Resource not found"
}
```

---

## 8. Endpoints: Code Snippets

Endpoints for storing reusable snippets with programming language metadata and tags.

### 8.1 List All Snippets
- **Method:** `GET`
- **Route:** `/api/snippets`
- **Auth Required:** **Yes**

#### Successful Response: `200 OK`
```json
[
  {
    "id": "3bb6384d-2d4e-4b47-bce4-6ce5cb6a2dfa",
    "title": "EF Core SQLite Registration",
    "description": "Register AppDbContext with SQLite in Program.cs",
    "code": "builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(\"Data Source=devshelf.db\"));",
    "language": "csharp",
    "tags": "dotnet,efcore,sqlite",
    "userId": "e6fbb11d-b873-4552-824c-97dc71694f4b",
    "createdAt": "2026-10-01T20:31:00.000Z",
    "updatedAt": null
  }
]
```

---

### 8.2 Get Snippet by ID
- **Method:** `GET`
- **Route:** `/api/snippets/{id}`
- **Auth Required:** **Yes**

#### Successful Response: `200 OK`
Returns the snippet object.

#### Error Response: `404 Not Found`
```json
{
  "error": "Snippet not found"
}
```

---

### 8.3 Create Snippet
- **Method:** `POST`
- **Route:** `/api/snippets`
- **Auth Required:** **Yes**

#### Request Body
| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `title` | string | Yes | — | Snippet title / name |
| `description` | string | No | `null` | Context or usage explanation |
| `code` | string | Yes | — | Code contents |
| `language` | string | No | `"plaintext"` | Syntax language (`csharp`, `javascript`, `typescript`, `python`, etc.) |
| `tags` | string | No | `null` | Comma-separated tags (e.g., `react,hooks,state`) |

```json
{
  "title": "Axios Auth Interceptor",
  "description": "Attaches Bearer token from localStorage to outgoing requests",
  "code": "api.interceptors.request.use((config) => {\n  const token = localStorage.getItem('token');\n  if (token) config.headers.Authorization = `Bearer ${token}`;\n  return config;\n});",
  "language": "javascript",
  "tags": "axios,react,auth"
}
```

#### Successful Response: `201 Created`
- Header: `Location: /api/snippets/{newId}`
- Body: Snippet Response Object.

---

### 8.4 Update Snippet
- **Method:** `PUT`
- **Route:** `/api/snippets/{id}`
- **Auth Required:** **Yes**

#### Request Body
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Updated title |
| `description` | string | No | Updated description |
| `code` | string | Yes | Updated code |
| `language` | string | No | Updated syntax language |
| `tags` | string | No | Updated tags |

#### Successful Response: `200 OK`
Returns updated Snippet object with new `updatedAt` timestamp.

---

### 8.5 Delete Snippet
- **Method:** `DELETE`
- **Route:** `/api/snippets/{id}`
- **Auth Required:** **Yes**

#### Successful Response: `204 No Content`

---

## 9. Endpoints: Developer Tasks

Endpoints for tracking developer to-do items, progress, priority levels, and project groupings.

### 9.1 List All Tasks (Optional Status Filtering)
Returns user tasks. Supports query string filtering by status.

- **Method:** `GET`
- **Route:** `/api/tasks` or `/api/tasks?status={value}`
- **Auth Required:** **Yes**

#### Query Parameters
| Parameter | Type | Required | Allowed Values | Description |
|---|---|---|---|---|
| `status` | string | No | `todo`, `in-progress`, `done` | Filter tasks by completion state |

#### Example URL
```http
GET /api/tasks?status=todo
```

#### Successful Response: `200 OK`
```json
[
  {
    "id": "787d55c7-df67-4228-86d4-8390bcfc7e01",
    "title": "Build React Login page",
    "description": "Implement form with email/password and call /api/auth/login",
    "status": "todo",
    "priority": "high",
    "project": "DevShelf Frontend",
    "dueDate": "2026-10-15T00:00:00Z",
    "userId": "e6fbb11d-b873-4552-824c-97dc71694f4b",
    "createdAt": "2026-10-01T20:33:00.000Z",
    "updatedAt": null
  }
]
```

---

### 9.2 Get Task by ID
- **Method:** `GET`
- **Route:** `/api/tasks/{id}`
- **Auth Required:** **Yes**

#### Successful Response: `200 OK`
Returns the Task object.

#### Error Response: `404 Not Found`
```json
{
  "error": "Task not found"
}
```

---

### 9.3 Create Task
- **Method:** `POST`
- **Route:** `/api/tasks`
- **Auth Required:** **Yes**

#### Request Body
| Field | Type | Required | Default | Allowed Values / Format |
|---|---|---|---|---|
| `title` | string | Yes | — | Task title |
| `description` | string | No | `null` | Extended instructions |
| `status` | string | No | `"todo"` | `todo`, `in-progress`, `done` |
| `priority` | string | No | `"medium"` | `low`, `medium`, `high` |
| `project` | string | No | `null` | Associated project name |
| `dueDate` | ISO DateTime | No | `null` | e.g. `2026-10-15T00:00:00Z` |

```json
{
  "title": "Configure Axios interceptor",
  "description": "Store token in AuthContext and attach to outgoing requests",
  "status": "todo",
  "priority": "high",
  "project": "DevShelf"
}
```

#### Successful Response: `201 Created`
- Header: `Location: /api/tasks/{newId}`
- Body: Task Response Object.

---

### 9.4 Update Task (Full Replacement)
Replaces all editable fields of an existing task.

- **Method:** `PUT`
- **Route:** `/api/tasks/{id}`
- **Auth Required:** **Yes**

#### Request Body
```json
{
  "title": "Configure Axios interceptor",
  "description": "Store token in AuthContext and attach to outgoing requests",
  "status": "done",
  "priority": "high",
  "project": "DevShelf",
  "dueDate": null
}
```

#### Successful Response: `200 OK`
Returns the updated Task object with an updated `updatedAt` timestamp.

---

### 9.5 Update Task Status Only (Partial Update)
Modifies only the `status` field of a task without modifying its other properties.

- **Method:** `PATCH`
- **Route:** `/api/tasks/{id}/status`
- **Auth Required:** **Yes**

#### Request Body
| Field | Type | Required | Allowed Values |
|---|---|---|---|
| `status` | string | Yes | `todo`, `in-progress`, `done` |

```json
{
  "status": "in-progress"
}
```

#### Successful Response: `200 OK`
Returns the complete updated Task object.

#### Error Response: `400 Bad Request`
```json
{
  "error": "Status is required"
}
```

---

### 9.6 Delete Task
- **Method:** `DELETE`
- **Route:** `/api/tasks/{id}`
- **Auth Required:** **Yes**

#### Successful Response: `204 No Content`

---

## 10. Common Client Errors & Debugging

| Problem | Cause | How to Diagnose & Debug |
|---|---|---|
| **`401 Unauthorized`** | Missing or invalid Bearer token | Verify the `Authorization` header is present with format `Bearer <token>`. Ensure no extra spaces or quotes are around the token string. |
| **`400 Bad Request: "Title is required"`** | Empty or missing required body field | Ensure the JSON payload contains `"title": "your text"` and `Content-Type: application/json` is sent. |
| **`404 Not Found`** | ID does not exist or belongs to another user | Verify you are using a valid GUID returned from a `POST` or `GET` call made by the current user. |
| **CORS Error in Browser** | Calling API from an unauthorized origin | By default, CORS allows `http://localhost:5173`. If running React on a different port, check the `AllowFrontend` CORS policy in `Program.cs`. |
| **Empty Response Array `[]`** | The logged-in user hasn't created any items yet | The endpoint works, but tenant isolation ensures you only see records created by the current account. |

---

## 11. Endpoint Summary Cheatsheet

| Group | Method | Route | Description | Auth |
|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | Service status check | Public |
| **Auth** | `POST` | `/api/auth/register` | Register new user | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate and obtain JWT | Public |
| **Profile** | `GET` | `/api/profile` | Read user claims from token | `Bearer` |
| **Resources** | `GET` | `/api/resources` | List user bookmarks | `Bearer` |
| **Resources** | `GET` | `/api/resources/{id}` | Get single bookmark | `Bearer` |
| **Resources** | `POST` | `/api/resources` | Create bookmark | `Bearer` |
| **Resources** | `PUT` | `/api/resources/{id}` | Update bookmark | `Bearer` |
| **Resources** | `DELETE` | `/api/resources/{id}` | Delete bookmark | `Bearer` |
| **Snippets** | `GET` | `/api/snippets` | List user code snippets | `Bearer` |
| **Snippets** | `GET` | `/api/snippets/{id}` | Get single snippet | `Bearer` |
| **Snippets** | `POST` | `/api/snippets` | Create code snippet | `Bearer` |
| **Snippets** | `PUT` | `/api/snippets/{id}` | Update code snippet | `Bearer` |
| **Snippets** | `DELETE` | `/api/snippets/{id}` | Delete code snippet | `Bearer` |
| **Tasks** | `GET` | `/api/tasks` | List user dev tasks | `Bearer` |
| **Tasks** | `GET` | `/api/tasks?status=...`| Filter tasks by status | `Bearer` |
| **Tasks** | `GET` | `/api/tasks/{id}` | Get single task | `Bearer` |
| **Tasks** | `POST` | `/api/tasks` | Create dev task | `Bearer` |
| **Tasks** | `PUT` | `/api/tasks/{id}` | Update entire task | `Bearer` |
| **Tasks** | `PATCH` | `/api/tasks/{id}/status` | Update task status only | `Bearer` |
| **Tasks** | `DELETE` | `/api/tasks/{id}` | Delete dev task | `Bearer` |
