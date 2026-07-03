import EmployeeManagement from "./EmployeeManagement";
import JobList from "./JobList";
import ActiveTimers from "./ActiveTimers";
import WorkHistory from "./WorkHistory";
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <EmployeeManagement />

      <JobList />
      <ActiveTimers />
      <WorkHistory />
    </div>
  );
}

export default AdminDashboard;
