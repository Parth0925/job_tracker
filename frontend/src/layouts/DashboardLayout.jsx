import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import AdminDashboard from "../components/AdminDashboard";
import EmployeeDashboard from "../components/EmployeeDashboard";
import EmployeeManagement from "../components/EmployeeManagement";
import JobList from "../components/JobList";
import MessageCenter from "../components/MessageCenter";
import Reports from "../components/Reports";
import ActiveTimers from "../components/ActiveTimers";
import WorkHistory from "../components/WorkHistory";
import Configurations from "../components/Configuration";
import Organisation from "../components/Organisation";

import { useAuth } from "../context/AuthContext";

import "./DashboardLayout.css";

function DashboardLayout() {
  const { user } = useAuth();

  const activeRole = user?.activeRole;
  const pagePermissions = activeRole?.pagePermissions || [];

  const [active, setActive] = useState("Dashboard");
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  useEffect(() => {
    if (pagePermissions.length === 0) {
      setActive("");
      return;
    }

    if (!pagePermissions.includes(active)) {
      setActive(pagePermissions[0]);
    }
  }, [activeRole?._id, pagePermissions, active]);

  const handlePageChange = (page, messageId = null) => {
    if (!pagePermissions.includes(page)) {
      return;
    }

    setSelectedMessageId(messageId);
    setActive(page);
  };

  const renderModule = () => {
    switch (active) {
      case "Dashboard":
        return <AdminDashboard />;

      case "Employee Dashboard":
        return <EmployeeDashboard employee={user} />;

      case "Employees":
        return <EmployeeManagement />;

      case "Organisation":
        return <Organisation />;

      case "Jobs":
        return <JobList />;

      case "Messages":
        return (
          <MessageCenter
            selectedMessageId={selectedMessageId}
            onMessageOpened={() => setSelectedMessageId(null)}
          />
        );

      case "Reports":
        return <Reports />;

      case "Timers":
        return <ActiveTimers />;

      case "Work History":
        return <WorkHistory />;

      case "Configurations":
        return <Configurations />;

      default:
        return null;
    }
  };

  return (
    <div className="layout">
      <Sidebar active={active} setActive={handlePageChange} />

      <div className="layout-content">
        <Topbar onPageChange={handlePageChange} />

        <main className="page-content">
          <div className="page-wrapper">
            {pagePermissions.length === 0 ? (
              <div className="configuration-empty">
                <h3>No Page Access</h3>
                <p>No pages have been assigned to your active role.</p>
              </div>
            ) : (
              renderModule()
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
