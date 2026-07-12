import { Search, Bell, LogOut } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./Topbar.css";

function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="search-box">
          <Search size={18} />

          <input type="text" placeholder="Search employees, jobs..." />
        </div>
      </div>

      <div className="topbar-right">
        <button className="icon-btn">
          <Bell size={18} />
        </button>

        <div className="user-info">
          <div className="avatar">{user.firstName.charAt(0)}</div>

          <div className="user-details">
            <h4>
              {user.firstName} {user.lastName}
            </h4>

            <span>{user.role}</span>
          </div>
        </div>

        <button className="logout-icon" onClick={logout}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;
