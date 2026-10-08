import { NavLink } from "react-router-dom";
import "./SideBar.css";

function SideBar() {
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

    </aside>
  );
}

export default SideBar;