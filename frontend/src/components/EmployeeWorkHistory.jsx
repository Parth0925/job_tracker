import { useEffect, useState } from "react";
import api from "../services/api";
import "./WorkHistory.css";

function EmployeeWorkHistory({ employee }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (employee?._id) {
      fetchHistory();
    }
  }, [employee]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/worklogs/employee/${employee._id}`);

      setLogs(response.data);
    } catch (error) {
      console.log("Employee history error:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  const totalHours = logs.reduce(
    (total, log) => total + Number(log.hours || 0),
    0,
  );

  return (
    <div className="work-history">
      <div className="work-history-header">
        <div>
          <h2 className="section-title">My Work History</h2>

          <p className="work-history-subtitle">
            View your completed job work and recorded time.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">◷</div>

          <h3>No work history yet</h3>

          <p>Completed work and recorded time entries will appear here.</p>
        </div>
      ) : (
        <>
          <div className="history-summary">
            <div className="history-summary-card">
              <span className="summary-label">Completed Entries</span>

              <strong>{logs.length}</strong>
            </div>

            <div className="history-summary-card">
              <span className="summary-label">Total Hours</span>

              <strong>{totalHours.toFixed(2)} hrs</strong>
            </div>
          </div>

          <div className="history-table-wrapper">
            <div className="history-table">
              <div className="history-header">
                <span>Job</span>
                <span>Start</span>
                <span>End</span>
                <span>Hours</span>
                <span>Notes</span>
              </div>

              {logs.map((log, index) => (
                <div
                  className="history-row employee-history"
                  key={log._id || index}
                >
                  <span className="history-job">{log.jobTitle || "-"}</span>

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
        </>
      )}
    </div>
  );
}

export default EmployeeWorkHistory;
