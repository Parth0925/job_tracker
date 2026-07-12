import { useEffect, useState } from "react";
import CommonCard from "./CommonCard";
import api from "../services/api";
import "./Reports.css";

function Reports() {
  const [employees, setEmployees] = useState([]);
  const [activeReport, setActiveReport] = useState("timesheet");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [report, setReport] = useState([]);

  const [totalHours, setTotalHours] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);

  const [loading, setLoading] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [jobReport, setJobReport] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchJobs();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs");
      setJobs(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  const generateReport = async () => {
    if (!selectedEmployee) {
      alert("Please select an employee.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/worklogs/report", {
        params: {
          employeeId: selectedEmployee,
          from,
          to,
        },
      });

      setReport(response.data.data);
      setTotalHours(response.data.totalHours);
      setTotalEntries(response.data.totalEntries);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const generateJobReport = async () => {
    if (!selectedJob) {
      alert("Please select a job.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/worklogs/job-report", {
        params: {
          jobId: selectedJob,
        },
      });

      setJobReport(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const generateBudgetReport = async () => {
    if (!selectedJob) {
      alert("Please select a job.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/jobs");

      const job = response.data.find((j) => j._id === selectedJob);

      setJobReport(job);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const generateEfficiencyReport = async () => {
    if (!selectedJob) {
      alert("Please select a job.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/jobs");

      const job = response.data.find((j) => j._id === selectedJob);

      setJobReport(job);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonCard title="Reports">
      <h2 className="section-title">Reports</h2>

      <div className="report-tabs">
        <button
          className={activeReport === "timesheet" ? "active-tab" : ""}
          onClick={() => setActiveReport("timesheet")}
        >
          Employee Timesheet
        </button>

        <button
          className={activeReport === "job" ? "active-tab" : ""}
          onClick={() => setActiveReport("job")}
        >
          Job Report
        </button>

        <button
          className={activeReport === "budget" ? "active-tab" : ""}
          onClick={() => setActiveReport("budget")}
        >
          Budget Report
        </button>

        <button
          className={activeReport === "efficiency" ? "active-tab" : ""}
          onClick={() => setActiveReport("efficiency")}
        >
          Efficiency Report
        </button>

        <button
          className={activeReport === "idle" ? "active-tab" : ""}
          onClick={() => setActiveReport("idle")}
        >
          Idle Time
        </button>
      </div>

      {/* ================= EMPLOYEE TIMESHEET ================= */}

      {activeReport === "timesheet" && (
        <div className="reports-card">
          <div className="report-filters">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select Employee</option>

              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.employeeCode} - {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />

            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />

            <button onClick={generateReport}>
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h3>Employee Timesheet</h3>

          <p>
            <strong>Total Entries:</strong> {totalEntries}
          </p>

          <p>
            <strong>Total Hours:</strong> {totalHours}
          </p>

          <table className="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Job</th>
                <th>Client</th>
                <th>Project</th>
                <th>Start</th>
                <th>End</th>
                <th>Hours</th>
              </tr>
            </thead>

            <tbody>
              {report.map((log) => (
                <tr key={log.startTime + log.jobId}>
                  <td>{new Date(log.startTime).toLocaleDateString()}</td>
                  <td>{log.jobName}</td>
                  <td>{log.clientName}</td>
                  <td>{log.projectName}</td>
                  <td>{new Date(log.startTime).toLocaleTimeString()}</td>
                  <td>{new Date(log.endTime).toLocaleTimeString()}</td>
                  <td>{log.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= JOB REPORT ================= */}

      {activeReport === "job" && (
        <div className="reports-card">
          <div className="report-filters">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">Select Job</option>

              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.jobName}
                </option>
              ))}
            </select>

            <button onClick={generateJobReport}>
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {jobReport && (
            <>
              <hr style={{ margin: "20px 0" }} />

              <h3>{jobReport.jobName}</h3>

              <p>
                <strong>Client:</strong> {jobReport.clientName}
              </p>

              <p>
                <strong>Project:</strong> {jobReport.projectName}
              </p>

              <p>
                <strong>Budgeted Hours:</strong> {jobReport.budgetedHours}
              </p>

              <p>
                <strong>Total Hours Spent:</strong> {jobReport.totalHours}
              </p>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Designation</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>

                <tbody>
                  {jobReport.employees.map((emp) => (
                    <tr key={emp.employeeId}>
                      <td>{emp.employeeName}</td>
                      <td>{emp.designation}</td>
                      <td>{emp.hours.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* ================= BUDGET REPORT ================= */}

      {activeReport === "budget" && (
        <div className="reports-card">
          <div className="report-filters">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">Select Job</option>

              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.jobName}
                </option>
              ))}
            </select>

            <button onClick={generateBudgetReport}>
              {loading ? "Loading..." : "Generate Budget Report"}
            </button>
          </div>

          {jobReport?.budgetSummary && (
            <div className="budget-grid">
              <div className="budget-card">
                <h4>Budgeted Hours</h4>
                <span>{jobReport.budgetedHours}</span>
              </div>

              <div className="budget-card">
                <h4>Spent Hours</h4>
                <span>{jobReport.budgetSummary.spentHours}</span>
              </div>

              <div className="budget-card">
                <h4>Remaining</h4>
                <span>{jobReport.budgetSummary.remainingHours}</span>
              </div>

              <div className="budget-card">
                <h4>Exceeded</h4>
                <span>{jobReport.budgetSummary.exceededHours}</span>
              </div>

              <div className="budget-card">
                <h4>Budget Used</h4>
                <span>{jobReport.budgetSummary.budgetUtilization}%</span>
              </div>

              <div className="budget-card">
                <h4>Efficiency</h4>
                <span>{jobReport.budgetSummary.efficiency}%</span>
              </div>

              <div className="budget-card">
                <h4>Status</h4>
                <span>{jobReport.budgetSummary.budgetStatus}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= EFFICIENCY REPORT ================= */}

      {activeReport === "efficiency" && (
        <div className="reports-card">
          <div className="report-filters">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">Select Job</option>

              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.jobName}
                </option>
              ))}
            </select>

            <button onClick={generateEfficiencyReport}>
              {loading ? "Loading..." : "Generate Report"}
            </button>
          </div>

          {jobReport?.budgetSummary && (
            <>
              <hr style={{ margin: "20px 0" }} />

              <h3>{jobReport.jobName}</h3>

              <h2 style={{ color: "#1976d2" }}>
                {jobReport.budgetSummary.efficiency}%
              </h2>

              <table className="report-table">
                <tbody>
                  <tr>
                    <td>Budgeted Hours</td>
                    <td>{jobReport.budgetedHours}</td>
                  </tr>

                  <tr>
                    <td>Spent Hours</td>
                    <td>{jobReport.budgetSummary.spentHours}</td>
                  </tr>

                  <tr>
                    <td>Efficiency</td>
                    <td>{jobReport.budgetSummary.efficiency}%</td>
                  </tr>

                  <tr>
                    <td>Status</td>
                    <td>{jobReport.budgetSummary.budgetStatus}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </CommonCard>
  );
}

export default Reports;
