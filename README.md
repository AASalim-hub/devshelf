# DevShelf 🗂️

> A developer learning application and personal resource shelf. Save, organize, and access your developer bookmarks, documentation links, and learning materials — all backed by a clean REST API.

![Status](https://img.shields.io/badge/status-active%20learning%20project-brightgreen?style=flat-square)
![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=flat-square&logo=dotnet)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![OpenAPI](https://img.shields.io/badge/OpenAPI-Scalar-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Overview & Teaching Purpose

**DevShelf** is an engineering and teaching project designed to help students master:
1. **REST APIs & HTTP fundamentals** (Methods, URLs, Headers, Status Codes, Request/Response Bodies).
2. **Interactive API Documentation** (Exploring endpoints via Scalar / OpenAPI).
3. **API Testing with Postman** (Testing endpoints, authentication flows, and payloads without relying on complex test scripts).
4. **JWT Authentication & Authorization** (Register, Login, Token generation, and accessing protected endpoints).
5. **Consuming APIs from a React frontend** (Axios instances, interceptors, authentication state context, and CRUD operations).

---

## Features

- 🔐 **Authentication & Authorization** — User registration and login with BCrypt password hashing and signed JWT tokens.
- 👤 **Protected User Profile** — Secure `/api/profile` endpoint extracting user identity and claims from JWT tokens.
- 🔖 **Developer Resources CRUD** — Bookmark and manage developer links (articles, documentation, tools, tutorials).
- 📋 **Code Snippets CRUD** — Save and retrieve reusable code snippets with language tagging and searchable notes.
- ✅ **Developer Tasks CRUD** — Manage personal dev tasks with status (`todo`, `in-progress`, `done`), priority, and project grouping.
- 📖 **Interactive API Documentation** — Built-in visual API explorer powered by Scalar at `/scalar/v1`.
- 🩺 **Health Check** — `/api/health` endpoint to quickly verify backend status.

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| ASP.NET Core 10 Web API | REST API framework |
| Entity Framework Core 10 | ORM & database migrations |
| SQLite (`devshelf.db`) | Local development database |
| BCrypt.Net-Next | Secure password hashing |
| JWT Bearer Authentication | Token-based auth & claims |
| Scalar OpenAPI | Modern interactive API documentation |

### Frontend (To be built by students)
| Technology | Purpose |
|---|---|
| React 19 + Vite | Component-based UI library & fast build tool |
| React Router | Client-side routing with protected routes |
| Axios | HTTP client with request interceptors for Bearer tokens |
| Context API | Global authentication and session state management |

---

## Project Structure

```
devshelf/
├── server/                         # ASP.NET Core Web API backend
│   ├── Controllers/
│   │   ├── AuthController.cs       # POST /api/auth/register, POST /api/auth/login
│   │   ├── HealthController.cs     # GET /api/health
│   │   ├── ProfileController.cs    # GET /api/profile (Protected)
│   │   ├── ResourcesController.cs  # Full CRUD /api/resources (Protected)
│   │   ├── SnippetsController.cs   # Full CRUD /api/snippets (Protected)
│   │   └── TasksController.cs      # Full CRUD /api/tasks (Protected) + PATCH /status
│   ├── Models/
│   │   ├── User.cs                 # User entity
│   │   ├── Resource.cs             # Developer bookmark entity
│   │   ├── Snippet.cs              # Code snippet entity
│   │   └── DevTask.cs              # Developer task entity
│   ├── DTOs/
│   │   ├── Auth/                   # LoginDto, RegisterDto, AuthResponseDto, ProfileResponseDto
│   │   ├── Resources/              # CreateResourceDto, UpdateResourceDto, ResourceResponseDto
│   │   ├── Snippets/               # CreateSnippetDto, UpdateSnippetDto, SnippetResponseDto
│   │   └── Tasks/                  # CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, TaskResponseDto
│   ├── Services/
│   │   ├── AuthService.cs          # Register & Login business logic
│   │   └── JwtService.cs           # Token creation & claim configuration
│   ├── Data/
│   │   └── AppDbContext.cs         # EF Core DbContext (Users, Resources, Snippets, Tasks)
│   ├── Migrations/                 # EF Core SQLite schema migrations
│   ├── Properties/
│   │   └── launchSettings.json     # Local dev server ports (HTTP: 5259)
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Program.cs                  # Dependency Injection & middleware pipeline
│   └── server.http                 # Ready-to-run REST Client requests (20 endpoints)
│
├── README.md                       # Main project overview
├── BACKEND_SETUP_GUIDE.md          # Step-by-step setup guide from fork to run
├── API_DOCUMENTATION.md            # Complete REST API specification
├── POSTMAN_GUIDE.md                # Step-by-step Postman testing guide (no scripts)
├── FRONTEND_BUILD_GUIDE.md         # Comprehensive React + Axios frontend build guide
└── DEVSERVER_FLOW_GUIDE.md         # Deep-dive backend architecture explanation
```

---

## Getting Started

### Prerequisites

- [.NET SDK 10.0](https://dotnet.microsoft.com/download)
- [Postman](https://www.postman.com/downloads/) (for API testing)
- [Node.js v18+](https://nodejs.org/) (for frontend development)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/devshelf.git
cd devshelf
```

### 2. Run the Backend API

```bash
cd server

# Restore dependencies
dotnet restore

# Apply database migrations (creates/updates SQLite devshelf.db)
dotnet ef database update

# Start the API server (runs on http://localhost:5259)
dotnet run
```

### 3. Open Interactive API Documentation

Once the server is running, open your browser and navigate to:

👉 **`http://localhost:5259/scalar/v1`**

Here you can visually browse all endpoints, view request/response schemas, and understand the API contract before opening Postman.

---

## API Reference

### 1. Health

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Server status and version | No |

---

### 2. Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive a signed JWT token | No |

**Register Request Body:**
```json
{
  "userName": "alex",
  "email": "alex@example.com",
  "password": "Password123!"
}
```

**Login Request Body:**
```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```

**Login Response:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "userName": "alex",
  "email": "alex@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Profile

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/profile` | Get logged-in user profile claims | **Yes** (Bearer Token) |

**Required Header:**
```text
Authorization: Bearer <your_jwt_token_here>
```

---

### 4. Resources (Developer Bookmarks)

All Resource endpoints require the `Authorization: Bearer <token>` header and are scoped to the authenticated user.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/resources` | Get all resources for the logged-in user | **Yes** |
| `GET` | `/api/resources/{id}` | Get a single resource by its GUID | **Yes** |
| `POST` | `/api/resources` | Create a new developer resource | **Yes** |
| `PUT` | `/api/resources/{id}` | Update an existing resource | **Yes** |
| `DELETE` | `/api/resources/{id}` | Delete a resource | **Yes** |

**Create Resource Request Body (`POST /api/resources`):**
```json
{
  "title": "React 19 Official Documentation",
  "url": "https://react.dev",
  "notes": "Guide for React Server Components and Actions",
  "type": "docs"
}
```

**Resource Response Body:**
```json
{
  "id": "1777e760-6f6b-4803-b895-5baff53b8588",
  "title": "React 19 Official Documentation",
  "url": "https://react.dev",
  "notes": "Guide for React Server Components and Actions",
  "type": "docs",
  "userId": "f79936ff-969f-4f7e-af15-f21bde343003",
  "createdAt": "2026-10-01T20:25:14.595Z",
  "updatedAt": null
}
```

---

### 5. Snippets (Reusable Code)

All Snippet endpoints require the `Authorization: Bearer <token>` header and are scoped to the authenticated user.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/snippets` | Get all snippets for the logged-in user | **Yes** |
| `GET` | `/api/snippets/{id}` | Get a single snippet by its GUID | **Yes** |
| `POST` | `/api/snippets` | Create a new code snippet | **Yes** |
| `PUT` | `/api/snippets/{id}` | Update an existing snippet | **Yes** |
| `DELETE` | `/api/snippets/{id}` | Delete a snippet | **Yes** |

**Create Snippet Request Body (`POST /api/snippets`):**
```json
{
  "title": "EF Core SQLite Setup",
  "description": "Register AppDbContext with SQLite in Program.cs",
  "code": "builder.Services.AddDbContext<AppDbContext>(options =>\n    options.UseSqlite(\"Data Source=devshelf.db\"));",
  "language": "csharp",
  "tags": "dotnet,efcore,sqlite"
}
```

**Snippet Response Body:**
```json
{
  "id": "f57836d3-6194-4813-afa4-d0eae5831968",
  "title": "EF Core SQLite Setup",
  "description": "Register AppDbContext with SQLite in Program.cs",
  "code": "builder.Services.AddDbContext<AppDbContext>...",
  "language": "csharp",
  "tags": "dotnet,efcore,sqlite",
  "userId": "f79936ff-969f-4f7e-af15-f21bde343003",
  "createdAt": "2026-10-01T20:33:10.000Z",
  "updatedAt": null
}
```

---

### 6. Tasks (Developer To-Do List)

All Task endpoints require the `Authorization: Bearer <token>` header and are scoped to the authenticated user.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | Get all tasks for the logged-in user | **Yes** |
| `GET` | `/api/tasks?status=todo` | Filter tasks by status | **Yes** |
| `GET` | `/api/tasks/{id}` | Get a single task by its GUID | **Yes** |
| `POST` | `/api/tasks` | Create a new task | **Yes** |
| `PUT` | `/api/tasks/{id}` | Update a task (all fields) | **Yes** |
| `PATCH` | `/api/tasks/{id}/status` | Update only the task status | **Yes** |
| `DELETE` | `/api/tasks/{id}` | Delete a task | **Yes** |

**Create Task Request Body (`POST /api/tasks`):**
```json
{
  "title": "Build React frontend",
  "description": "Scaffold Vite app, set up Axios and AuthContext",
  "status": "todo",
  "priority": "high",
  "project": "DevShelf"
}
```

**Update Status Request Body (`PATCH /api/tasks/{id}/status`):**
```json
{
  "status": "in-progress"
}
```

**Task Response Body:**
```json
{
  "id": "a4b6ebd1-358c-4961-a170-e77b20f1f0e5",
  "title": "Build React frontend",
  "description": "Scaffold Vite app, set up Axios and AuthContext",
  "status": "todo",
  "priority": "high",
  "project": "DevShelf",
  "dueDate": null,
  "userId": "f79936ff-969f-4f7e-af15-f21bde343003",
  "createdAt": "2026-10-01T20:33:20.000Z",
  "updatedAt": null
}
```

---

## Data Models

### User Entity
```json
{
  "id": "Guid",
  "userName": "string",
  "email": "string",
  "passwordHash": "string (never exposed in responses)",
  "createdAt": "DateTime"
}
```

### Resource Entity
```json
{
  "id": "Guid",
  "title": "string",
  "url": "string",
  "notes": "string | null",
  "type": "string (article | video | tool | docs | other)",
  "userId": "Guid",
  "createdAt": "DateTime",
  "updatedAt": "DateTime | null"
}
```

### Snippet Entity
```json
{
  "id": "Guid",
  "title": "string",
  "description": "string | null",
  "code": "string",
  "language": "string (csharp | javascript | typescript | python | sql | plaintext | ...)",
  "tags": "string | null (comma-separated)",
  "userId": "Guid",
  "createdAt": "DateTime",
  "updatedAt": "DateTime | null"
}
```

### DevTask Entity
```json
{
  "id": "Guid",
  "title": "string",
  "description": "string | null",
  "status": "string (todo | in-progress | done)",
  "priority": "string (low | medium | high)",
  "project": "string | null",
  "dueDate": "DateTime | null",
  "userId": "Guid",
  "createdAt": "DateTime",
  "updatedAt": "DateTime | null"
}
```

---

## Learning Sequence for Students

Students should follow this sequence:
1. **Fork & Clone** the repository.
2. **Run the Backend** (`dotnet run`) and inspect startup messages.
3. **Open Scalar** at `http://localhost:5259/scalar/v1` to explore all endpoints and HTTP contracts.
4. **Use Postman** to test the API step-by-step:
   - Check `/api/health`.
   - Send `POST` to `/api/auth/register` with a JSON body.
   - Send `POST` to `/api/auth/login` and copy the JWT token from the response.
   - Paste the token into the `Authorization: Bearer` header to access `/api/profile`.
   - Practice CRUD on `/api/resources`, `/api/snippets`, and `/api/tasks`.
   - Test the `PATCH /api/tasks/{id}/status` endpoint to update only the task status.
5. **Build the React Frontend**:
   - Scaffold a Vite React app in `client/`.
   - Configure Axios with the base URL and a request interceptor to attach the Bearer token.
   - Implement Register, Login, and main data pages (Resources, Snippets, Tasks).
   - Use React Context to manage global authentication state.
   - Add protected routes that redirect unauthenticated users to the login page.

---

## License

MIT
