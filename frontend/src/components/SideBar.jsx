
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./SideBar.css";

function SideBar() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");

        navigate("/login", { replace: true });
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                type="button"
                className="mobile-menu-toggle"
                aria-label={
                    isOpen
                        ? "Close navigation menu"
                        : "Open navigation menu"
                }
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Dark overlay behind the mobile sidebar */}
            {isOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close navigation menu"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar navigation */}
            <aside
                className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
            >
                <div className="sidebar-logo">
                    <h2>DevShelf</h2>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            isActive
                                ? "sidebar-link active"
                                : "sidebar-link"
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/resources"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            isActive
                                ? "sidebar-link active"
                                : "sidebar-link"
                        }
                    >
                        Resources
                    </NavLink>

                    <NavLink
                        to="/snippet"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            isActive
                                ? "sidebar-link active"
                                : "sidebar-link"
                        }
                    >
                        Snippets
                    </NavLink>

                    <NavLink
                        to="/task"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            isActive
                                ? "sidebar-link active"
                                : "sidebar-link"
                        }
                    >
                        Tasks
                    </NavLink>
                </nav>

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={handleLogout}
                >
                    Log out
                </button>
            </aside>
        </>
    );
}

export default SideBar;
