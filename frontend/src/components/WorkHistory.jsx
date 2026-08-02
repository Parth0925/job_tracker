import { useEffect, useState } from "react";
import api from "../services/api";
import "./WorkHistory.css";
import CommonCard from "./CommonCard";

function WorkHistory() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get("/worklogs");

      setLogs(response.data);
    } catch (error) {
      console.log("Work history error:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  const getEmployeeName = (log) => {
    if (typeof log.employee === "string") {
      return log.employee;
    }

    if (log.employee?.firstName) {
      return `${log.employee.firstName} ${log.employee.lastName || ""}`.trim();
    }

    if (log.employeeId?.firstName) {
      return `${log.employeeId.firstName} ${
        log.employeeId.lastName || ""
      }`.trim();
    }

    if (log.employeeName) {
      return log.employeeName;
    }

    return "-";
  };

  const getJobTitle = (log) => {
    if (typeof log.jobTitle === "string" && log.jobTitle) {
      return log.jobTitle;
    }

    if (typeof log.job === "string" && log.job) {
      return log.job;
    }

    if (log.job?.jobName) {
      return log.job.jobName;
    }

    if (log.jobId?.jobName) {
      return log.jobId.jobName;
    }

    if (log.jobName) {
      return log.jobName;
    }

    return "-";
  };

  const totalHours = logs.reduce(
    (total, log) => total + Number(log.hours || 0),
    0,
  );

  return (
    <CommonCard title="Work History">
      <div className="work-history">
        <div className="work-history-heading">
          <div>
            <h2 className="section-title">Work History</h2>

            <p className="work-history-subtitle">
              Review employee work logs and recorded time.
            </p>
          </div>
        </div>

        <div className="history-summary">
          <div className="history-summary-card">
            <span>Total Entries</span>
            <strong>{logs.length}</strong>
          </div>

          <div className="history-summary-card">
            <span>Total Hours</span>
            <strong>{totalHours.toFixed(2)} hrs</strong>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">◷</div>

            <h3>No work logs available</h3>

            <p>
              Employee work activity will appear here once time has been
              recorded.
            </p>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <div className="history-table">
              <div className="history-header">
                <span>Employee</span>
                <span>Job</span>
                <span>Start</span>
                <span>End</span>
                <span>Hours</span>
                <span>Notes</span>
              </div>

              {logs.map((log, index) => (
                <div
                  className="history-row"
                  key={log._id || log.createdAt || index}
                >
                  <span className="history-employee">
                    {getEmployeeName(log)}
                  </span>

                  <span className="history-job">{getJobTitle(log)}</span>

                  <span>{formatDate(log.startTime)}</span>

                  <span>{formatDate(log.endTime)}</span>

                  <span className="history-hours">
                    {Number(log.hours || 0).toFixed(2)} hrs
                  </span>

                  <span className="history-notes">{log.notes || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CommonCard>
  );
}

export default WorkHistory;
