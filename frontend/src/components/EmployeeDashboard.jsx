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
      const response = await api.get("/jobs");

      setJobs(response.data);
    } catch (error) {
      console.log("Jobs error:", error);
    }
  };

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Employee Dashboard</h1>

          <p className="dashboard-subtitle">
            View available jobs and track your working activity.
          </p>
        </div>
      </div>

      <section className="jobs-section">
        <h2 className="section-title">Available Jobs</h2>

        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job._id} className="job-card">
              <h3 className="job-title">{job.title}</h3>

              <p className="job-description">{job.description}</p>

              <span className="open-badge">Available Job</span>

              <div className="job-timer">
                <JobTimer jobId={job._id} employeeId={employeeId} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="history-section">
        <EmployeeWorkHistory employee={employee} />
      </section>
    </div>
  );
}

export default EmployeeDashboard;
