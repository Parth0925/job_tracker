import { useEffect, useState } from "react";
import api from "../services/api";
import "./JobDiscussion.css";

function JobDiscussion({ job }) {
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!job) return;

    fetchMessages();

    setEmployees(job.assignedEmployees || []);

    if (job.assignedEmployees?.length) {
      setSender(job.assignedEmployees[0]._id);
    }

    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [job]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/job/${job._id}`);
      setMessages(
        response.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        ),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await api.post("/messages", {
        jobId: job._id,
        sender,
        message,
      });

      setMessage("");

      fetchMessages();
    } catch (err) {
      console.log(err);
    }
  };

  if (!job) {
    return (
      <div className="job-discussion">
        <h2>Select a Job</h2>
      </div>
    );
  }

  return (
    <div className="job-discussion">
      <div className="discussion-header">
        <h2>{job.jobName}</h2>

        <p>
          {job.clientName} • {job.projectName}
        </p>
      </div>

      <div className="discussion-body">
        {messages.map((msg) => (
          <div className="discussion-message" key={msg._id}>
            <div className="discussion-author">
              {msg.sender.firstName} {msg.sender.lastName}
              {" • "}
              {msg.sender.designation}
            </div>

            <div className="discussion-time">
              {new Date(msg.createdAt).toLocaleString()}
            </div>

            <div className="discussion-text">{msg.message}</div>
          </div>
        ))}
      </div>

      <div className="discussion-footer">
        <select value={sender} onChange={(e) => setSender(e.target.value)}>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.firstName} {emp.lastName}
            </option>
          ))}
        </select>

        <input
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default JobDiscussion;
