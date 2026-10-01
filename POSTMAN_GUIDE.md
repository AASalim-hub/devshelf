# DevShelf API Testing Guide with Postman

> A beginner-friendly, step-by-step guide to testing the DevShelf REST API using Postman.  
> This guide focuses on HTTP fundamentals: setting methods, constructing URLs, passing JSON payloads in request bodies, configuring headers, and reading status codes and responses.

---

## Table of Contents

1. [Postman Core Concepts](#1-postman-core-concepts)
2. [Setting Up Your Postman Workspace & Collection](#2-setting-up-your-postman-workspace--collection)
3. [Configuring Environment Variables](#3-configuring-environment-variables)
4. [Request Configuration Basics](#4-request-configuration-basics)
5. [Step 1: Health Check (`GET /api/health`)](#step-1-health-check)
6. [Step 2: User Registration (`POST /api/auth/register`)](#step-2-user-registration)
7. [Step 3: User Login (`POST /api/auth/login`)](#step-3-user-login)
8. [Step 4: Access Protected Profile (`GET /api/profile`)](#step-4-access-protected-profile)
9. [Step 5: Testing Developer Resources CRUD](#step-5-testing-developer-resources-crud)
10. [Step 6: Testing Code Snippets CRUD](#step-6-testing-code-snippets-crud)
11. [Step 7: Testing Developer Tasks & Status Updates](#step-7-testing-developer-tasks--status-updates)
12. [Postman Testing Checklist](#12-postman-testing-checklist)

---

## 1. Postman Core Concepts

Before sending requests, familiarize yourself with how Postman mirrors HTTP operations:

```
                    ┌──────────────────────────────────────────────┐
                    │               Postman UI                     │
                    │  [Method ▼] [  http://localhost:5259/api/... ]  │
                    └──────────────────────┬───────────────────────┘
                                           │
                        HTTP Request       │ (Headers, Body)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │         DevShelf ASP.NET Core API            │
                    │              (Port 5259)                     │
                    └──────────────────────┬───────────────────────┘
                                           │
                        HTTP Response      │ (Status Code, JSON Body)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │               Postman Response               │
                    │      [Status: 200 OK]  [Time]  [Size]        │
                    │      { "id": "...", "title": "..." }         │
                    └──────────────────────────────────────────────┘
```

| HTTP Concept | Where to find it in Postman |
|---|---|
| **HTTP Method** | The dropdown menu next to the URL input (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). |
| **Request URL** | The text box next to the Method selector (e.g. `{{base_url}}/api/resources`). |
| **Headers** | The **Headers** tab under the URL bar (e.g., `Content-Type`, `Authorization`). |
| **Request Body** | The **Body** tab → select **raw** → choose **JSON** from the format dropdown. |
| **Status Code** | The top-right badge of the response pane (e.g., `200 OK`, `201 Created`, `401 Unauthorized`). |
| **Response Body** | The lower section of the Postman window displaying formatted JSON. |

---

## 2. Setting Up Your Postman Workspace & Collection

**WHAT:** Create a dedicated Collection to organize all 20 DevShelf requests into folders matching the API documentation.

**WHY:** Keeping requests organized allows you to test endpoints sequentially and save your sample bodies and headers for future testing.

**HOW:**

1. Open Postman.
2. In the left sidebar, click **Collections** → click the **`+`** (Create Collection) icon.
3. Rename the collection to **`DevShelf API`**.
4. Inside the collection, click the three dots (`...`) → select **Add Folder**. Create six folders:
   - `1. Health`
   - `2. Auth`
   - `3. Profile`
   - `4. Resources`
   - `5. Snippets`
   - `6. Tasks`

---

## 3. Configuring Environment Variables

**WHAT:** Define reusable variables for the server address and authentication token.

**WHY:** Instead of retyping `http://localhost:5259` in 20 requests or manually pasting your JWT token into every header, Postman allows you to reference variables using `{{variable_name}}`.

**HOW:**

1. In the left sidebar, click **Environments** → click **`+`** (Create Environment).
2. Name the environment: **`DevShelf Local`**.
3. Add the following variables:

| Variable | Initial Value | Current Value | Description |
|---|---|---|---|
| `base_url` | `http://localhost:5259` | `http://localhost:5259` | Backend base address |
| `token` | *(leave blank)* | *(leave blank)* | Populated after login |
| `resource_id` | *(leave blank)* | *(leave blank)* | Populated after creating a resource |
| `snippet_id` | *(leave blank)* | *(leave blank)* | Populated after creating a snippet |
| `task_id` | *(leave blank)* | *(leave blank)* | Populated after creating a task |

4. Click **Save** (`Ctrl+S`).
5. In the top-right corner of Postman, locate the Environment dropdown (often labeled "No Environment") and select **`DevShelf Local`**.

---

## 4. Request Configuration Basics

For all requests in this guide:

### Setting a JSON Body
1. Click the **Body** tab below the URL bar.
2. Select the **raw** radio button.
3. In the dropdown to the right of the radio buttons, change **Text** to **JSON**.
4. Paste your JSON in the code editor.

### Setting Bearer Authentication
For protected endpoints:
1. Click the **Authorization** tab.
2. Select **Bearer Token** as the Type.
3. In the **Token** field, enter `{{token}}`.
*(Alternatively, you can go to the **Headers** tab and add `Authorization` with value `Bearer {{token}}`).*

---

## Step 1: Health Check

**WHAT:** Verify that the API server is online and accepting connections before testing anything else.

- **Method:** `GET`
- **URL:** `{{base_url}}/api/health`
- **Headers:** None needed
- **Body:** None

### HOW:
1. In the `1. Health` folder, click **Add Request**. Name it `Check Health`.
2. Ensure the method is set to **`GET`**.
3. In the URL bar, type:
   ```text
   {{base_url}}/api/health
   ```
4. Click **Send**.

### WHAT TO OBSERVE:
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-01T21:00:00.000Z",
    "version": "1.0.0"
  }
  ```

### COMMON FAILURE & DEBUGGING:
- **Failure:** `Could not send request` or `Connection refused`.
- **Debug:** The backend server is not running. Make sure you ran `dotnet run` inside the `server/` directory and see `Now listening on: http://localhost:5259`.

---

## Step 2: User Registration

**WHAT:** Create a new user account in the database.

- **Method:** `POST`
- **URL:** `{{base_url}}/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:** raw JSON

### HOW:
1. In the `2. Auth` folder, add a request named `Register User`.
2. Change the method dropdown to **`POST`**.
3. Set the URL to:
   ```text
   {{base_url}}/api/auth/register
   ```
4. Go to the **Body** tab → select **raw** → choose **JSON**.
5. Enter:
   ```json
   {
     "userName": "alex",
     "email": "alex@example.com",
     "password": "Password123!"
   }
   ```
6. Click **Send**.

### WHAT TO OBSERVE:
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "message": "Registration successful"
  }
  ```

### TEST A FAILURE SCENARIO:
1. Click **Send** a second time with the exact same body.
2. **Status:** `400 Bad Request`
3. **Response Body:**
   ```json
   {
     "error": "Email already taken"
   }
   ```
*This confirms the backend's duplicate email validation is working properly.*

---

## Step 3: User Login

**WHAT:** Authenticate with your credentials to obtain a signed JWT token.

- **Method:** `POST`
- **URL:** `{{base_url}}/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:** raw JSON

### HOW:
1. In `2. Auth`, add a request named `Login User`.
2. Change method to **`POST`**.
3. Set URL to:
   ```text
   {{base_url}}/api/auth/login
   ```
4. Under **Body** (raw → JSON), enter:
   ```json
   {
     "email": "alex@example.com",
     "password": "Password123!"
   }
   ```
5. Click **Send**.

### WHAT TO OBSERVE:
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "id": "e6fbb11d-b873-4552-824c-97dc71694f4b",
    "userName": "alex",
    "email": "alex@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### CRITICAL STEP — Store Your Token:
1. In the response body, highlight the entire string value of `"token"` (everything between the quotes).
2. Copy it (`Ctrl+C`).
3. Click the **Environments** tab on the left sidebar (or the eye icon in the top right).
4. Paste this token into the **Current Value** field for the `token` variable.
5. Click **Save** (`Ctrl+S`).

---

## Step 4: Access Protected Profile

**WHAT:** Test that the server accepts your token and extracts your claims.

- **Method:** `GET`
- **URL:** `{{base_url}}/api/profile`
- **Auth:** Bearer Token

### HOW (Test 1 — Without Token):
1. In `3. Profile`, add a request named `Get Profile (Unauthorized Test)`.
2. Set method to **`GET`** and URL to `{{base_url}}/api/profile`.
3. Under the **Authorization** tab, ensure it is set to **No Auth**.
4. Click **Send**.
5. **WHAT TO OBSERVE:** **`401 Unauthorized`**.  
   *This proves the endpoint is truly protected and cannot be accessed publicly.*

### HOW (Test 2 — With Valid Token):
1. In `3. Profile`, add a request named `Get Profile`.
2. Set method to **`GET`** and URL to `{{base_url}}/api/profile`.
3. Under **Authorization**, select **Bearer Token**.
4. Set Token to: `{{token}}`.
5. Click **Send**.

### WHAT TO OBSERVE:
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "id": "e6fbb11d-b873-4552-824c-97dc71694f4b",
    "email": "alex@example.com",
    "userName": "alex",
    "fetchedAt": "2026-10-01T21:15:30.123Z"
  }
  ```

---

## Step 5: Testing Developer Resources CRUD

All requests in this section require **Bearer Token** authentication (`{{token}}`).

### 5.1 Create a Resource
- **Method:** `POST`
- **URL:** `{{base_url}}/api/resources`
- **Auth:** Bearer Token
- **Body (raw JSON):**
  ```json
  {
    "title": "React 19 Official Documentation",
    "url": "https://react.dev",
    "notes": "Guide for hooks, server components, and actions",
    "type": "docs"
  }
  ```
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `201 Created`
  - In the response **Headers** tab, check the `Location` header: it will point to `/api/Resources/{new-guid}`.
  - The response body contains the newly generated `id`.
- **Action:** Copy this `id` and save it to your `resource_id` environment variable.

---

### 5.2 Get All Resources
- **Method:** `GET`
- **URL:** `{{base_url}}/api/resources`
- **Auth:** Bearer Token
- **Body:** None
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - Response body is a JSON array containing the resource you just created.

---

### 5.3 Get Resource by ID
- **Method:** `GET`
- **URL:** `{{base_url}}/api/resources/{{resource_id}}`
- **Auth:** Bearer Token
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - Response body contains the single matching resource object.

---

### 5.4 Update Resource (PUT)
- **Method:** `PUT`
- **URL:** `{{base_url}}/api/resources/{{resource_id}}`
- **Auth:** Bearer Token
- **Body (raw JSON):**
  ```json
  {
    "title": "React 19 Docs & Learn Portal",
    "url": "https://react.dev/learn",
    "notes": "Updated: Interactive tutorial section",
    "type": "docs"
  }
  ```
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - The returned object shows the modified `title`, `url`, and an updated `updatedAt` timestamp.

---

### 5.5 Delete Resource
- **Method:** `DELETE`
- **URL:** `{{base_url}}/api/resources/{{resource_id}}`
- **Auth:** Bearer Token
- **Body:** None
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `204 No Content`
  - The response body is completely empty (standard for 204).

---

### 5.6 Verify Deletion (404 Test)
- Re-run the **Get Resource by ID** request (`GET {{base_url}}/api/resources/{{resource_id}}`).
- **WHAT TO OBSERVE:**
  - **Status:** `404 Not Found`
  - **Body:** `{"error": "Resource not found"}`

---

## Step 6: Testing Code Snippets CRUD

All requests in this section require **Bearer Token** authentication (`{{token}}`).

### 6.1 Create a Snippet
- **Method:** `POST`
- **URL:** `{{base_url}}/api/snippets`
- **Auth:** Bearer Token
- **Body (raw JSON):**
  ```json
  {
    "title": "EF Core SQLite Registration",
    "description": "Register AppDbContext with SQLite in Program.cs",
    "code": "builder.Services.AddDbContext<AppDbContext>(options =>\n    options.UseSqlite(\"Data Source=devshelf.db\"));",
    "language": "csharp",
    "tags": "dotnet,efcore,sqlite"
  }
  ```
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `201 Created`
  - Response contains the created snippet with its generated GUID.
- **Action:** Copy the `id` from the response and save it to your `snippet_id` environment variable.

---

### 6.2 Get All Snippets
- **Method:** `GET`
- **URL:** `{{base_url}}/api/snippets`
- **Auth:** Bearer Token
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - Response is a JSON array of snippets.

---

### 6.3 Get Snippet by ID
- **Method:** `GET`
- **URL:** `{{base_url}}/api/snippets/{{snippet_id}}`
- **Auth:** Bearer Token
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`

---

### 6.4 Update Snippet (PUT)
- **Method:** `PUT`
- **URL:** `{{base_url}}/api/snippets/{{snippet_id}}`
- **Auth:** Bearer Token
- **Body (raw JSON):**
  ```json
  {
    "title": "EF Core SQLite Registration (Production Config)",
    "description": "Reading SQLite connection string from appsettings",
    "code": "var conn = builder.Configuration.GetConnectionString(\"Default\");\nbuilder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite(conn));",
    "language": "csharp",
    "tags": "dotnet,efcore"
  }
  ```
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - Notice the `updatedAt` field is now set to the current timestamp.

---

### 6.5 Delete Snippet
- **Method:** `DELETE`
- **URL:** `{{base_url}}/api/snippets/{{snippet_id}}`
- **Auth:** Bearer Token
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `204 No Content`

---

## Step 7: Testing Developer Tasks & Status Updates

Tasks support full CRUD plus an additional **`PATCH`** endpoint for updating only the completion status. All requests require **Bearer Token** authentication (`{{token}}`).

### 7.1 Create a Task
- **Method:** `POST`
- **URL:** `{{base_url}}/api/tasks`
- **Auth:** Bearer Token
- **Body (raw JSON):**
  ```json
  {
    "title": "Build React Login Page",
    "description": "Create component with email and password inputs",
    "status": "todo",
    "priority": "high",
    "project": "DevShelf Frontend"
  }
  ```
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `201 Created`
- **Action:** Copy the `id` from the response and save it to your `task_id` environment variable.

---

### 7.2 Get All Tasks
- **Method:** `GET`
- **URL:** `{{base_url}}/api/tasks`
- **Auth:** Bearer Token
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - An array containing your task.

---

### 7.3 Get Tasks Filtered by Status (Query Parameter)
**WHAT:** Test filtering tasks using URL query parameters.

- **Method:** `GET`
- **URL:** `{{base_url}}/api/tasks?status=todo`
- **Auth:** Bearer Token
- **HOW IN POSTMAN:**
  1. Under the URL bar, click the **Params** tab.
  2. Notice that Postman automatically filled in Key: `status`, Value: `todo`.
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - Only tasks with `"status": "todo"` are returned.
  - If you change the value to `done`, an empty array `[]` is returned (since no tasks are marked done yet).

---

### 7.4 Get Task by ID
- **Method:** `GET`
- **URL:** `{{base_url}}/api/tasks/{{task_id}}`
- **Auth:** Bearer Token
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`

---

### 7.5 Update Task Status Only (PATCH)
**WHAT:** Demonstrate the difference between `PUT` (replaces the entire resource) and `PATCH` (modifies only specific fields).

- **Method:** `PATCH`
- **URL:** `{{base_url}}/api/tasks/{{task_id}}/status`
- **Auth:** Bearer Token
- **Body (raw JSON):**
  ```json
  {
    "status": "in-progress"
  }
  ```
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - The returned object has `"status": "in-progress"`.
  - Notice that all other fields (`title`, `description`, `priority`, `project`) were **preserved unchanged**.

---

### 7.6 Update Entire Task (PUT)
- **Method:** `PUT`
- **URL:** `{{base_url}}/api/tasks/{{task_id}}`
- **Auth:** Bearer Token
- **Body (raw JSON):**
  ```json
  {
    "title": "Build React Login Page & Axios Interceptor",
    "description": "Completed component, auth service, and token persistence",
    "status": "done",
    "priority": "high",
    "project": "DevShelf Frontend",
    "dueDate": "2026-10-15T00:00:00Z"
  }
  ```
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `200 OK`
  - Full object updated with `"status": "done"`.

---

### 7.7 Delete Task
- **Method:** `DELETE`
- **URL:** `{{base_url}}/api/tasks/{{task_id}}`
- **Auth:** Bearer Token
- **Click Send**.
- **WHAT TO OBSERVE:**
  - **Status:** `204 No Content`

---

## 12. Postman Testing Checklist

Before moving on to building the React frontend, make sure you can answer **YES** to all of the following:

- [ ] I can check server health at `GET /api/health` and receive `200 OK`.
- [ ] I can register a new user at `POST /api/auth/register`.
- [ ] I observed a `400 Bad Request` when trying to register the same email twice.
- [ ] I can log in at `POST /api/auth/login` and extract the JWT token.
- [ ] I confirmed that calling `GET /api/profile` without a token returns `401 Unauthorized`.
- [ ] I configured the `Authorization: Bearer {{token}}` header and successfully fetched profile claims.
- [ ] I performed full CRUD on `/api/resources` (`POST` → `201`, `GET` → `200`, `PUT` → `200`, `DELETE` → `204`).
- [ ] I confirmed that requesting a deleted item returns `404 Not Found`.
- [ ] I created and retrieved code snippets on `/api/snippets`.
- [ ] I tested query parameter filtering on `/api/tasks?status=todo`.
- [ ] I tested partial updates using `PATCH /api/tasks/{id}/status`.
- [ ] I understand how the JSON payloads I sent in Postman match the DTOs in the ASP.NET Core backend.
