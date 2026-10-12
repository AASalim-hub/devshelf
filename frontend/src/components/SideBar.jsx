import { NavLink, useNavigate } from "react-router-dom";
import "./SideBar.css";

function SideBar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");

        navigate("/login", { replace: true });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>DevShelf</h2>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/resources"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Resources
                </NavLink>

                <NavLink
                    to="/snippet"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    Snippets
                </NavLink>

                <NavLink
                    to="/task"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
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
    );
}

export default SideBar;