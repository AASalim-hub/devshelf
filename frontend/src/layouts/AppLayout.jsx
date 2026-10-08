import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar.jsx";
import "./AppLayout.css";

function AppLayout() {
  return (
    <div className="app-layout">
      <SideBar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;