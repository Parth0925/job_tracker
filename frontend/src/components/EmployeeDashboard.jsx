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
      <h1 className="dashboard-title">Employee Dashboard</h1>

      <h2 className="section-title">Available Jobs</h2>

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

      <EmployeeWorkHistory employee={employee} />
    </div>
  );
}

export default EmployeeDashboard;
