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

    const diff = Math.floor((now - start) / 1000);

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
      <h2 className="section-title">Currently Working</h2>

      {timers.length === 0 ? (
        <p>No active work</p>
      ) : (
        timers.map((timer) => (
          <div key={timer._id} className="timer-work-card">
            <h3>{timer.employeeId?.name}</h3>

            <p>Job: {timer.jobId?.title}</p>

            <p>Started: {new Date(timer.startedAt).toLocaleTimeString()}</p>

            <p>
              Running: <strong>{calculateDuration(timer.startedAt)}</strong>
            </p>
          </div>
        ))
      )}
    </CommonCard>
  );
}

export default ActiveTimers;
