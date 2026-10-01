# DevShelf Backend Setup Guide

> This guide walks you through every step required to get the DevShelf backend API running on your machine — from forking the repository all the way to verifying the API works inside the Scalar explorer.
>
> Follow each section in order. Do not skip steps.

---

## Table of Contents

1. [What You Will Need](#1-what-you-will-need)
2. [Fork the Repository](#2-fork-the-repository)
3. [Clone the Repository to Your Machine](#3-clone-the-repository-to-your-machine)
4. [Understand the Project Structure](#4-understand-the-project-structure)
5. [Verify Your .NET Installation](#5-verify-your-net-installation)
6. [Understand the Configuration Files](#6-understand-the-configuration-files)
7. [Restore NuGet Packages](#7-restore-nuget-packages)
8. [Set Up the Database](#8-set-up-the-database)
9. [Run the Backend Server](#9-run-the-backend-server)
10. [Verify the Server is Running](#10-verify-the-server-is-running)
11. [Explore the API with Scalar](#11-explore-the-api-with-scalar)
12. [Stop the Server](#12-stop-the-server)
13. [Common Problems and Fixes](#13-common-problems-and-fixes)

---

## 1. What You Will Need

Before you start, make sure you have the following installed on your machine.

### Required Tools

| Tool | Why You Need It | Where to Get It |
|---|---|---|
| **Git** | To clone the repository from GitHub | https://git-scm.com/downloads |
| **.NET SDK 10.0** | To build and run the ASP.NET Core backend | https://dotnet.microsoft.com/download |
| **Postman** | To test API endpoints (used in later steps) | https://www.postman.com/downloads |

### Optional but Recommended

| Tool | Why It Is Useful |
|---|---|
| **VS Code** | Code editor with good .NET and REST Client support |
| **REST Client extension** (VS Code) | Lets you run the `server.http` file directly inside VS Code |

### How to Verify Your Tools

Open a terminal (Command Prompt, PowerShell, or Terminal on Mac/Linux) and run the following commands:

```bash
git --version
```
**Expected output:** something like `git version 2.x.x`

```bash
dotnet --version
```
**Expected output:** `10.0.x`

> If the `dotnet` command is not found, the .NET SDK is not installed or not on your system PATH. Download it from the link in the table above and re-run the installer.

---

## 2. Fork the Repository

**WHAT:** Forking creates your own personal copy of the DevShelf repository on your GitHub account. This means you can push your own changes without affecting the original.

**WHY:** You will be adding your own code (the React frontend) to this repository. You need your own copy to do that.

**HOW:**

1. Go to the DevShelf repository on GitHub.
2. Click the **Fork** button in the top-right corner.
3. Select your GitHub account as the destination.
4. GitHub will create a copy of the repository under your account, for example:
   ```
   https://github.com/YOUR_USERNAME/devshelf
   ```

**WHAT TO OBSERVE:**  
After forking, you will be redirected to your copy of the repository. Notice that the URL now contains your GitHub username, not the original owner's.

---

## 3. Clone the Repository to Your Machine

**WHAT:** Cloning downloads your forked repository from GitHub to a folder on your computer.

**WHY:** All work — running the server, writing code, applying migrations — happens on your local machine, not on GitHub.

**HOW:**

1. On your forked repository page on GitHub, click the green **Code** button.
2. Make sure **HTTPS** is selected.
3. Copy the URL shown (it will look like `https://github.com/YOUR_USERNAME/devshelf.git`).
4. Open your terminal and navigate to the folder where you want to store the project. For example:

```bash
cd ~/Documents
```

5. Run the clone command:

```bash
git clone https://github.com/YOUR_USERNAME/devshelf.git
```

6. Move into the project folder:

```bash
cd devshelf
```

**WHAT TO OBSERVE:**  
Git will print output showing it is downloading files, for example:
```
Cloning into 'devshelf'...
remote: Counting objects: 120, done.
Receiving objects: 100% (120/120), done.
```

After cloning, you will have a `devshelf/` folder on your machine.

---

## 4. Understand the Project Structure

**WHAT:** Before touching any commands, take a moment to understand what each folder and file does.

**WHY:** Knowing the structure prevents you from running commands in the wrong directory or being confused by error messages.

```
devshelf/
│
├── server/                         ← The entire backend lives here
│   │
│   ├── Controllers/                ← API endpoints (one file per resource group)
│   │   ├── AuthController.cs       ← POST /api/auth/register and /api/auth/login
│   │   ├── HealthController.cs     ← GET /api/health
│   │   ├── ProfileController.cs    ← GET /api/profile (requires login)
│   │   ├── ResourcesController.cs  ← CRUD for developer bookmarks
│   │   ├── SnippetsController.cs   ← CRUD for code snippets
│   │   └── TasksController.cs      ← CRUD for developer tasks
│   │
│   ├── Models/                     ← Database entity classes
│   │   ├── User.cs
│   │   ├── Resource.cs
│   │   ├── Snippet.cs
│   │   └── DevTask.cs
│   │
│   ├── DTOs/                       ← Data Transfer Objects (request/response shapes)
│   │   ├── Auth/
│   │   ├── Resources/
│   │   ├── Snippets/
│   │   └── Tasks/
│   │
│   ├── Services/                   ← Business logic (auth, JWT token generation)
│   │   ├── AuthService.cs
│   │   └── JwtService.cs
│   │
│   ├── Data/
│   │   └── AppDbContext.cs         ← Entity Framework database context
│   │
│   ├── Migrations/                 ← Auto-generated database schema history
│   │
│   ├── Properties/
│   │   └── launchSettings.json     ← Local server port settings (HTTP: 5259)
│   │
│   ├── appsettings.json            ← Base application settings
│   ├── appsettings.Development.json ← Settings used only when ASPNETCORE_ENVIRONMENT=Development
│   ├── Program.cs                  ← Application entry point — wires everything together
│   ├── server.csproj               ← Project file (dependencies, framework version)
│   ├── server.http                 ← Ready-to-run API request examples
│   └── devshelf.db                 ← SQLite database file (created after migration)
│
├── README.md                       ← Project overview and API reference
├── BACKEND_SETUP_GUIDE.md          ← This file
└── DEVSERVER_FLOW_GUIDE.md         ← Deep-dive architecture explanation
```

> **Important:** Almost all commands in this guide must be run from inside the `server/` folder. The `.csproj` file lives there. If you run `dotnet` commands from the root `devshelf/` folder, they will fail.

---

## 5. Verify Your .NET Installation

**WHAT:** Confirm the correct SDK version is available before building anything.

**HOW:**

```bash
dotnet --version
```

**WHAT TO OBSERVE:**  
The output must start with `10.0`. For example: `10.0.3`

If it shows `9.x` or `8.x`, you have an older version installed. Download the .NET 10 SDK from https://dotnet.microsoft.com/download and run the installer, then open a new terminal window.

You can also check what SDKs are installed:

```bash
dotnet --list-sdks
```

Example output:
```
10.0.3 [C:\Program Files\dotnet\sdk]
```

---

## 6. Understand the Configuration Files

**WHAT:** The backend has two configuration files that control settings like database connection strings and JWT token signing.

**WHY:** Understanding these files tells you where to look when things go wrong — and prevents you from accidentally breaking the server by committing secret keys to GitHub.

### `appsettings.json`

Located at `server/appsettings.json`. This is the base configuration loaded in every environment. Right now it only contains the log level setting and `AllowedHosts`.

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### `appsettings.Development.json`

Located at `server/appsettings.Development.json`. This file is loaded **only when the environment is set to `Development`** — which is what `launchSettings.json` sets automatically when you run `dotnet run`.

```json
{
  "Jwt": {
    "Key": "your-super-secret-key-min-32-characters-here-for-dev",
    "Issuer": "devshelf-api",
    "Audience": "devshelf-client"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

| Key | What It Does |
|---|---|
| `Jwt:Key` | The secret key used to sign JWT tokens. Must be at least 32 characters long. |
| `Jwt:Issuer` | Identifies who issued the token. Must match in both signing and validation. |
| `Jwt:Audience` | Identifies who the token is meant for. Must match in both signing and validation. |

> **Important — For Local Development:**  
> The `Key` value in this file is already set to a working development value. You do not need to change it to run the server locally.
>
> **For Production:**  
> You would move this key into an environment variable or a secrets manager. Never commit a real production secret key to GitHub.

### Why Two Config Files?

ASP.NET Core merges these files automatically:

```
appsettings.json          ← Always loaded
     +
appsettings.Development.json  ← Loaded on top when ASPNETCORE_ENVIRONMENT=Development
     =
Final merged configuration that the running app sees
```

The `Development` file values override the base file values if there are duplicates.

---

## 7. Restore NuGet Packages

**WHAT:** Download all the external libraries (called NuGet packages) that the project depends on.

**WHY:** These packages are not included in the repository (they are listed in `server.csproj` but the actual files are not committed to Git). You must download them before you can build or run the project.

**HOW:**

First, navigate into the `server/` directory:

```bash
cd server
```

Then run:

```bash
dotnet restore
```

**WHAT TO OBSERVE:**  
Output similar to:
```
  Determining projects to restore...
  Restored C:\...\devshelf\server\server.csproj (in 4.5s)
```

**COMMON FAILURE — No internet connection:**  
If the restore fails with a network error, check your internet connection. NuGet downloads packages from `nuget.org`.

**COMMON FAILURE — SDK version mismatch:**  
If you see `NETSDK1045: The current .NET SDK does not support targeting .NET 10.0`, you have an older SDK. Install .NET 10 from https://dotnet.microsoft.com/download.

---

## 8. Set Up the Database

**WHAT:** Run Entity Framework migrations to create the SQLite database file and all the required tables.

**WHY:** The application uses a SQLite database file called `devshelf.db`. This file does not exist yet in your cloned copy. The migration commands create it and define the schema (Users, Resources, Snippets, Tasks tables) based on the model classes in the project.

### Step 8a — Install the EF Core CLI Tool (first time only)

Entity Framework provides a command-line tool (`dotnet ef`) for managing migrations. If you have never used it before, install it globally:

```bash
dotnet tool install --global dotnet-ef
```

If it is already installed, update it:

```bash
dotnet tool update --global dotnet-ef
```

Verify it works:

```bash
dotnet ef --version
```

**WHAT TO OBSERVE:**  
```
Entity Framework Core .NET Command-line Tools
10.x.x
```

> **PATH issue on some systems:**  
> If `dotnet ef` is not found after installing, your system's global tools folder may not be in your PATH. Run the following to add it (Windows PowerShell):
> ```powershell
> $env:PATH += ";$env:USERPROFILE\.dotnet\tools"
> ```
> Then close and reopen your terminal.

### Step 8b — Apply Migrations

Make sure you are inside the `server/` directory, then run:

```bash
dotnet ef database update
```

**WHAT TO OBSERVE:**  
```
Build started...
Build succeeded.
Applying migration '20260423195036_InitialCreate'.
Applying migration '20261001202324_AddResources'.
Applying migration '20261001203213_AddSnippetsAndTasks'.
Done.
```

After this command, a file called `devshelf.db` will be created inside the `server/` directory.

### What Does "Apply Migrations" Mean?

Migrations are a record of every change made to the database schema — like version control for your database structure. Each migration file in `server/Migrations/` contains:
- **Up()** — the SQL operations to apply (e.g., create tables, add columns)
- **Down()** — the SQL operations to reverse them

When you run `dotnet ef database update`, EF Core looks at which migrations have already been applied to your database and runs only the new ones. Since your database is brand new, all three migrations run.

The final database schema looks like this:

```
devshelf.db
├── Users        (Id, UserName, Email, PasswordHash, CreatedAt)
├── Resources    (Id, Title, Url, Notes, Type, UserId, CreatedAt, UpdatedAt)
├── Snippets     (Id, Title, Description, Code, Language, Tags, UserId, CreatedAt, UpdatedAt)
└── Tasks        (Id, Title, Description, Status, Priority, Project, DueDate, UserId, CreatedAt, UpdatedAt)
```

**COMMON FAILURE — `dotnet ef` not found:**  
Run `dotnet tool install --global dotnet-ef` as shown in Step 8a.

**COMMON FAILURE — `Build failed` before migration runs:**  
There is a compile error in the project. Run `dotnet build` to see the specific error message.

---

## 9. Run the Backend Server

**WHAT:** Start the ASP.NET Core web server so that the API is available at `http://localhost:5259`.

**HOW:**

Make sure you are inside the `server/` directory, then run:

```bash
dotnet run
```

**WHAT TO OBSERVE:**  

After a few seconds, you should see output similar to this:

```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5259
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
info: Microsoft.Hosting.Lifetime[0]
      Content root path: C:\...\devshelf\server
```

Key things to observe:

| What you see | What it means |
|---|---|
| `Now listening on: http://localhost:5259` | The server is running and accepting requests on port 5259 |
| `Hosting environment: Development` | The `appsettings.Development.json` file is active — Scalar UI is enabled |
| `Application started. Press Ctrl+C to shut down.` | The server is healthy and ready |

> **The terminal will appear to "hang" after this output. That is normal.** The server is running and waiting for incoming requests. Do not close the terminal — leave it open. Open a second terminal window to run other commands.

### What Profile Does `dotnet run` Use?

When you run `dotnet run` without extra flags, .NET automatically picks the first profile defined in `server/Properties/launchSettings.json`. In this project, that is the `http` profile:

```json
"http": {
  "applicationUrl": "http://localhost:5259",
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Development"
  }
}
```

This means:
- The server runs on **HTTP** port `5259`
- The environment is set to **Development**, which enables Scalar

---

## 10. Verify the Server is Running

**WHAT:** Confirm the API is responding before trying to use Scalar or Postman.

**HOW:**

Open a browser and go to:

```
http://localhost:5259/api/health
```

**WHAT TO OBSERVE:**  

The browser should display a JSON response like this:

```json
{
  "status": "healthy",
  "timestamp": "2026-10-01T21:00:00Z",
  "version": "1.0.0"
}
```

This is the `/api/health` endpoint. It requires no authentication and is specifically designed as a quick check that the server is alive and responding.

**COMMON FAILURE — Browser shows "This site can't be reached":**
- The server is not running. Go back to Step 9 and check the terminal output for errors.
- You may be on the wrong port. The correct URL is `http://localhost:5259` (not `5260`, not `7282`).

**COMMON FAILURE — Server starts but immediately crashes:**  
Look at the terminal where `dotnet run` is running. The most common reason is a missing or malformed JWT configuration. Check that `appsettings.Development.json` exists and has the `Jwt` section with all three keys (`Key`, `Issuer`, `Audience`).

---

## 11. Explore the API with Scalar

**WHAT:** Open the interactive API documentation that is built into the running server.

**WHY:** Before opening Postman, it is worth spending time in Scalar. Scalar reads the OpenAPI specification generated automatically from your controller code and shows you:
- Every endpoint (grouped by controller)
- The HTTP method and URL for each endpoint
- The request body schema (what JSON you need to send)
- The response schema (what JSON you will receive)
- Which endpoints require authentication

**HOW:**

With the server running, open your browser and go to:

```
http://localhost:5259/scalar/v1
```

**WHAT TO OBSERVE:**

The Scalar explorer will load and show you a sidebar with all the API endpoint groups:

```
auth
  POST /api/auth/register
  POST /api/auth/login

health
  GET /api/health

profile
  GET /api/profile

resources
  GET    /api/resources
  POST   /api/resources
  GET    /api/resources/{id}
  PUT    /api/resources/{id}
  DELETE /api/resources/{id}

snippets
  GET    /api/snippets
  POST   /api/snippets
  GET    /api/snippets/{id}
  PUT    /api/snippets/{id}
  DELETE /api/snippets/{id}

tasks
  GET    /api/tasks
  POST   /api/tasks
  GET    /api/tasks/{id}
  PUT    /api/tasks/{id}
  PATCH  /api/tasks/{id}/status
  DELETE /api/tasks/{id}
```

### Things to Do in Scalar

Click on any endpoint. Scalar will show you:

- **The HTTP method** — `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`
- **The route** — e.g., `/api/resources/{id}`
- **Authentication** — endpoints with a lock icon require a Bearer token
- **Request body** — the shape of JSON you need to send for `POST` and `PUT` requests
- **Responses** — the shape of JSON the server will return, and what status codes to expect

> **Why does Scalar only appear in Development?**  
> Scalar is registered in `Program.cs` inside an `if (app.Environment.IsDevelopment())` block. In production, you would typically not expose API documentation to the public. Since `launchSettings.json` sets `ASPNETCORE_ENVIRONMENT=Development`, it is always available when you run locally.

---

## 12. Stop the Server

**WHAT:** Shut down the running API server when you are finished.

**HOW:**

In the terminal where `dotnet run` is running, press:

```
Ctrl + C
```

**WHAT TO OBSERVE:**  
```
Application is shutting down...
```

The terminal prompt will return. The server is stopped and port `5259` is released.

---

## 13. Common Problems and Fixes

### Problem: `dotnet: command not found`

| | |
|---|---|
| **Cause** | .NET SDK is not installed or not on your PATH |
| **Fix** | Download and install from https://dotnet.microsoft.com/download. Open a new terminal after installing. |

---

### Problem: `NETSDK1045: The current .NET SDK does not support targeting .NET 10.0`

| | |
|---|---|
| **Cause** | You have .NET 8 or 9 installed, but this project requires .NET 10 |
| **Fix** | Install .NET 10 SDK from https://dotnet.microsoft.com/download |

---

### Problem: Server crashes at startup with `JWT Key is not configured`

| | |
|---|---|
| **Cause** | The `appsettings.Development.json` file is missing, the `Jwt` section is missing, or `Jwt:Key` is empty |
| **Fix** | Open `server/appsettings.Development.json` and confirm the file matches the structure shown in Section 6. The `Key` must be at least 32 characters long. |

---

### Problem: `Now listening on: https://localhost:7282` but `http://localhost:5259` is not working

| | |
|---|---|
| **Cause** | You ran `dotnet run --launch-profile https` which picks the HTTPS profile |
| **Fix** | Run `dotnet run` without any `--launch-profile` flag. The default profile is `http` which uses port `5259`. |

---

### Problem: `dotnet ef database update` fails with `No project was found`

| | |
|---|---|
| **Cause** | You ran the command from the root `devshelf/` folder instead of inside `server/` |
| **Fix** | Run `cd server` first, then run `dotnet ef database update` |

---

### Problem: `No migrations were applied` when running `dotnet ef database update`

| | |
|---|---|
| **Cause** | The database already has all migrations applied — this is not an error |
| **What to do** | Nothing. The database is already up to date. Proceed to `dotnet run`. |

---

### Problem: Port `5259` is already in use

| | |
|---|---|
| **Cause** | A previous `dotnet run` process was not stopped, or another program is using port 5259 |
| **Fix (Windows)** | Run `netstat -ano \| findstr :5259` to find the process ID, then `taskkill /PID <pid> /F` |
| **Fix (Mac/Linux)** | Run `lsof -ti:5259 \| xargs kill` |

---

### Problem: `http://localhost:5259/scalar/v1` returns 404

| | |
|---|---|
| **Cause** | The server is not running in the `Development` environment, so Scalar is not registered |
| **Fix** | Check the terminal output — it should say `Hosting environment: Development`. If it says `Production`, the environment variable is wrong. Open a new terminal after checking `launchSettings.json`. |

---

## Summary

By the end of this guide you will have:

- ✅ Forked and cloned the DevShelf repository
- ✅ Verified your .NET 10 installation
- ✅ Understood the project structure and configuration files
- ✅ Restored all NuGet package dependencies
- ✅ Created the SQLite database by running EF Core migrations
- ✅ Started the backend API server on `http://localhost:5259`
- ✅ Confirmed the server is healthy via `/api/health`
- ✅ Explored all API endpoints using the Scalar documentation at `/scalar/v1`

**Next step:** Open Postman and follow the Postman testing guide to send requests to each endpoint.
