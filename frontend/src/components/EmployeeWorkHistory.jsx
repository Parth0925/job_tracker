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
    return new Date(date).toLocaleString();
  };

  return (
    <div className="work-history">
      <h2 className="section-title">My Work History</h2>

      {logs.length === 0 ? (
        <p>No completed work yet</p>
      ) : (
        <div className="history-table">
          <div className="history-header">
            <span>Job</span>

            <span>Start</span>

            <span>End</span>

            <span>Hours</span>

            <span>Notes</span>
          </div>

          {logs.map((log, index) => (
            <div className="history-row employee-history" key={index}>
              <span>{log.jobTitle}</span>

              <span>{formatDate(log.startTime)}</span>

              <span>{formatDate(log.endTime)}</span>

              <span>{log.hours} hrs</span>

              <span>{log.notes}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeWorkHistory;
