import { useEffect, useState } from "react";
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

  const filteredJobs = jobs.filter((job) => {
    const matchesClient = !clientFilter || job.clientName === clientFilter;

    const matchesProject = !projectFilter || job.projectName === projectFilter;

    const matchesJobType = !jobTypeFilter || job.jobType === jobTypeFilter;

    const matchesEmployee =
      !employeeFilter ||
      job.assignments?.some(
        (assignment) => assignment.employeeId?._id === employeeFilter,
      );

    return matchesClient && matchesProject && matchesJobType && matchesEmployee;
  });

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
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addAssignment = () => {
    if (!selectedEmployeeId) return;

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
        allocatedHours: Number(allocatedHours || 0),
      },
    ]);

    setSelectedEmployeeId("");
    setSelectedRole("Preparer");
    setAllocatedHours("");
  };

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

      fetchJobs();
    } catch (error) {
      console.log("Create job error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      await api.patch(`/jobs/${jobId}/status`, {
        status: newStatus,
      });

      fetchJobs();

      const updated = await api.get("/jobs");

      const current = updated.data.find((j) => j._id === jobId);

      if (current) {
        setSelectedJob(current);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const reviewJob = async (action) => {
    try {
      await api.post(`/jobs/${selectedJob._id}/review`, {
        action,
        comments: reviewComments,
      });

      fetchJobs();

      setShowJobModal(false);

      setReviewComments("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CommonCard title="Job Management">
      <h2 className="section-title">Create New Job</h2>

      <form className="job-form" onSubmit={handleCreateJob}>
        <input
          className="form-input"
          placeholder="Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Job Name"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
        />

        <textarea
          className="form-textarea"
          placeholder="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="form-input"
          type="number"
          min="0"
          step="0.5"
          placeholder="Budgeted Hours"
          value={budgetedHours}
          onChange={(e) => setBudgetedHours(e.target.value)}
        />

        <label>Job Type</label>

        <select
          className="form-input"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="Billable">Billable</option>
          <option value="Non Billable">Non Billable</option>
        </select>

        <label>Repeat Job</label>

        <select
          className="form-input"
          value={repeatJob}
          onChange={(e) => setRepeatJob(e.target.value === "true")}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>

        {repeatJob && (
          <>
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

            <label>Next Due Date</label>

            <input
              className="form-input"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
            />
          </>
        )}

        <h3 style={{ marginTop: "20px" }}>Assign Employees</h3>

        <div className="assignment-builder">
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

          <select
            className="form-input"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option>Preparer</option>
            <option>Reviewer</option>
          </select>

          <input
            className="form-input"
            type="number"
            min="0"
            step="0.5"
            placeholder="Allocated Hours"
            value={allocatedHours}
            onChange={(e) => setAllocatedHours(e.target.value)}
          />

          <button type="button" className="button" onClick={addAssignment}>
            Add Assignment
          </button>
        </div>

        {assignments.length > 0 && (
          <table className="assignment-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Hours</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {assignments.map((assignment, index) => (
                <tr key={index}>
                  <td>{assignment.employeeName}</td>

                  <td>{assignment.role}</td>

                  <td>{assignment.allocatedHours}</td>

                  <td>
                    <button
                      type="button"
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
        )}

        <label>Assignment Date</label>

        <input
          className="form-input"
          type="date"
          value={assignmentDate}
          onChange={(e) => setAssignmentDate(e.target.value)}
        />

        <label>Completion Date</label>

        <input
          className="form-input"
          type="date"
          value={completionDate}
          onChange={(e) => setCompletionDate(e.target.value)}
        />

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

        <label>Checklist Prepared</label>

        <select
          className="form-input"
          value={checklistPrepared}
          onChange={(e) => setChecklistPrepared(e.target.value === "true")}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>

        <textarea
          className="form-textarea"
          placeholder="Communication Log"
          value={communicationLog}
          onChange={(e) => setCommunicationLog(e.target.value)}
        />

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>

      <h2 className="section-title">All Jobs</h2>

      <div className="job-filters">
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

        <select
          className="form-input"
          value={jobTypeFilter}
          onChange={(e) => setJobTypeFilter(e.target.value)}
        >
          <option value="">All Job Types</option>
          <option value="Billable">Billable</option>
          <option value="Non Billable">Non Billable</option>
        </select>

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

        <button type="button" className="button" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <p className="job-filter-count">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </p>

      <div className="jobs-grid">
        {filteredJobs.map((job) => (
          <div
            key={job._id}
            className="job-card"
            onClick={() => {
              setSelectedJob(job);
              setShowJobModal(true);
            }}
          >
            <h3 className="job-title">{job.jobName}</h3>

            <p className="job-info">
              <strong>Client:</strong> {job.clientName}
            </p>

            <p className="job-info">
              <strong>Project:</strong> {job.projectName}
            </p>

            <p className="job-info">
              <strong>Type:</strong> {job.jobType}
            </p>

            {job.repeatJob && (
              <>
                <p className="job-info">
                  <strong>Recurring:</strong> Yes
                </p>

                <p className="job-info">
                  <strong>Frequency:</strong> {job.repeatFrequency}
                </p>

                <p className="job-info">
                  <strong>Next Due:</strong> {job.nextDueDate?.substring(0, 10)}
                </p>
              </>
            )}

            <p className="job-info">
              <strong>Budget:</strong> {job.budgetedHours} hrs
            </p>

            <p className="job-info">
              <strong>Spent:</strong> {job.budgetSummary.spentHours} hrs
            </p>

            <p className="job-info">
              <strong>Remaining:</strong> {job.budgetSummary.remainingHours} hrs
            </p>

            <p className="job-info">
              <strong>Efficiency:</strong> {job.budgetSummary.efficiency}%
            </p>

            <div className="budget-progress">
              <div
                className="budget-progress-fill"
                style={{
                  width: `${Math.min(job.budgetSummary.budgetUtilization, 100)}%`,
                  backgroundColor:
                    job.budgetSummary.budgetUtilization < 80
                      ? "#28a745"
                      : job.budgetSummary.budgetUtilization <= 100
                        ? "#ffc107"
                        : "#dc3545",
                }}
              ></div>
            </div>

            <p className="job-info">
              <strong>Budget Used:</strong>{" "}
              {job.budgetSummary.budgetUtilization}%
            </p>

            <p className="job-info">
              <strong>Assignments:</strong>

              {job.assignments?.length ? (
                <ul className="assigned-list">
                  {job.assignments.map((assignment, index) => (
                    <li key={index}>
                      {assignment.employeeId?.firstName}{" "}
                      {assignment.employeeId?.lastName}
                      {" • "}
                      {assignment.role}
                      {" • "}
                      {assignment.allocatedHours} hrs
                    </li>
                  ))}
                </ul>
              ) : (
                " None"
              )}
            </p>

            <p className="job-info">
              <strong>Job Status:</strong> {job.status}
            </p>

            <p
              className="job-info"
              style={{
                color:
                  job.budgetSummary.budgetStatus === "Over Budget"
                    ? "red"
                    : "green",
                fontWeight: "bold",
              }}
            >
              {job.budgetSummary.budgetStatus}
            </p>

            <p className="job-info">
              <strong>Priority:</strong> {job.priority}
            </p>
          </div>
        ))}
      </div>
      {showJobModal && selectedJob && (
        <div
          className="employee-modal-overlay"
          onClick={() => setShowJobModal(false)}
        >
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setShowJobModal(false)}
            >
              ✕
            </button>

            <h2>{selectedJob.jobName}</h2>

            <hr />

            <p>
              <strong>Client :</strong> {selectedJob.clientName}
            </p>
            <p>
              <strong>Project :</strong> {selectedJob.projectName}
            </p>

            <p>
              <strong>Job Type :</strong> {selectedJob.jobType}
            </p>

            {selectedJob.repeatJob && (
              <>
                <p>
                  <strong>Recurring :</strong> Yes
                </p>

                <p>
                  <strong>Frequency :</strong> {selectedJob.repeatFrequency}
                </p>

                <p>
                  <strong>Next Due :</strong>{" "}
                  {selectedJob.nextDueDate?.substring(0, 10)}
                </p>
              </>
            )}

            <p>
              <strong>Description :</strong>
            </p>

            <p>{selectedJob.description}</p>

            <p>
              <strong>Budgeted Hours :</strong> {selectedJob.budgetedHours} hrs
            </p>

            <p>
              <strong>Priority :</strong> {selectedJob.priority}
            </p>

            <p>
              <strong>Status :</strong> {selectedJob.status}
            </p>

            <div style={{ marginTop: "12px" }}>
              <label>
                <strong>Update Job Status</strong>
              </label>

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

            <p>
              <strong>Assignment Date :</strong>{" "}
              {selectedJob.assignmentDate?.substring(0, 10)}
            </p>

            <p>
              <strong>Completion Date :</strong>{" "}
              {selectedJob.completionDate?.substring(0, 10)}
            </p>

            <p>
              <strong>Checklist Prepared :</strong>{" "}
              {selectedJob.checklistPrepared ? "Yes" : "No"}
            </p>

            <div>
              <strong>Assignments</strong>

              {selectedJob.assignments?.length ? (
                <table className="assignment-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Role</th>
                      <th>Allocated</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedJob.assignments.map((assignment, index) => (
                      <tr key={index}>
                        <td>
                          {assignment.employeeId?.firstName}{" "}
                          {assignment.employeeId?.lastName}
                        </td>

                        <td>{assignment.role}</td>

                        <td>{assignment.allocatedHours} hrs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No assignments.</p>
              )}
            </div>

            <p>
              <strong>Communication Log</strong>
            </p>

            <p>{selectedJob.communicationLog}</p>

            <hr style={{ margin: "20px 0" }} />

            <h3>Review</h3>

            <p>
              <strong>Submitted :</strong>{" "}
              {selectedJob.submittedForReview ? "Yes" : "No"}
            </p>

            <p>
              <strong>Review Status :</strong> {selectedJob.reviewStatus}
            </p>

            <textarea
              className="form-textarea"
              placeholder="Review comments..."
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
            />

            <div style={{ marginTop: "15px" }}>
              <button className="button" onClick={() => reviewJob("approve")}>
                Approve
              </button>

              <button
                className="button"
                style={{ marginLeft: "10px" }}
                onClick={() => reviewJob("reject")}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </CommonCard>
  );
}

export default JobList;
