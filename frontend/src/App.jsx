import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout.jsx";

import DashboardPage from "./pages/DashboardPage.jsx";
import ResourcesPage from "./pages/ResourcesPage.jsx";
import SnippetPage from "./pages/SnippetPage.jsx";
import TaskPage from "./pages/TaskPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<AppLayout />}>

          <Route path="/" element={<DashboardPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/snippet" element={<SnippetPage />} />
          <Route path="/task" element={<TaskPage />} />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;