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

  const submitForReview = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/submit-review`, {
        employeeId,
      });

      alert("Job submitted for review successfully.");

      fetchJobs();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to submit job for review.",
      );
    }
  };

  return (
    <div className="employee-dashboard">
      {/* =========================
          DASHBOARD HEADER
      ========================= */}

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Employee Dashboard</h1>

          <p className="dashboard-subtitle">
            View your assigned jobs and track your working activity.
          </p>
        </div>
      </div>

      {/* =========================
          ASSIGNED JOBS
      ========================= */}

      <section className="jobs-section">
        <h2 className="section-title">My Assigned Jobs</h2>

        <div className="jobs-grid">
          {jobs.length === 0 ? (
            <div className="empty-jobs">
              <p>No assigned jobs available.</p>
            </div>
          ) : (
            jobs.map((job) => {
              const assignment = job.assignments?.find(
                (a) => a.employeeId?._id === employeeId,
              );

              return (
                <div key={job._id} className="job-card">
                  {/* JOB INFORMATION */}

                  <h3 className="job-title">{job.jobName}</h3>

                  <p className="job-description">
                    <strong>Client:</strong> {job.clientName}
                  </p>

                  <p className="job-description">
                    <strong>Project:</strong> {job.projectName}
                  </p>

                  <p className="job-description">
                    <strong>Description:</strong>{" "}
                    {job.description || "No description provided."}
                  </p>

                  {/* STATUS */}

                  <div className="job-status-area">
                    <span
                      className={`job-status-badge status-${job.status
                        ?.toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {job.status}
                    </span>

                    {job.submittedForReview && (
                      <span className="review-badge submitted-badge">
                        Submitted For Review
                      </span>
                    )}

                    {job.reviewStatus === "Rejected" && (
                      <div className="rejected-message">
                        <strong>Rejected:</strong>{" "}
                        {job.reviewComments || "No comments provided."}
                      </div>
                    )}
                  </div>

                  {/* ASSIGNMENT */}

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
                        <strong>Spent Hours:</strong> {assignment.spentHours}{" "}
                        hrs
                      </p>

                      <p>
                        <strong>Remaining Hours:</strong>{" "}
                        {assignment.remainingHours} hrs
                      </p>

                      <p>
                        <strong>Budget Status:</strong>{" "}
                        {assignment.budgetStatus}
                      </p>

                      <p>
                        <strong>Progress:</strong>{" "}
                        {assignment.spentHours >= assignment.allocatedHours
                          ? "Completed"
                          : assignment.spentHours > 0
                            ? "Working"
                            : "Not Started"}
                      </p>

                      {/* PREPARER ACTION */}

                      {assignment.role === "Preparer" &&
                        !job.submittedForReview &&
                        assignment.spentHours > 0 && (
                          <div className="assignment-actions">
                            <button
                              className="button"
                              onClick={() => submitForReview(job._id)}
                            >
                              Submit for Review
                            </button>
                          </div>
                        )}

                      {/* REVIEWER ACTION */}

                      {assignment.role === "Reviewer" &&
                        job.submittedForReview &&
                        job.reviewStatus === "Pending" && (
                          <div className="assignment-actions reviewer-actions">
                            <button
                              className="button approve-button"
                              onClick={() => approveJob(job._id)}
                            >
                              Approve Job
                            </button>

                            <button
                              className="button reject-button"
                              onClick={() => rejectJob(job._id)}
                            >
                              Reject Job
                            </button>
                          </div>
                        )}
                    </div>
                  )}

                  {/* TIMER */}

                  <div className="job-timer">
                    {assignment?.role === "Preparer" &&
                    assignment?.remainingHours > 0 ? (
                      <JobTimer jobId={job._id} employeeId={employeeId} />
                    ) : assignment?.role === "Preparer" ? (
                      <div className="hours-completed-message">
                        Allocated hours completed.
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* =========================
          WORK HISTORY
      ========================= */}

      <section className="history-section">
        <EmployeeWorkHistory employee={employee} />
      </section>
    </div>
  );
}

export default EmployeeDashboard;
