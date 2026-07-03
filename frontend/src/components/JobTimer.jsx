import { useState, useEffect } from "react";
import api from "../services/api";
import "./JobTimer.css";

function JobTimer({ jobId, employeeId }) {
  const [seconds, setSeconds] = useState(0);

  const [status, setStatus] = useState("idle");

  useEffect(() => {
    fetchActiveTimer();
  }, []);

  useEffect(() => {
    let interval;

    if (status === "running") {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [status]);

  const fetchActiveTimer = async () => {
    try {
      const res = await api.get(`/jobs/${jobId}/timer/${employeeId}`);

      if (res.data) {
        if (res.data.isPaused) {
          setStatus("paused");
        } else {
          setStatus("running");

          const diff = (Date.now() - new Date(res.data.startedAt)) / 1000;

          setSeconds(Math.floor(diff));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const startTimer = async () => {
    await api.post(`/jobs/${jobId}/start`, {
      employeeId,
    });

    setStatus("running");
  };

  const pauseTimer = async () => {
    await api.post(`/jobs/${jobId}/pause`, {
      employeeId,
    });

    setStatus("paused");
  };

  const resumeTimer = async () => {
    await api.post(`/jobs/${jobId}/resume`, {
      employeeId,
    });

    setStatus("running");
  };

  const stopTimer = async () => {
    await api.post(`/jobs/${jobId}/stop`, {
      employeeId,
      notes: "Timer work",
    });

    setSeconds(0);

    setStatus("idle");

    alert("Work saved");
  };

  const formatTime = () => {
    const h = Math.floor(seconds / 3600);

    const m = Math.floor((seconds % 3600) / 60);

    const s = seconds % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="timer-card">
      <h4 className="timer-title">WORK TIMER</h4>

      <h2 className="timer-display">{formatTime()}</h2>

      {status === "idle" && (
        <button className="timer-btn start-btn" onClick={startTimer}>
          Start Timer
        </button>
      )}

      {status === "running" && (
        <>
          <button className="timer-btn pause-btn" onClick={pauseTimer}>
            Pause
          </button>

          <button className="timer-btn stop-btn" onClick={stopTimer}>
            Stop
          </button>
        </>
      )}

      {status === "paused" && (
        <>
          <button className="timer-btn start-btn" onClick={resumeTimer}>
            Resume
          </button>

          <button className="timer-btn stop-btn" onClick={stopTimer}>
            Stop
          </button>
        </>
      )}
    </div>
  );
}

export default JobTimer;
