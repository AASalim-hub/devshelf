
import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar.jsx";
import GlobalSearch from "../components/GlobalSearch.jsx";
import "./AppLayout.css";

function AppLayout() {
    return (
        <div className="app-layout">
            <SideBar />

            <main className="main-content">
                <GlobalSearch />
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
