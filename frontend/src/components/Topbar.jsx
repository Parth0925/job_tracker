import { Search, Bell, LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./Topbar.css";

function Topbar() {
  const { user, logout } = useAuth();

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search employees, jobs..."
            aria-label="Search employees and jobs"
          />
        </div>
      </div>

      <div className="topbar-right">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="user-info">
          <div className="avatar">{initials}</div>

          <div className="user-details">
            <h4>
              {firstName} {lastName}
            </h4>

            <span>{user?.role || "Employee"}</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-icon"
          onClick={logout}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
