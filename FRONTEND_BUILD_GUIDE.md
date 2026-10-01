# DevShelf Frontend Build Guide

> A comprehensive, step-by-step curriculum for students building the DevShelf React frontend from scratch.  
> This guide teaches you how to scaffold a modern React application, configure Axios, manage global authentication state with React Context, protect client-side routes, and perform full CRUD operations against the ASP.NET Core backend.

---

## Learning Objectives

By following this guide, you will learn how to:
1. Scaffold a React single-page application using **Vite**.
2. Understand and configure **CORS** between frontend (`http://localhost:5173`) and backend (`http://localhost:5259`).
3. Connect **Postman HTTP concepts** directly to **Axios HTTP requests**.
4. Configure an **Axios instance** with **request interceptors** to automate JWT Bearer authentication.
5. Build an **Authentication Context (`AuthContext`)** to handle registration, login, token persistence (`localStorage`), and logout.
6. Guard private pages using **Protected Routes** with **React Router**.
7. Implement **CRUD interfaces** (Create, Read, Update, Delete) with loading states and error handling for:
   - Developer Resources (Bookmarks)
   - Code Snippets
   - Developer Tasks (including `PATCH` status updates)

---

## Table of Contents

- [Phase 1: Project Scaffolding & Setup](#phase-1-project-scaffolding--setup)
- [Phase 2: Connecting the HTTP Layer with Axios](#phase-2-connecting-the-http-layer-with-axios)
- [Phase 3: Authentication Context (`AuthContext`)](#phase-3-authentication-context-authcontext)
- [Phase 4: Routing & Protected Route Guards](#phase-4-routing--protected-route-guards)
- [Phase 5: Authentication Pages (Register & Login)](#phase-5-authentication-pages-register--login)
- [Phase 6: Navbar & Shared Layout](#phase-6-navbar--shared-layout)
- [Phase 7: Building the CRUD Pages](#phase-7-building-the-crud-pages)
  - [7.1 Resources Page (Bookmarks CRUD)](#71-resources-page-bookmarks-crud)
  - [7.2 Snippets Page (Code Snippets CRUD)](#72-snippets-page-code-snippets-crud)
  - [7.3 Tasks Page (Dev Tasks CRUD + Status Toggle)](#73-tasks-page-dev-tasks-crud--status-toggle)
- [Phase 8: End-to-End Testing & Debugging](#phase-8-end-to-end-testing--debugging)

---

## Phase 1: Project Scaffolding & Setup

### 1.1 Scaffold the React Client with Vite

**WHAT:** Create a new React application in a directory named `client` inside your repository root.

**WHY:** Vite provides a fast development server, modern ES module bundling, and minimal boilerplate compared to older tools like Create React App.

**HOW:**

Open your terminal and ensure you are in the root `devshelf/` directory:

```bash
# Verify you are in devshelf/
pwd # or 'cd' on Windows cmd

# Scaffold a new React application named 'client'
npm create vite@latest client -- --template react

# Move into the client folder
cd client

# Install baseline dependencies
npm install

# Install project-specific dependencies: Axios and React Router
npm install axios react-router-dom
```

### 1.2 Verify the Development Port & CORS

**WHAT:** Confirm your frontend dev server runs on `http://localhost:5173`.

**WHY:** The backend's `Program.cs` explicitly configures the following CORS policy:
```csharp
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```
If your Vite server runs on any port other than `5173`, the browser will block all HTTP requests with a **CORS error**.

**HOW:**

Start the Vite development server:
```bash
npm run dev
```

**WHAT TO OBSERVE:**
```
  VITE v6.x.x  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173/` in your browser. You should see the default Vite + React welcome page. Press `Ctrl + C` in the terminal when you are ready to continue.

---

### 1.3 Recommended Folder Structure

Inside `client/src/`, organize your files cleanly by responsibility:

```
client/src/
├── api/
│   └── client.js             # Configured Axios instance + interceptors
├── context/
│   └── AuthContext.jsx       # Global authentication state & methods
├── components/
│   ├── ProtectedRoute.jsx    # Route guard component
│   └── Navbar.jsx            # Top navigation bar
├── pages/
│   ├── LoginPage.jsx         # Login form
│   ├── RegisterPage.jsx      # Registration form
│   ├── ResourcesPage.jsx     # Developer resources CRUD
│   ├── SnippetsPage.jsx      # Code snippets CRUD
│   └── TasksPage.jsx         # Developer tasks CRUD
├── App.jsx                   # Route declarations
├── main.jsx                  # App entry point + AuthProvider wrap
└── index.css                 # Base styles
```

Create these folders now:
```bash
# Inside client/src:
mkdir api context components pages
```

---

## Phase 2: Connecting the HTTP Layer with Axios

### 2.1 The Relationship: Postman vs. Axios

**WHAT:** Connecting what you did in Postman to how Axios works in JavaScript.

**WHY:** When you clicked **Send** in Postman, Postman constructed an HTTP request packet with a method, URL, headers, and body. Axios does the exact same thing programmatically inside the browser:

| Postman Action | Axios Code Equivalent |
|---|---|
| Setting URL to `http://localhost:5259/api` | `baseURL: 'http://localhost:5259/api'` |
| Selecting `POST` method | `api.post('/auth/login', payload)` |
| Adding `Content-Type: application/json` | Handled automatically by Axios when passing an object |
| Adding `Authorization: Bearer <token>` | Handled automatically via Axios **Request Interceptor** |
| Reading `Status: 200 OK` | Promise resolves; access data in `response.data` |
| Reading `Status: 400 Bad Request` | Promise rejects; inspect error in `error.response.data` |

---

### 2.2 Create the Configured Axios Client

**WHAT:** Create a centralized Axios instance with a base URL and an automatic authentication interceptor.

**WHY:** Without a centralized client, you would have to type `http://localhost:5259/api` and retrieve the token from `localStorage` in every single component that makes an API call. A **Request Interceptor** automatically attaches the Bearer token to every outgoing request before it leaves the browser.

**HOW:**

Create the file `client/src/api/client.js`:

```javascript
import axios from 'axios';

// 1. Create an Axios instance with the backend base URL
const api = axios.create({
  baseURL: 'http://localhost:5259/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: runs BEFORE every outgoing HTTP request
api.interceptors.request.use(
  (config) => {
    // Read the stored JWT token from localStorage
    const token = localStorage.getItem('devshelf_token');

    // If a token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: handle global errors like expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 Unauthorized, the token is invalid or expired
    if (error.response && error.response.status === 401) {
      // Clear invalid credentials
      localStorage.removeItem('devshelf_token');
      localStorage.removeItem('devshelf_user');
      
      // Optional: redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Phase 3: Authentication Context (`AuthContext`)

### 3.1 Why Use React Context for Authentication?

**WHAT:** A React Context that stores the authenticated user's state (`user`, `token`, `isAuthenticated`) and exposes helper functions (`login`, `register`, `logout`).

**WHY:** Without Context, you would have to pass the `user` and `token` props down through every component in your tree (known as *prop drilling*). Context provides a single source of truth accessible anywhere in your app via `useAuth()`.

---

### 3.2 Create `AuthContext.jsx`

Create the file `client/src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On initial app load, restore session from localStorage if present
  useEffect(() => {
    const savedToken = localStorage.getItem('devshelf_token');
    const savedUser = localStorage.getItem('devshelf_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    // Corresponds to POST /api/auth/login in Postman
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, id, userName, email: userEmail } = response.data;

    const userData = { id, userName, email: userEmail };

    // Update state
    setToken(receivedToken);
    setUser(userData);

    // Persist to localStorage across page reloads
    localStorage.setItem('devshelf_token', receivedToken);
    localStorage.setItem('devshelf_user', JSON.stringify(userData));

    return response.data;
  };

  // Register handler
  const register = async (userName, email, password) => {
    // Corresponds to POST /api/auth/register in Postman
    const response = await api.post('/auth/register', {
      userName,
      email,
      password,
    });
    return response.data;
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('devshelf_token');
    localStorage.removeItem('devshelf_user');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for consuming auth in components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## Phase 4: Routing & Protected Route Guards

### 4.1 What is a Protected Route?

**WHAT:** A wrapper component that checks whether a user is authenticated before rendering a private page.

**WHY:** If an unauthenticated visitor tries to navigate directly to `/resources` or `/tasks`, the app must immediately redirect them to `/login`.

---

### 4.2 Create `ProtectedRoute.jsx`

Create `client/src/components/ProtectedRoute.jsx`:

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  // Show a loading indicator while reading credentials from localStorage
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading session...</div>;
  }

  // If not authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child route component
  return <Outlet />;
}
```

---

### 4.3 Configure Main App Routes in `App.jsx`

Edit `client/src/App.jsx`:

```jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResourcesPage from './pages/ResourcesPage';
import SnippetsPage from './pages/SnippetsPage';
import TasksPage from './pages/TasksPage';

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes (Require Login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/resources" replace />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/snippets" element={<SnippetsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Route>

          {/* Catch-all 404 Route */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </main>
    </>
  );
}
```

---

### 4.4 Wrap Application with `BrowserRouter` and `AuthProvider`

Edit `client/src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## Phase 5: Authentication Pages (Register & Login)

### 5.1 Registration Page (`RegisterPage.jsx`)

Create `client/src/pages/RegisterPage.jsx`:

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(userName, email, password);
      // Registration succeeded — send them to login
      navigate('/login');
    } catch (err) {
      // Backend returns { error: "Email already taken" } on 400
      const serverMessage = err.response?.data?.error || 'Registration failed. Please check your inputs.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create an Account</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Username</label>
          <input
            type="text"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
```

---

### 5.2 Login Page (`LoginPage.jsx`)

Create `client/src/pages/LoginPage.jsx`:

```jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Login succeeded — navigate to the protected dashboard
      navigate('/resources');
    } catch (err) {
      // Backend returns { error: "Invalid email or password" } on 400
      const serverMessage = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Sign In to DevShelf</h2>
      {error && <div style={{ color: 'red', marginBottom: '1rem', background: '#ffebee', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
```

---

## Phase 6: Navbar & Shared Layout

Create `client/src/components/Navbar.jsx`:

```jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1e293b', color: '#fff' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>DevShelf</Link>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <Link to="/resources" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Resources</Link>
            <Link to="/snippets" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Snippets</Link>
            <Link to="/tasks" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Tasks</Link>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Hello, {user?.userName}</span>
            <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

---

## Phase 7: Building the CRUD Pages

Every CRUD feature follows a repeatable 5-step React pattern:
1. **Fetch on mount**: `useEffect` calls `GET /api/{entity}` and stores results in state.
2. **Loading state**: Render a "Loading..." placeholder while the request is in flight.
3. **Create**: Form submission sends `POST /api/{entity}` with payload, then appends the newly created item to state.
4. **Update**: Form submission or inline edit sends `PUT /api/{entity}/{id}` or `PATCH`, then updates the item in state.
5. **Delete**: Button click sends `DELETE /api/{entity}/{id}`, then filters the deleted item out of state.

---

### 7.1 Resources Page (Bookmarks CRUD)

Create `client/src/pages/ResourcesPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import api from '../api/client';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('docs');

  // 1. Fetch all resources for the logged-in user
  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources');
      setResources(res.data);
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // 2. Create a new resource
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/resources', { title, url, notes, type });
      // Prepend the new resource to the list
      setResources([res.data, ...resources]);
      // Reset form
      setTitle('');
      setUrl('');
      setNotes('');
      setType('docs');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create resource');
    }
  };

  // 3. Delete a resource
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete resource');
    }
  };

  return (
    <div>
      <h1>Developer Resources</h1>
      <p>Bookmark useful documentation, tools, and tutorials.</p>

      {/* Create Form */}
      <form onSubmit={handleCreate} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
        <h3>Add New Resource</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. React 19 Docs" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>URL *</label>
            <input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://react.dev" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Notes</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Key takeaways or instructions" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="docs">Documentation</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="tool">Tool</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Resource
        </button>
      </form>

      {/* Items List */}
      {loading ? (
        <p>Loading resources...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : resources.length === 0 ? (
        <p>No resources found. Create your first bookmark above!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resources.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div>
                <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0284c7' }}>
                  {item.title}
                </a>
                <span style={{ marginLeft: '0.75rem', padding: '0.2rem 0.5rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.8rem' }}>
                  {item.type}
                </span>
                {item.notes && <p style={{ margin: '0.5rem 0 0 0', color: '#475569', fontSize: '0.9rem' }}>{item.notes}</p>}
              </div>

              <button onClick={() => handleDelete(item.id)} style={{ padding: '0.4rem 0.8rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 7.2 Snippets Page (Code Snippets CRUD)

Create `client/src/pages/SnippetsPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import api from '../api/client';

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState('');

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/snippets');
      setSnippets(res.data);
    } catch (err) {
      alert('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/snippets', { title, description, code, language, tags });
      setSnippets([res.data, ...snippets]);
      setTitle('');
      setDescription('');
      setCode('');
      setTags('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create snippet');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this code snippet?')) return;
    try {
      await api.delete(`/snippets/${id}`);
      setSnippets(snippets.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete snippet');
    }
  };

  return (
    <div>
      <h1>Code Snippets</h1>
      <p>Save reusable code blocks with syntax highlighting language labels.</p>

      {/* Snippet Form */}
      <form onSubmit={handleCreate} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
        <h3>Add New Code Snippet</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Axios Request Interceptor" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="csharp">C# (.NET)</option>
              <option value="python">Python</option>
              <option value="sql">SQL</option>
              <option value="plaintext">Plaintext</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem' }}>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief summary of what this code does" style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem' }}>Code Block *</label>
          <textarea
            required
            rows={5}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste code snippet here..."
            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem' }}>Tags (comma-separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, axios, auth" style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#0f766e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Save Snippet
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p>Loading snippets...</p>
      ) : snippets.length === 0 ? (
        <p>No snippets saved yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {snippets.map((s) => (
            <div key={s.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '0.75rem 1rem' }}>
                <div>
                  <strong>{s.title}</strong>
                  <span style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem', background: '#e2e8f0', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {s.language}
                  </span>
                </div>
                <button onClick={() => handleDelete(s.id)} style={{ padding: '0.3rem 0.6rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>

              {s.description && <p style={{ padding: '0.5rem 1rem', margin: 0, fontSize: '0.9rem', color: '#475569' }}>{s.description}</p>}

              <pre style={{ margin: 0, padding: '1rem', background: '#1e293b', color: '#f8fafc', overflowX: 'auto', fontSize: '0.85rem' }}>
                <code>{s.code}</code>
              </pre>

              {s.tags && (
                <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', fontSize: '0.8rem', color: '#64748b' }}>
                  Tags: {s.tags}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### 7.3 Tasks Page (Dev Tasks CRUD + Status Toggle)

**WHAT:** Demonstrates querying with filters (`?status=todo`) and issuing partial updates via `PATCH /api/tasks/{id}/status`.

Create `client/src/pages/TasksPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import api from '../api/client';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(''); // empty = all

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [project, setProject] = useState('');

  // 1. Fetch tasks with optional query filter
  const fetchTasks = async (statusFilter = '') => {
    try {
      setLoading(true);
      const url = statusFilter ? `/tasks?status=${statusFilter}` : '/tasks';
      const res = await api.get(url);
      setTasks(res.data);
    } catch (err) {
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(filterStatus);
  }, [filterStatus]);

  // 2. Create Task
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', {
        title,
        description,
        status: 'todo',
        priority,
        project,
      });
      setTasks([res.data, ...tasks]);
      setTitle('');
      setDescription('');
      setProject('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create task');
    }
  };

  // 3. Partial Update via PATCH: change status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${id}/status`, { status: newStatus });
      // Update the local task object in state
      setTasks(tasks.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  // 4. Delete Task
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1>Developer Tasks</h1>
          <p>Track your feature backlog, bugs, and learning roadmap.</p>
        </div>

        {/* Filter Dropdown */}
        <div>
          <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.4rem' }}>
            <option value="">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* Create Form */}
      <form onSubmit={handleCreate} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
        <h3>Create New Task</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Implement refresh token flow" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details or acceptance criteria" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Project</label>
            <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g. DevShelf Frontend" style={{ width: '100%', padding: '0.5rem' }} />
          </div>
        </div>

        <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Add Task
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks found for this filter.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                background: task.status === 'done' ? '#f8fafc' : '#fff',
                opacity: task.status === 'done' ? 0.75 : 1,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </span>

                <span
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    background: task.priority === 'high' ? '#fee2e2' : task.priority === 'low' ? '#f1f5f9' : '#fef3c7',
                    color: task.priority === 'high' ? '#991b1b' : task.priority === 'low' ? '#475569' : '#92400e',
                  }}
                >
                  {task.priority}
                </span>

                {task.project && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                    [{task.project}]
                  </span>
                )}

                {task.description && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>{task.description}</p>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  style={{ padding: '0.3rem 0.6rem', borderRadius: '4px' }}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <button onClick={() => handleDelete(task.id)} style={{ padding: '0.3rem 0.6rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Phase 8: End-to-End Testing & Debugging

### 8.1 How to Run the Complete Stack

1. **Terminal 1: Start the Backend**
   ```bash
   cd server
   dotnet run
   ```
   *Verify it outputs:* `Now listening on: http://localhost:5259`

2. **Terminal 2: Start the Frontend**
   ```bash
   cd client
   npm run dev
   ```
   *Verify it outputs:* `Local: http://localhost:5173/`

---

### 8.2 Inspecting Requests in Browser DevTools

Open your browser DevTools (`F12`) and navigate to the **Network** tab:
1. **Preflight `OPTIONS` request**: Whenever your frontend sends a request with an `Authorization` header, the browser automatically sends an `OPTIONS` preflight request first to verify CORS headers. You should see a status `204` or `200`.
2. **Actual request**: The follow-up `POST` or `GET` will show:
   - **Request Headers**: Look for `Authorization: Bearer eyJhb...`
   - **Request Payload**: Inspect the JSON sent in `POST` / `PUT`
   - **Response**: Inspect the JSON returned by the backend

---

### 8.3 Debugging Cheatsheet

| Symptom | Cause | Solution |
|---|---|---|
| **CORS Error** in console | Frontend is not on `localhost:5173` | Check `Program.cs` CORS policy or ensure Vite is using port 5173. |
| **401 Unauthorized** on all CRUD calls | Token missing or not formatted as `Bearer <token>` | Inspect `localStorage.getItem('devshelf_token')`. Ensure interceptor has `Bearer ${token}`. |
| **Logged out immediately on page refresh** | Session not restoring in `AuthContext` | Check `useEffect` in `AuthContext.jsx` to verify it reads from `localStorage`. |
| **Cannot read properties of undefined (`data`)** | Backend is offline or returned an unexpected shape | Check the **Network** tab to see if the server returned a `500` error or if the backend terminal crashed. |
| **Infinite re-render loop** | Calling fetch inside component body without `useEffect` | Always wrap API GET calls inside `useEffect(() => { ... }, [])`. |

---

## Summary

You have built:
- An Axios client with automatic Bearer token injection.
- Global authentication state with login persistence.
- Protected client-side routing.
- Three complete CRUD dashboards (Resources, Snippets, Tasks) connected directly to your ASP.NET Core backend.
