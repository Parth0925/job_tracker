import { useEffect, useState } from "react";

import api from "../services/api";

import JobTimer from "./JobTimer";
import EmployeeWorkHistory from "./EmployeeWorkHistory";

import "./EmployeeDashboard.css";

function EmployeeDashboard({ employee }) {
  const [jobs, setJobs] = useState([]);

  const employeeId = employee._id;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get(`/jobs/employee/${employeeId}`);

      setJobs(response.data);
    } catch (error) {
      console.log("Jobs error:", error);
    }
  };

  const approveJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/review`, {
        action: "approve",
        comments: "",
      });

      fetchJobs();
    } catch (error) {
      console.log(error);
    }
  };

  const rejectJob = async (jobId) => {
    const comments = prompt("Reason for rejection");

    if (comments === null) return;

    try {
      await api.post(`/jobs/${jobId}/review`, {
        action: "reject",
        comments,
      });

      fetchJobs();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Employee Dashboard</h1>

          <p className="dashboard-subtitle">
            View your assigned jobs and track your working activity.
          </p>
        </div>
      </div>

      <section className="jobs-section">
        <h2 className="section-title">My Assigned Jobs</h2>

        <div className="jobs-grid">
          {jobs.map((job) => {
            const assignment = job.assignments?.find(
              (a) => a.employeeId?._id === employeeId,
            );

            return (
              <div key={job._id} className="job-card">
                <h3 className="job-title">{job.jobName}</h3>

                <p className="job-description">
                  <strong>Client:</strong> {job.clientName}
                </p>

                <p className="job-description">
                  <strong>Project:</strong> {job.projectName}
                </p>

                <p className="job-description">
                  <strong>Description:</strong> {job.description}
                </p>

                <div
                  className="open-badge"
                  style={{
                    background:
                      job.status === "Completed"
                        ? "#28a745"
                        : job.status === "In Review"
                          ? "#ffc107"
                          : job.status === "Awaiting Info"
                            ? "#dc3545"
                            : "#0d6efd",
                    color: "#fff",
                  }}
                >
                  {job.status}
                  {job.submittedForReview && (
                    <div
                      style={{
                        marginTop: "10px",
                        color: "#1976d2",
                        fontWeight: "bold",
                      }}
                    >
                      Submitted For Review
                    </div>
                  )}

                  {job.reviewStatus === "Rejected" && (
                    <div
                      style={{
                        marginTop: "10px",
                        color: "red",
                        fontWeight: "bold",
                      }}
                    >
                      Rejected : {job.reviewComments}
                    </div>
                  )}
                </div>

                {assignment && (
                  <div className="assignment-summary">
                    <h4>Your Assignment</h4>

                    <p>
                      <strong>Role:</strong> {assignment.role}
                    </p>

                    <p>
                      <strong>Allocated Hours:</strong>{" "}
                      {assignment.allocatedHours} hrs
                    </p>

                    <p>
                      <strong>Spent Hours:</strong> {assignment.spentHours} hrs
                    </p>

                    <p>
                      <strong>Remaining Hours:</strong>{" "}
                      {assignment.remainingHours} hrs
                    </p>

                    <p>
                      <strong>Budget Status:</strong> {assignment.budgetStatus}
                    </p>

                    <p>
                      <strong>Progress:</strong>{" "}
                      {assignment.spentHours >= assignment.allocatedHours
                        ? "Completed"
                        : assignment.spentHours > 0
                          ? "Working"
                          : "Not Started"}
                    </p>
                    {assignment.role === "Preparer" &&
                      !job.submittedForReview &&
                      assignment.spentHours > 0 && (
                        <div style={{ marginTop: "15px" }}>
                          <button
                            className="button"
                            onClick={async () => {
                              try {
                                await api.post(
                                  `/jobs/${job._id}/submit-review`,
                                  {
                                    employeeId,
                                  },
                                );

                                alert("Job submitted for review successfully.");

                                fetchJobs();
                              } catch (error) {
                                alert(
                                  error.response?.data?.message ||
                                    "Failed to submit job for review.",
                                );
                              }
                            }}
                          >
                            Submit for Review
                          </button>
                        </div>
                      )}
                    {assignment.role === "Reviewer" &&
                      job.submittedForReview &&
                      job.reviewStatus === "Pending" && (
                        <div style={{ marginTop: "15px" }}>
                          <button
                            className="button"
                            onClick={() => approveJob(job._id)}
                          >
                            Approve Job
                          </button>

                          <button
                            className="button"
                            style={{
                              marginLeft: "10px",
                              background: "#dc3545",
                            }}
                            onClick={() => rejectJob(job._id)}
                          >
                            Reject Job
                          </button>
                        </div>
                      )}
                  </div>
                )}

                <div className="job-timer">
                  {assignment?.role === "Preparer" &&
                  assignment?.remainingHours > 0 ? (
                    <div className="job-timer">
                      <JobTimer jobId={job._id} employeeId={employeeId} />
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: "15px",
                        color: "red",
                        fontWeight: "bold",
                      }}
                    >
                      Allocated hours completed.
                    </div>
                  )}{" "}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="history-section">
        <EmployeeWorkHistory employee={employee} />
      </section>
    </div>
  );
}

export default EmployeeDashboard;
