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
    return new Date(date).toLocaleString();
  };

  return (
    <CommonCard title="Work History">
      <h2 className="section-title">Work History</h2>

      {logs.length === 0 ? (
        <p>No work logs available</p>
      ) : (
        <div className="history-table">
          <div className="history-header">
            <span>Employee</span>

            <span>Job</span>

            <span>Start</span>

            <span>End</span>

            <span>Hours</span>

            <span>Notes</span>
          </div>

          {logs.map((log) => (
            <div className="history-row" key={log.createdAt}>
              <span>{log.employee}</span>

              <span>{log.jobTitle}</span>

              <span>{formatDate(log.startTime)}</span>

              <span>{formatDate(log.endTime)}</span>

              <span>{log.hours} hrs</span>

              <span>{log.notes}</span>
            </div>
          ))}
        </div>
      )}
    </CommonCard>
  );
}

export default WorkHistory;
