import { Search, Bell, LogOut, ChevronDown } from "lucide-react";

import { useAuth } from "../context/AuthContext";

import api from "../services/api";

import "./Topbar.css";

function Topbar() {
  const { user, logout, updateActiveRole } = useAuth();

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const roles = user?.roles || [];
  const activeRole = user?.activeRole;

  const handleRoleChange = async (event) => {
    const selectedRole = roles.find((role) => role._id === event.target.value);

    if (!selectedRole) return;

    try {
      await api.patch(`/employees/${user._id}/active-role`, {
        activeRole: selectedRole._id,
      });

      updateActiveRole(selectedRole);

      // window.location.reload();
    } catch (error) {
      console.log("Role switch error:", error);

      alert(error.response?.data?.message || "Failed to switch role.");
    }
  };

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

        {roles.length > 0 && (
          <div className="role-switcher">
            <select
              value={activeRole?._id || ""}
              onChange={handleRoleChange}
              aria-label="Switch active role"
            >
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>

            <ChevronDown size={15} />
          </div>
        )}

        <div className="user-info">
          <div className="avatar">{initials}</div>

          <div className="user-details">
            <h4>
              {firstName} {lastName}
            </h4>

            <span>{activeRole?.name || user?.designation || "Employee"}</span>
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
