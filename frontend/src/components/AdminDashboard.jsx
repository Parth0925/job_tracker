import { useEffect, useMemo, useState } from "react";

import api from "../services/api";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [timers, setTimers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesResponse, jobsResponse, timersResponse] =
        await Promise.all([
          api.get("/employees"),
          api.get("/jobs"),
          api.get("/timers"),
        ]);

      setEmployees(employeesResponse.data || []);
      setJobs(jobsResponse.data || []);
      setTimers(timersResponse.data || []);
    } catch (error) {
      console.log("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeEmployees = employees.filter(
      (employee) => employee.status === "Active",
    ).length;

    const activeJobs = jobs.filter(
      (job) => job.status !== "Completed" && job.status !== "Rejected",
    ).length;

    const completedJobs = jobs.filter(
      (job) => job.status === "Completed",
    ).length;

    const budgetedHours = jobs.reduce(
      (total, job) => total + Number(job.budgetedHours || 0),
      0,
    );

    const spentHours = jobs.reduce(
      (total, job) => total + Number(job.budgetSummary?.spentHours || 0),
      0,
    );

    const remainingHours = jobs.reduce(
      (total, job) => total + Number(job.budgetSummary?.remainingHours || 0),
      0,
    );

    const utilization =
      budgetedHours > 0
        ? ((spentHours / budgetedHours) * 100).toFixed(1)
        : "0.0";

    return {
      totalEmployees: employees.length,
      activeEmployees,
      totalJobs: jobs.length,
      activeJobs,
      completedJobs,
      activeTimers: timers.length,
      budgetedHours,
      spentHours,
      remainingHours,
      utilization,
    };
  }, [employees, jobs, timers]);

  const jobStatuses = [
    "Not Started",
    "Awaiting Info",
    "In Review",
    "Completed",
    "Rejected",
  ];

  const getStatusCount = (status) =>
    jobs.filter((job) => job.status === status).length;

  const recentJobs = [...jobs]
    .sort((a, b) => {
      const dateA = new Date(a.assignmentDate || a.createdAt || 0);
      const dateB = new Date(b.assignmentDate || b.createdAt || 0);

      return dateB - dateA;
    })
    .slice(0, 6);

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status-completed";

      case "In Review":
        return "status-review";

      case "Awaiting Info":
        return "status-awaiting";

      case "Rejected":
        return "status-rejected";

      default:
        return "status-not-started";
    }
  };

  const formatHours = (hours) => Number(hours || 0).toFixed(1);

  if (loading) {
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

        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

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

        <button
          type="button"
          className="refresh-button"
          onClick={fetchDashboardData}
        >
          Refresh
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Employees</span>
          <strong className="stat-value">{stats.totalEmployees}</strong>
          <span className="stat-meta">{stats.activeEmployees} active</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Jobs</span>
          <strong className="stat-value">{stats.totalJobs}</strong>
          <span className="stat-meta">{stats.activeJobs} active</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Completed Jobs</span>
          <strong className="stat-value">{stats.completedJobs}</strong>
          <span className="stat-meta">
            {stats.totalJobs > 0
              ? `${((stats.completedJobs / stats.totalJobs) * 100).toFixed(0)}% of total`
              : "0% of total"}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Timers</span>
          <strong className="stat-value">{stats.activeTimers}</strong>
          <span className="stat-meta">Currently working</span>
        </div>
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Job Status Overview</h2>
              <p>Current distribution of all jobs</p>
            </div>
          </div>

          <div className="status-list">
            {jobStatuses.map((status) => (
              <div className="status-row" key={status}>
                <div className="status-row-info">
                  <span
                    className={`status-dot ${getStatusClass(status)}`}
                  ></span>

                  <span>{status}</span>
                </div>

                <strong>{getStatusCount(status)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Hours Overview</h2>
              <p>Overall job budget utilization</p>
            </div>
          </div>

          <div className="hours-summary">
            <div className="hours-item">
              <span>Budgeted</span>
              <strong>{formatHours(stats.budgetedHours)} hrs</strong>
            </div>

            <div className="hours-item">
              <span>Spent</span>
              <strong>{formatHours(stats.spentHours)} hrs</strong>
            </div>

            <div className="hours-item">
              <span>Remaining</span>
              <strong>{formatHours(stats.remainingHours)} hrs</strong>
            </div>
          </div>

          <div className="utilization-section">
            <div className="utilization-header">
              <span>Budget Utilization</span>
              <strong>{stats.utilization}%</strong>
            </div>

            <div className="utilization-bar">
              <div
                className="utilization-fill"
                style={{
                  width: `${Math.min(Number(stats.utilization), 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Currently Working</h2>
            <p>Employees with active work sessions</p>
          </div>

          <span className="panel-count">{timers.length} active</span>
        </div>

        {timers.length === 0 ? (
          <div className="empty-state">
            <h3>No active timers</h3>
            <p>No employees are currently working on a timer.</p>
          </div>
        ) : (
          <div className="active-work-grid">
            {timers.map((timer) => {
              const employee = timer.employeeId;
              const job = timer.jobId;

              const employeeName = employee
                ? `${employee.firstName || ""} ${
                    employee.lastName || ""
                  }`.trim()
                : "Unknown Employee";

              const jobName = job?.jobName || job?.title || "Unknown Job";

              return (
                <div className="active-work-card" key={timer._id}>
                  <div className="active-work-header">
                    <div className="active-avatar">
                      {employee?.firstName?.charAt(0) || "?"}
                      {employee?.lastName?.charAt(0) || ""}
                    </div>

                    <div>
                      <h3>{employeeName}</h3>
                      <p>{employee?.employeeCode || "Employee"}</p>
                    </div>

                    <span className="working-badge">Working</span>
                  </div>

                  <div className="active-work-job">
                    <span>Job</span>
                    <strong>{jobName}</strong>
                  </div>

                  <div className="active-work-time">
                    Started{" "}
                    {timer.startedAt
                      ? new Date(timer.startedAt).toLocaleTimeString()
                      : "-"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Recent Jobs</h2>
            <p>Latest jobs in the system</p>
          </div>

          <span className="panel-count">{recentJobs.length} shown</span>
        </div>

        {recentJobs.length === 0 ? (
          <div className="empty-state">
            <h3>No jobs available</h3>
            <p>Jobs will appear here once they are created.</p>
          </div>
        ) : (
          <div className="recent-jobs-wrapper">
            <table className="recent-jobs-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                </tr>
              </thead>

              <tbody>
                {recentJobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <strong>{job.jobName}</strong>
                      <span>{job.projectName}</span>
                    </td>

                    <td>{job.clientName}</td>

                    <td>
                      <span
                        className={`job-status-badge ${getStatusClass(
                          job.status,
                        )}`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td>{formatHours(job.budgetedHours)} hrs</td>

                    <td>{formatHours(job.budgetSummary?.spentHours)} hrs</td>

                    <td>
                      {formatHours(job.budgetSummary?.remainingHours)} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
