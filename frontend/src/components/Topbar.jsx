import { useEffect, useState } from "react";
import { Search, Bell, LogOut, ChevronDown, Check } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

import "./Topbar.css";

function Topbar({ onPageChange }) {
  const { user, logout, updateActiveRole } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const roles = user?.roles || [];
  const activeRole = user?.activeRole;

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const fetchNotifications = async () => {
    if (!user?._id) return;

    try {
      const response = await api.get(`/notifications/employee/${user._id}`);

      setNotifications(response.data || []);
    } catch (error) {
      console.log("Notifications fetch error:", error);
    }
  };

  useEffect(() => {
    if (!user?._id) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user?._id]);

  const handleRoleChange = async (event) => {
    const selectedRole = roles.find((role) => role._id === event.target.value);

    if (!selectedRole) return;

    try {
      await api.patch(`/employees/${user._id}/active-role`, {
        activeRole: selectedRole._id,
      });

      updateActiveRole(selectedRole);
    } catch (error) {
      console.log("Role switch error:", error);

      alert(error.response?.data?.message || "Failed to switch role.");
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.log("Mark notification read error:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user?._id || unreadCount === 0) return;

    try {
      await api.patch(`/notifications/employee/${user._id}/read-all`);

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );
    } catch (error) {
      console.log("Mark all notifications read error:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification) return;

    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
    }

    setShowNotifications(false);

    onPageChange?.("Messages", notification.messageId?._id);
  };

  const formatNotificationTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search employees, jobs..."
            aria-label="Search employees and jobs"
          />
        </div>
      </div>

      <div className="topbar-right">
        <div className="notification-wrapper">
          <button
            type="button"
            className="icon-btn notification-button"
            aria-label="Notifications"
            onClick={() => setShowNotifications((current) => !current)}
          >
            <Bell size={18} />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <div>
                  <h3>Notifications</h3>

                  <span>
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "No unread notifications"}
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="mark-all-notifications"
                    onClick={markAllNotificationsAsRead}
                  >
                    <Check size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={25} />

                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${
                        !notification.isRead ? "notification-unread" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-item-icon">
                        <Bell size={16} />
                      </div>

                      <div className="notification-item-content">
                        <div className="notification-item-top">
                          <strong>
                            {notification.title || "New Notification"}
                          </strong>

                          <span>
                            {formatNotificationTime(notification.createdAt)}
                          </span>
                        </div>

                        <p>
                          {notification.sender?.firstName}{" "}
                          {notification.sender?.lastName}
                        </p>

                        <div className="notification-message">
                          {notification.message}
                        </div>

                        {notification.jobId?.jobName && (
                          <div className="notification-job">
                            {notification.jobId.jobName}

                            {notification.jobId.clientName && (
                              <>
                                <span>•</span>

                                {notification.jobId.clientName}
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {!notification.isRead && (
                        <span className="notification-unread-dot" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
