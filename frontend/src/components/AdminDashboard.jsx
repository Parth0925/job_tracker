import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>

          <p className="dashboard-subtitle">
            Manage workforce operations, track activity, and monitor business
            performance.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Employees</h3>
          <p>Manage employee profiles, roles, and workforce information.</p>
        </div>

        <div className="dashboard-card">
          <h3>Jobs</h3>
          <p>Create, assign, and monitor ongoing job activities.</p>
        </div>

        <div className="dashboard-card">
          <h3>Reports</h3>
          <p>Review reports and analyze workforce performance.</p>
        </div>

        <div className="dashboard-card">
          <h3>Timers</h3>
          <p>Track active work sessions and productivity.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
