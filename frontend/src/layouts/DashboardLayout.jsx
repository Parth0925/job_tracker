import { useState } from "react";

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

import { useAuth } from "../context/AuthContext";

import "./DashboardLayout.css";

function DashboardLayout() {
  const [active, setActive] = useState("Dashboard");

  const { user } = useAuth();

  const renderModule = () => {
    if (user.role === "employee") {
      switch (active) {
        case "Work History":
          return <EmployeeDashboard employee={user} />;

        default:
          return <EmployeeDashboard employee={user} />;
      }
    }

    switch (active) {
      case "Employees":
        return <EmployeeManagement />;

      case "Jobs":
        return <JobList />;

      case "Messages":
        return <MessageCenter />;

      case "Reports":
        return <Reports />;

      case "Timers":
        return <ActiveTimers />;

      case "Work History":
        return <WorkHistory />;

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="layout">
      <Sidebar active={active} setActive={setActive} />

      <div className="layout-content">
        <Topbar />

        <main className="page-content">
          <div className="page-wrapper">{renderModule()}</div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
