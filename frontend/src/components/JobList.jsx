import { useEffect, useState } from "react";
import CommonCard from "./CommonCard";
import api from "../services/api";
import "./JobList.css";

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);

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

  const [status, setStatus] = useState("Open");

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
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!clientName.trim() || !projectName.trim() || !jobName.trim()) return;

    try {
      setLoading(true);

      await api.post("/jobs", {
        clientName,
        projectName,
        jobName,

        description,

        budgetedHours,

        assignedEmployees,

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

      setAssignedEmployees([]);

      setAssignmentDate("");

      setCompletionDate("");

      setCommunicationLog("");

      setChecklistPrepared(false);

      setPriority("Medium");

      setStatus("Open");

      fetchJobs();
    } catch (error) {
      console.log("Create job error:", error);
    } finally {
      setLoading(false);
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
          placeholder="Budgeted Hours"
          value={budgetedHours}
          onChange={(e) => setBudgetedHours(e.target.value)}
        />

        <label>Assign Employees</label>

        <div className="selected-employees">
          {assignedEmployees.length === 0 ? (
            <p>No employee selected</p>
          ) : (
            assignedEmployees.map((id) => {
              const employee = employees.find((emp) => emp._id === id);

              return (
                <span className="employee-chip" key={id}>
                  {employee?.firstName} {employee?.lastName}
                  <button
                    type="button"
                    onClick={() =>
                      setAssignedEmployees(
                        assignedEmployees.filter((empId) => empId !== id),
                      )
                    }
                  >
                    ✕
                  </button>
                </span>
              );
            })
          )}
        </div>

        <div className="employee-selector">
          {employees.map((employee) => (
            <label className="employee-option" key={employee._id}>
              <input
                type="checkbox"
                checked={assignedEmployees.includes(employee._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAssignedEmployees([...assignedEmployees, employee._id]);
                  } else {
                    setAssignedEmployees(
                      assignedEmployees.filter((id) => id !== employee._id),
                    );
                  }
                }}
              />

              <div>
                <strong>
                  {employee.firstName} {employee.lastName}
                </strong>

                <div>{employee.designation}</div>
              </div>
            </label>
          ))}
        </div>

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
          <option>Open</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>On Hold</option>
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

      <div className="jobs-grid">
        {jobs.map((job) => (
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
              <strong>Assigned:</strong>{" "}
              {job.assignedEmployees?.length
                ? job.assignedEmployees
                    .map((emp) => `${emp.firstName} ${emp.lastName}`)
                    .join(", ")
                : "None"}
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
              <strong>Assigned Employees</strong>

              {selectedJob.assignedEmployees?.length ? (
                <ul className="assigned-list">
                  {selectedJob.assignedEmployees.map((employee) => (
                    <li key={employee._id}>
                      {employee.firstName} {employee.lastName}
                      {" • "}
                      {employee.employeeCode}
                      {" • "}
                      {employee.designation}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No employees assigned.</p>
              )}
            </div>

            <p>
              <strong>Communication Log</strong>
            </p>

            <p>{selectedJob.communicationLog}</p>
          </div>
        </div>
      )}
    </CommonCard>
  );
}

export default JobList;
