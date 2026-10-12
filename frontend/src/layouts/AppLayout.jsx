import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar.jsx";
import GlobalSearch from "../components/GlobalSearch.jsx";
import "./AppLayout.css";

function AppLayout() {
    return (
        <div className="app-layout">
            <SideBar />

            <main className="main-content">
                <header className="workspace-topbar">
                    <div className="workspace-context">
                        <span className="workspace-eyebrow">
                            YOUR DEVELOPER WORKSPACE
                        </span>
                        <p>Learn, organise, and build in one place.</p>
                    </div>

                    <GlobalSearch />
                </header>

                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AppLayout;