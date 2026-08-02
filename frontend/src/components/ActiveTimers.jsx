import { useEffect, useState } from "react";
import api from "../services/api";
import "./ActiveTimers.css";
import CommonCard from "./CommonCard";

function ActiveTimers() {
  const [timers, setTimers] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchTimers();

    const fetchInterval = setInterval(() => {
      fetchTimers();
    }, 5000);

    const clockInterval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const fetchTimers = async () => {
    try {
      const response = await api.get("/timers");

      setTimers(response.data);
    } catch (error) {
      console.log("Timer fetch error:", error);
    }
  };

  const calculateDuration = (startedAt) => {
    const start = new Date(startedAt);

    const diff = Math.max(0, Math.floor((now - start) / 1000));

    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;

    return (
      String(hrs).padStart(2, "0") +
      ":" +
      String(mins).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );
  };

  return (
    <CommonCard title="Running Timers">
      <div className="active-timers-header">
        <div>
          <h2 className="section-title">Currently Working</h2>

          <p className="active-timers-subtitle">
            Monitor employees who are currently working on jobs.
          </p>
        </div>

        <div className="active-timer-count">
          <span className="active-dot"></span>

          <strong>{timers.length}</strong>

          <span>Active</span>
        </div>
      </div>

      {timers.length === 0 ? (
        <div className="empty-timers">
          <div className="empty-timers-icon">⏱</div>

          <h3>No Active Timers</h3>

          <p>No employees are currently working on a job.</p>
        </div>
      ) : (
        <div className="timers-grid">
          {timers.map((timer) => (
            <div key={timer._id} className="timer-work-card">
              <div className="timer-card-header">
                <div className="employee-avatar">
                  {timer.employeeId?.name
                    ? timer.employeeId.name.charAt(0).toUpperCase()
                    : "E"}
                </div>

                <div className="employee-info">
                  <h3>{timer.employeeId?.name || "Employee"}</h3>

                  <span className="working-status">
                    <span className="status-dot"></span>
                    Working
                  </span>
                </div>
              </div>

              <div className="timer-job-info">
                <span className="timer-label">JOB</span>

                <p>{timer.jobId?.title || "Job"}</p>
              </div>

              <div className="timer-details">
                <div className="timer-detail">
                  <span className="timer-label">STARTED</span>

                  <strong>
                    {new Date(timer.startedAt).toLocaleTimeString()}
                  </strong>
                </div>

                <div className="timer-detail">
                  <span className="timer-label">RUNNING</span>

                  <strong className="running-time">
                    {calculateDuration(timer.startedAt)}
                  </strong>
                </div>
              </div>

              <div className="timer-live-bar">
                <span></span>
                Live timer
              </div>
            </div>
          ))}
        </div>
      )}
    </CommonCard>
  );
}

export default ActiveTimers;
