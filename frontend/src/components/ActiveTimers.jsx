import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./ActiveTimers.css";
import "./JobList.css";
import CommonCard from "./CommonCard";

function ActiveTimers() {
  const [timers, setTimers] = useState([]);
  const [now, setNow] = useState(new Date());
  const [employeeFilter, setEmployeeFilter] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    fetchTimers();

    const fetchInterval = setInterval(() => {
      fetchTimers();
    }, 5000);

    const clockInterval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const fetchTimers = async () => {
    try {
      const response = await api.get("/timers");
      setTimers(response.data);
    } catch (error) {
      console.log("Timer fetch error:", error);
    }
  };

  const calculateDuration = (startedAt) => {
    const start = new Date(startedAt);

    const diff = Math.max(0, Math.floor((now - start) / 1000));

    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;

    return (
      String(hrs).padStart(2, "0") +
      ":" +
      String(mins).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );
  };

  const employeeOptions = useMemo(() => {
    const employees = timers
      .map((timer) => {
        const employee = timer.employeeId;

        if (!employee?._id) return null;

        return {
          id: employee._id,
          name:
            employee.firstName || employee.lastName
              ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim()
              : employee.name || "Employee",
        };
      })
      .filter(Boolean);

    const uniqueEmployees = new Map();

    employees.forEach((employee) => {
      uniqueEmployees.set(employee.id, employee);
    });

    return Array.from(uniqueEmployees.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [timers]);

  const filteredTimers = useMemo(() => {
    if (!employeeFilter) {
      return timers;
    }

    return timers.filter((timer) => timer.employeeId?._id === employeeFilter);
  }, [timers, employeeFilter]);

  const openJobDetails = async (jobId) => {
    if (!jobId) return;

    try {
      const response = await api.get("/jobs");

      const job = response.data.find(
        (item) => item._id === (jobId?._id || jobId),
      );

      if (!job) {
        alert("Job details could not be found.");
        return;
      }

      setSelectedJob(job);
      setShowJobModal(true);
    } catch (error) {
      console.log("Job details error:", error);
      alert("Unable to load job details.");
    }
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setSelectedJob(null);
  };

  const getStatusClass = (jobStatus) => {
    switch (jobStatus) {
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

  const getPriorityClass = (jobPriority) => {
    switch (jobPriority) {
      case "High":
        return "priority-high";

      case "Low":
        return "priority-low";

      default:
        return "priority-medium";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return String(date).substring(0, 10);
  };

  const getBudgetUtilization = (job) => {
    return Number(job?.budgetSummary?.budgetUtilization || 0);
  };

  return (
    <CommonCard title="Active Timers">
      <div className="active-timers-header">
        <div>
          <h2 className="active-timers-title">Currently Working</h2>

          <p className="active-timers-subtitle">
            Monitor employees who are currently working on jobs.
          </p>
        </div>

        <div className="active-timer-count">
          <span className="active-dot"></span>

          <strong>{filteredTimers.length}</strong>

          <span>Active</span>
        </div>
      </div>

      <div className="active-timers-filter">
        <div className="filter-field">
          <label>Employee</label>

          <select
            className="form-input"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
          >
            <option value="">All Employees</option>

            {employeeOptions.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </div>

        {employeeFilter && (
          <button
            type="button"
            className="clear-timer-filter"
            onClick={() => setEmployeeFilter("")}
          >
            Clear Filter
          </button>
        )}
      </div>

      {filteredTimers.length === 0 ? (
        <div className="empty-timers">
          <div className="empty-timers-icon">⏱</div>

          <h3>
            {employeeFilter ? "Employee Is Not Working" : "No Active Timers"}
          </h3>

          <p>
            {employeeFilter
              ? "The selected employee is not currently working on a job."
              : "No employees are currently working on a job."}
          </p>
        </div>
      ) : (
        <div className="timers-grid">
          {filteredTimers.map((timer) => {
            const employee = timer.employeeId;

            const employeeName =
              employee?.firstName || employee?.lastName
                ? `${employee?.firstName || ""} ${
                    employee?.lastName || ""
                  }`.trim()
                : employee?.name || "Employee";

            const employeeInitial =
              employeeName.charAt(0)?.toUpperCase() || "E";

            const jobName = timer.jobId?.jobName || timer.jobId?.title || "Job";

            return (
              <div
                key={timer._id}
                className="timer-work-card"
                onClick={() => openJobDetails(timer.jobId)}
                style={{ cursor: "pointer" }}
              >
                <div className="timer-card-header">
                  <div className="employee-avatar">{employeeInitial}</div>

                  <div className="employee-info">
                    <h3>{employeeName}</h3>

                    <span className="working-status">
                      <span className="status-dot"></span>
                      Working
                    </span>
                  </div>
                </div>

                <div className="timer-job-info">
                  <span className="timer-label">JOB</span>

                  <p>{jobName}</p>
                </div>

                <div className="timer-details">
                  <div className="timer-detail">
                    <span className="timer-label">STARTED</span>

                    <strong>
                      {new Date(timer.startedAt).toLocaleTimeString()}
                    </strong>
                  </div>

                  <div className="timer-detail">
                    <span className="timer-label">RUNNING</span>

                    <strong className="running-time">
                      {calculateDuration(timer.startedAt)}
                    </strong>
                  </div>
                </div>

                <div className="timer-live-bar">
                  <span></span>
                  Live timer
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    textAlign: "right",
                    opacity: 0.7,
                  }}
                >
                  View Job Details →
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================
          JOB DETAILS MODAL
      ========================== */}

      {showJobModal && selectedJob && (
        <div className="job-modal-overlay" onClick={closeJobModal}>
          <div className="job-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-eyebrow">JOB DETAILS</div>

                <h2>{selectedJob.jobName}</h2>

                <p>
                  {selectedJob.clientName} <span>•</span>{" "}
                  {selectedJob.projectName}
                </p>
              </div>

              <button
                className="close-btn"
                type="button"
                onClick={closeJobModal}
              >
                ✕
              </button>
            </div>

            <div className="modal-badges">
              <span
                className={`status-badge ${getStatusClass(selectedJob.status)}`}
              >
                {selectedJob.status}
              </span>

              <span
                className={`priority-badge ${getPriorityClass(
                  selectedJob.priority,
                )}`}
              >
                {selectedJob.priority} Priority
              </span>

              <span className="type-badge">{selectedJob.jobType}</span>
            </div>

            <div className="modal-section">
              <h3>Overview</h3>

              <div className="modal-info-grid">
                <div>
                  <span>Client</span>
                  <strong>{selectedJob.clientName}</strong>
                </div>

                <div>
                  <span>Project</span>
                  <strong>{selectedJob.projectName}</strong>
                </div>

                <div>
                  <span>Job Name</span>
                  <strong>{selectedJob.jobName}</strong>
                </div>

                <div>
                  <span>Job Type</span>
                  <strong>{selectedJob.jobType}</strong>
                </div>

                <div>
                  <span>Priority</span>
                  <strong>{selectedJob.priority}</strong>
                </div>

                <div>
                  <span>Budgeted Hours</span>
                  <strong>{selectedJob.budgetedHours} hrs</strong>
                </div>

                <div>
                  <span>Assignment Date</span>
                  <strong>{formatDate(selectedJob.assignmentDate)}</strong>
                </div>

                <div>
                  <span>Completion Date</span>
                  <strong>{formatDate(selectedJob.completionDate)}</strong>
                </div>

                <div>
                  <span>Checklist</span>
                  <strong>
                    {selectedJob.checklistPrepared
                      ? "Prepared"
                      : "Not Prepared"}
                  </strong>
                </div>

                <div>
                  <span>Recurring</span>
                  <strong>{selectedJob.repeatJob ? "Yes" : "No"}</strong>
                </div>
              </div>
            </div>

            {selectedJob.repeatJob && (
              <div className="modal-section">
                <h3>Recurring Schedule</h3>

                <div className="modal-info-grid">
                  <div>
                    <span>Frequency</span>
                    <strong>{selectedJob.repeatFrequency}</strong>
                  </div>

                  <div>
                    <span>Next Due</span>
                    <strong>{formatDate(selectedJob.nextDueDate)}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-section">
              <h3>Description</h3>

              <div className="modal-text-box">
                {selectedJob.description || "No description provided."}
              </div>
            </div>

            <div className="modal-section">
              <h3>Budget Overview</h3>

              <div className="modal-budget-grid">
                <div>
                  <span>Budget</span>
                  <strong>{selectedJob.budgetedHours} hrs</strong>
                </div>

                <div>
                  <span>Spent</span>
                  <strong>
                    {selectedJob.budgetSummary?.spentHours || 0} hrs
                  </strong>
                </div>

                <div>
                  <span>Remaining</span>
                  <strong>
                    {selectedJob.budgetSummary?.remainingHours || 0} hrs
                  </strong>
                </div>

                <div>
                  <span>Efficiency</span>
                  <strong>{selectedJob.budgetSummary?.efficiency || 0}%</strong>
                </div>
              </div>

              <div className="modal-budget-progress">
                <div
                  className={`budget-progress-fill ${
                    getBudgetUtilization(selectedJob) > 100
                      ? "budget-danger"
                      : getBudgetUtilization(selectedJob) >= 80
                        ? "budget-warning"
                        : "budget-good"
                  }`}
                  style={{
                    width: `${Math.min(
                      getBudgetUtilization(selectedJob),
                      100,
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Assignments</h3>

              {selectedJob.assignments?.length ? (
                <div className="modal-assignment-list">
                  {selectedJob.assignments.map((assignment, index) => (
                    <div className="modal-assignment" key={index}>
                      <div className="employee-avatar large">
                        {assignment.employeeId?.firstName
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {assignment.employeeId?.firstName}{" "}
                          {assignment.employeeId?.lastName}
                        </strong>

                        <span>{assignment.role}</span>
                      </div>

                      <strong className="modal-assignment-hours">
                        {assignment.allocatedHours} hrs
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="modal-text-box">No assignments.</div>
              )}
            </div>

            <div className="modal-section">
              <h3>Communication Log</h3>

              <div className="modal-text-box">
                {selectedJob.communicationLog || "No communication recorded."}
              </div>
            </div>

            <div className="modal-section">
              <h3>Review</h3>

              <div className="review-info">
                <div>
                  <span>Submitted</span>

                  <strong>
                    {selectedJob.submittedForReview ? "Yes" : "No"}
                  </strong>
                </div>

                <div>
                  <span>Review Status</span>

                  <strong>{selectedJob.reviewStatus || "Pending"}</strong>
                </div>
              </div>
            </div>

            <div className="modal-section">
              <h3>Live Timer</h3>

              <div className="modal-budget-grid">
                <div>
                  <span>Employee</span>

                  <strong>
                    {selectedJob.assignments?.find(
                      (assignment) =>
                        assignment.employeeId?._id ===
                        filteredTimers.find(
                          (timer) =>
                            timer.jobId?._id === selectedJob._id ||
                            timer.jobId === selectedJob._id,
                        )?.employeeId?._id,
                    )?.employeeId?.firstName || "Currently Working"}
                  </strong>
                </div>

                <div>
                  <span>Job</span>

                  <strong>{selectedJob.jobName}</strong>
                </div>

                <div>
                  <span>Spent</span>

                  <strong>
                    {selectedJob.budgetSummary?.spentHours || 0} hrs
                  </strong>
                </div>

                <div>
                  <span>Budget</span>

                  <strong>{selectedJob.budgetedHours} hrs</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </CommonCard>
  );
}

export default ActiveTimers;
