import { useEffect, useMemo, useState } from "react";
import CommonCard from "./CommonCard";
import api from "../services/api";
import "./JobList.css";

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [clientFilter, setClientFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [reviewComments, setReviewComments] = useState("");

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Preparer");
  const [allocatedHours, setAllocatedHours] = useState("");

  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");

  const [budgetedHours, setBudgetedHours] = useState("");
  const [assignmentDate, setAssignmentDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [communicationLog, setCommunicationLog] = useState("");

  const [checklistPrepared, setChecklistPrepared] = useState(false);
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Not Started");
  const [jobType, setJobType] = useState("Billable");

  const [repeatJob, setRepeatJob] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState("None");
  const [nextDueDate, setNextDueDate] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchEmployees();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs");
      setJobs(response.data);
    } catch (error) {
      console.log("Jobs error:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (error) {
      console.log("Employees error:", error);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesClient = !clientFilter || job.clientName === clientFilter;

      const matchesProject =
        !projectFilter || job.projectName === projectFilter;

      const matchesJobType = !jobTypeFilter || job.jobType === jobTypeFilter;

      const matchesEmployee =
        !employeeFilter ||
        job.assignments?.some(
          (assignment) => assignment.employeeId?._id === employeeFilter,
        );

      const matchesStatus = !statusFilter || job.status === statusFilter;

      const matchesPriority =
        !priorityFilter || job.priority === priorityFilter;

      return (
        matchesClient &&
        matchesProject &&
        matchesJobType &&
        matchesEmployee &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    jobs,
    clientFilter,
    projectFilter,
    jobTypeFilter,
    employeeFilter,
    statusFilter,
    priorityFilter,
  ]);

  const clientOptions = [
    ...new Set(jobs.map((job) => job.clientName).filter(Boolean)),
  ];

  const projectOptions = [
    ...new Set(jobs.map((job) => job.projectName).filter(Boolean)),
  ];

  const clearFilters = () => {
    setClientFilter("");
    setProjectFilter("");
    setJobTypeFilter("");
    setEmployeeFilter("");
    setStatusFilter("");
    setPriorityFilter("");
  };

  const addAssignment = () => {
    if (!selectedEmployeeId) {
      alert("Please select an employee.");
      return;
    }

    const hours = Number(allocatedHours);

    if (!allocatedHours || hours <= 0) {
      alert("Please enter valid allocated hours.");
      return;
    }

    const employee = employees.find((emp) => emp._id === selectedEmployeeId);

    if (!employee) return;

    const alreadyExists = assignments.some(
      (assignment) =>
        assignment.employeeId === selectedEmployeeId &&
        assignment.role === selectedRole,
    );

    if (alreadyExists) {
      alert("This employee is already added for this role.");
      return;
    }

    setAssignments([
      ...assignments,
      {
        employeeId: selectedEmployeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        role: selectedRole,
        allocatedHours: hours,
      },
    ]);

    setSelectedEmployeeId("");
    setSelectedRole("Preparer");
    setAllocatedHours("");
  };

  const totalAllocatedHours = assignments.reduce(
    (total, assignment) => total + Number(assignment.allocatedHours || 0),
    0,
  );

  const budgetHoursNumber = Number(budgetedHours || 0);

  const remainingAllocation = budgetHoursNumber - totalAllocatedHours;

  const allocationComplete =
    budgetHoursNumber > 0 && totalAllocatedHours === budgetHoursNumber;

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (
      !clientName.trim() ||
      !projectName.trim() ||
      !jobName.trim() ||
      !budgetedHours ||
      assignments.length === 0
    ) {
      alert(
        "Please fill all required fields and assign at least one employee.",
      );
      return;
    }

    if (!allocationComplete) {
      alert(
        `Allocated hours must equal budgeted hours.\n\nBudgeted: ${budgetHoursNumber} hrs\nAllocated: ${totalAllocatedHours} hrs`,
      );
      return;
    }

    try {
      setLoading(true);

      await api.post("/jobs", {
        clientName,
        projectName,
        jobName,
        description,
        budgetedHours,
        assignments,
        jobType,
        repeatJob,
        repeatFrequency,
        nextDueDate,
        assignmentDate,
        completionDate,
        communicationLog,
        checklistPrepared,
        priority,
        status,
      });

      setClientName("");
      setProjectName("");
      setJobName("");
      setDescription("");
      setBudgetedHours("");

      setAssignments([]);
      setSelectedEmployeeId("");
      setSelectedRole("Preparer");
      setAllocatedHours("");

      setJobType("Billable");

      setRepeatJob(false);
      setRepeatFrequency("None");
      setNextDueDate("");

      setAssignmentDate("");
      setCompletionDate("");
      setCommunicationLog("");

      setChecklistPrepared(false);
      setPriority("Medium");
      setStatus("Not Started");

      await fetchJobs();
    } catch (error) {
      console.log("Create job error:", error);

      alert(error?.response?.data?.message || "Unable to create job.");
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      await api.patch(`/jobs/${jobId}/status`, {
        status: newStatus,
      });

      const updated = await api.get("/jobs");

      setJobs(updated.data);

      const current = updated.data.find((job) => job._id === jobId);

      if (current) {
        setSelectedJob(current);
      }
    } catch (error) {
      console.log("Status update error:", error);
    }
  };

  const reviewJob = async (action) => {
    if (!selectedJob) return;

    try {
      await api.post(`/jobs/${selectedJob._id}/review`, {
        action,
        comments: reviewComments,
      });

      await fetchJobs();

      setShowJobModal(false);
      setReviewComments("");
    } catch (error) {
      console.log("Review error:", error);
    }
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

  const totalJobs = jobs.length;

  const completedJobs = jobs.filter((job) => job.status === "Completed").length;

  const reviewJobs = jobs.filter((job) => job.status === "In Review").length;

  const awaitingJobs = jobs.filter(
    (job) => job.status === "Awaiting Info",
  ).length;

  const overBudgetJobs = jobs.filter(
    (job) => job.budgetSummary?.budgetStatus === "Over Budget",
  ).length;

  return (
    <CommonCard title="Job Management">
      {/* =========================
          PAGE HEADER
      ========================== */}

      <div className="job-page-header">
        <div>
          <h2 className="job-page-title">Job Management</h2>

          <p className="job-page-subtitle">
            Create, monitor and manage all client jobs.
          </p>
        </div>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================== */}

      <div className="job-summary-grid">
        <div className="job-summary-card">
          <div className="summary-icon summary-icon-blue">J</div>

          <div>
            <span className="summary-label">Total Jobs</span>

            <strong className="summary-value">{totalJobs}</strong>
          </div>
        </div>

        <div className="job-summary-card">
          <div className="summary-icon summary-icon-green">✓</div>

          <div>
            <span className="summary-label">Completed</span>

            <strong className="summary-value">{completedJobs}</strong>
          </div>
        </div>

        <div className="job-summary-card">
          <div className="summary-icon summary-icon-purple">↻</div>

          <div>
            <span className="summary-label">In Review</span>

            <strong className="summary-value">{reviewJobs}</strong>
          </div>
        </div>

        <div className="job-summary-card">
          <div className="summary-icon summary-icon-orange">!</div>

          <div>
            <span className="summary-label">Awaiting Info</span>

            <strong className="summary-value">{awaitingJobs}</strong>
          </div>
        </div>

        <div className="job-summary-card">
          <div className="summary-icon summary-icon-red">$</div>

          <div>
            <span className="summary-label">Over Budget</span>

            <strong className="summary-value">{overBudgetJobs}</strong>
          </div>
        </div>
      </div>

      {/* =========================
          CREATE JOB
      ========================== */}

      <div className="job-section-header">
        <div>
          <h2 className="section-title">Create New Job</h2>

          <p className="section-subtitle">
            Enter job information and assign employees.
          </p>
        </div>
      </div>

      <form className="job-form" onSubmit={handleCreateJob}>
        <div className="form-section">
          <div className="form-section-title">
            <span>01</span>
            Job Information
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>
                Client Name
                <span>*</span>
              </label>

              <input
                className="form-input"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>
                Project Name
                <span>*</span>
              </label>

              <input
                className="form-input"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>
                Job Name
                <span>*</span>
              </label>

              <input
                className="form-input"
                placeholder="Enter job name"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>
                Budgeted Hours
                <span>*</span>
              </label>

              <input
                className="form-input"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 8"
                value={budgetedHours}
                onChange={(e) => setBudgetedHours(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field form-field-full">
            <label>Job Description</label>

            <textarea
              className="form-textarea"
              placeholder="Describe the job, requirements or special instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>02</span>
            Job Settings
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Job Type</label>

              <select
                className="form-input"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="Billable">Billable</option>

                <option value="Non Billable">Non Billable</option>
              </select>
            </div>

            <div className="form-field">
              <label>Priority</label>

              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="form-field">
              <label>Status</label>

              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Awaiting Info</option>
                <option>Not Started</option>
                <option>In Review</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="form-field">
              <label>Checklist Prepared</label>

              <select
                className="form-input"
                value={checklistPrepared}
                onChange={(e) =>
                  setChecklistPrepared(e.target.value === "true")
                }
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>03</span>
            Recurring Job
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Repeat Job</label>

              <select
                className="form-input"
                value={repeatJob}
                onChange={(e) => setRepeatJob(e.target.value === "true")}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {repeatJob && (
              <>
                <div className="form-field">
                  <label>Repeat Frequency</label>

                  <select
                    className="form-input"
                    value={repeatFrequency}
                    onChange={(e) => setRepeatFrequency(e.target.value)}
                  >
                    <option value="Weekly">Weekly</option>

                    <option value="Monthly">Monthly</option>

                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Next Due Date</label>

                  <input
                    className="form-input"
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>04</span>
            Employee Assignment
          </div>

          <div className="assignment-builder">
            <div className="form-field">
              <label>Employee</label>

              <select
                className="form-input"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                <option value="">Select Employee</option>

                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Role</label>

              <select
                className="form-input"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option>Preparer</option>
                <option>Reviewer</option>
              </select>
            </div>

            <div className="form-field">
              <label>Allocated Hours</label>

              <input
                className="form-input"
                type="number"
                min="0"
                step="0.5"
                placeholder="Hours"
                value={allocatedHours}
                onChange={(e) => setAllocatedHours(e.target.value)}
              />
            </div>

            <div className="assignment-add-wrapper">
              <button
                type="button"
                className="button secondary-button"
                onClick={addAssignment}
              >
                + Add
              </button>
            </div>
          </div>

          <div className="allocation-summary">
            <div>
              <span>Budgeted</span>
              <strong>{budgetHoursNumber || 0} hrs</strong>
            </div>

            <div>
              <span>Allocated</span>
              <strong>{totalAllocatedHours} hrs</strong>
            </div>

            <div
              className={
                remainingAllocation === 0
                  ? "allocation-good"
                  : remainingAllocation < 0
                    ? "allocation-danger"
                    : "allocation-warning"
              }
            >
              <span>
                {remainingAllocation === 0
                  ? "Allocation Complete"
                  : remainingAllocation < 0
                    ? "Over Allocated"
                    : "Remaining"}
              </span>

              <strong>{Math.abs(remainingAllocation)} hrs</strong>
            </div>
          </div>

          {assignments.length > 0 && (
            <div className="assignment-table-wrapper">
              <table className="assignment-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Allocated Hours</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map((assignment, index) => (
                    <tr key={index}>
                      <td>
                        <div className="assignment-employee">
                          <div className="employee-avatar">
                            {assignment.employeeName?.charAt(0)?.toUpperCase()}
                          </div>

                          <span>{assignment.employeeName}</span>
                        </div>
                      </td>

                      <td>
                        <span className="role-badge">{assignment.role}</span>
                      </td>

                      <td>
                        <strong>{assignment.allocatedHours} hrs</strong>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="remove-assignment"
                          onClick={() =>
                            setAssignments(
                              assignments.filter((_, i) => i !== index),
                            )
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <span>05</span>
            Dates & Communication
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label>Assignment Date</label>

              <input
                className="form-input"
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Completion Date</label>

              <input
                className="form-input"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field form-field-full">
            <label>Communication Log</label>

            <textarea
              className="form-textarea"
              placeholder="Add communication notes..."
              value={communicationLog}
              onChange={(e) => setCommunicationLog(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            className="button create-job-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Job..." : "Create Job"}
          </button>
        </div>
      </form>

      {/* =========================
          ALL JOBS
      ========================== */}

      <div className="job-section-header jobs-header">
        <div>
          <h2 className="section-title">All Jobs</h2>

          <p className="section-subtitle">
            View and manage jobs from one place.
          </p>
        </div>

        <div className="job-results-badge">
          {filteredJobs.length} of {jobs.length}
        </div>
      </div>

      {/* =========================
          FILTERS
      ========================== */}

      <div className="job-filter-panel">
        <div className="filter-panel-header">
          <div>
            <strong>Filter Jobs</strong>
            <span>Narrow down your job list</span>
          </div>

          <button
            type="button"
            className="clear-filter-button"
            onClick={clearFilters}
          >
            Clear All
          </button>
        </div>

        <div className="job-filters">
          <div className="filter-field">
            <label>Client</label>

            <select
              className="form-input"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            >
              <option value="">All Clients</option>

              {clientOptions.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Project</label>

            <select
              className="form-input"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="">All Projects</option>

              {projectOptions.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Employee</label>

            <select
              className="form-input"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="">All Employees</option>

              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Job Type</label>

            <select
              className="form-input"
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Billable">Billable</option>
              <option value="Non Billable">Non Billable</option>
            </select>
          </div>

          <div className="filter-field">
            <label>Status</label>

            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Awaiting Info">Awaiting Info</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-field">
            <label>Priority</label>

            <select
              className="form-input"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="job-filter-count">
        Showing <strong>{filteredJobs.length}</strong> of{" "}
        <strong>{jobs.length}</strong> jobs
      </div>

      {/* =========================
          JOB CARDS
      ========================== */}

      {filteredJobs.length === 0 ? (
        <div className="empty-jobs">
          <div className="empty-jobs-icon">◌</div>

          <h3>No jobs found</h3>

          <p>No jobs match the selected filters.</p>

          <button type="button" className="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map((job) => {
            const utilization = getBudgetUtilization(job);

            const budgetStatus =
              job.budgetSummary?.budgetStatus || "Within Budget";

            return (
              <div
                key={job._id}
                className="job-card"
                onClick={() => {
                  setSelectedJob(job);
                  setReviewComments("");
                  setShowJobModal(true);
                }}
              >
                <div className="job-card-top">
                  <div className="job-card-title-area">
                    <h3 className="job-title">{job.jobName}</h3>

                    <p className="job-project">
                      {job.clientName} <span>•</span> {job.projectName}
                    </p>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(job.status)}`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="job-card-badges">
                  <span
                    className={`priority-badge ${getPriorityClass(
                      job.priority,
                    )}`}
                  >
                    {job.priority} Priority
                  </span>

                  <span className="type-badge">{job.jobType}</span>

                  {job.repeatJob && (
                    <span className="recurring-badge">↻ Recurring</span>
                  )}
                </div>

                <div className="job-metrics">
                  <div className="job-metric">
                    <span>Budget</span>
                    <strong>{job.budgetedHours}h</strong>
                  </div>

                  <div className="job-metric">
                    <span>Spent</span>
                    <strong>{job.budgetSummary?.spentHours || 0}h</strong>
                  </div>

                  <div className="job-metric">
                    <span>Remaining</span>
                    <strong>{job.budgetSummary?.remainingHours || 0}h</strong>
                  </div>
                </div>

                <div className="budget-section">
                  <div className="budget-header">
                    <span>Budget Usage</span>

                    <strong>{utilization}%</strong>
                  </div>

                  <div className="budget-progress">
                    <div
                      className={`budget-progress-fill ${
                        utilization > 100
                          ? "budget-danger"
                          : utilization >= 80
                            ? "budget-warning"
                            : "budget-good"
                      }`}
                      style={{
                        width: `${Math.min(utilization, 100)}%`,
                      }}
                    ></div>
                  </div>

                  <div
                    className={`budget-status ${
                      budgetStatus === "Over Budget"
                        ? "budget-status-danger"
                        : "budget-status-good"
                    }`}
                  >
                    {budgetStatus}
                  </div>
                </div>

                <div className="job-card-divider"></div>

                <div className="job-assignment-section">
                  <div className="card-section-label">Assigned Employees</div>

                  {job.assignments?.length ? (
                    <div className="assigned-list">
                      {job.assignments.map((assignment, index) => (
                        <div className="assigned-employee" key={index}>
                          <div className="employee-avatar">
                            {assignment.employeeId?.firstName
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div className="assigned-employee-info">
                            <strong>
                              {assignment.employeeId?.firstName}{" "}
                              {assignment.employeeId?.lastName}
                            </strong>

                            <span>
                              {assignment.role} • {assignment.allocatedHours}{" "}
                              hrs
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="no-assignment">No employees assigned</span>
                  )}
                </div>

                <div className="job-card-footer">
                  <span>Assignment: {formatDate(job.assignmentDate)}</span>

                  <span className="view-details">View Details →</span>
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
        <div
          className="job-modal-overlay"
          onClick={() => setShowJobModal(false)}
        >
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
                onClick={() => setShowJobModal(false)}
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
                  <span>Job Type</span>
                  <strong>{selectedJob.jobType}</strong>
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
              <h3>Update Status</h3>

              <select
                className="form-input"
                value={selectedJob.status}
                onChange={(e) =>
                  updateJobStatus(selectedJob._id, e.target.value)
                }
              >
                <option value="Awaiting Info">Awaiting Info</option>

                <option value="Not Started">Not Started</option>

                <option value="In Review">In Review</option>

                <option value="Completed">Completed</option>
              </select>
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

            <div className="modal-section review-section">
              <div className="review-header">
                <div>
                  <h3>Review</h3>
                  <p>Review and approve this job.</p>
                </div>

                <span className="review-status">
                  {selectedJob.reviewStatus || "Pending"}
                </span>
              </div>

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

              <textarea
                className="form-textarea"
                placeholder="Enter review comments..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
              />

              <div className="review-actions">
                <button
                  className="button approve-button"
                  onClick={() => reviewJob("approve")}
                >
                  ✓ Approve
                </button>

                <button
                  className="button reject-button"
                  onClick={() => reviewJob("reject")}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CommonCard>
  );
}

export default JobList;
