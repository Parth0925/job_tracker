import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./JobDiscussion.css";

function JobDiscussion({ job }) {
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messageBodyRef = useRef(null);

  useEffect(() => {
    if (!job) return;

    fetchMessages();

    const assignedEmployees =
      job.assignments
        ?.map((assignment) => assignment.employeeId)
        .filter(Boolean) || [];

    setEmployees(assignedEmployees);

    if (assignedEmployees.length) {
      setSender(assignedEmployees[0]._id);
    } else {
      setSender("");
    }

    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [job]);

  useEffect(() => {
    if (!messageBodyRef.current) return;

    messageBodyRef.current.scrollTop = messageBodyRef.current.scrollHeight;
  }, [messages]);

  const fetchMessages = async () => {
    if (!job?._id) return;

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
    if (!message.trim() || !sender || sending) return;

    try {
      setSending(true);

      await api.post("/messages", {
        jobId: job._id,
        sender,
        message: message.trim(),
      });

      setMessage("");

      await fetchMessages();
    } catch (err) {
      console.log(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessageDate = (date) => {
    return new Date(date).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!job) {
    return (
      <div className="job-discussion empty-discussion">
        {" "}
        <div className="empty-discussion-content">
          {" "}
          <div className="empty-discussion-icon">💬</div>
          <h2>Select a job</h2>
          <p>
            Select a job from the left to view its discussion and send messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-discussion">
      {/* HEADER */}{" "}
      <div className="discussion-header">
        {" "}
        <div className="discussion-header-main">
          {" "}
          <div className="discussion-job-icon">
            {job.jobName?.charAt(0)?.toUpperCase() || "J"}{" "}
          </div>
          <div>
            <h2>{job.jobName}</h2>

            <p>
              {job.clientName}
              <span>•</span>
              {job.projectName}
            </p>
          </div>
        </div>
        <div className="discussion-job-meta">
          <span className="discussion-meta-label">Status</span>

          <span
            className={`discussion-status status-${job.status
              ?.toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {job.status || "Not Started"}
          </span>
        </div>
      </div>
      {/* MESSAGE BODY */}
      <div className="discussion-body" ref={messageBodyRef}>
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>

            <h3>No messages yet</h3>

            <p>
              Start the discussion for this job by sending the first message.
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => {
              const previousMessage = messages[index - 1];

              const showDate =
                !previousMessage ||
                formatMessageDate(previousMessage.createdAt) !==
                  formatMessageDate(msg.createdAt);

              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="message-date-divider">
                      <span>{formatMessageDate(msg.createdAt)}</span>
                    </div>
                  )}

                  <div className="discussion-message">
                    <div className="message-avatar">
                      {msg.sender?.firstName?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="message-content">
                      <div className="message-top">
                        <div className="message-author">
                          {msg.sender?.firstName} {msg.sender?.lastName}
                        </div>

                        {msg.sender?.designation && (
                          <span className="message-designation">
                            {msg.sender.designation}
                          </span>
                        )}

                        <span className="message-time">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>

                      <div className="discussion-text">{msg.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* MESSAGE COMPOSER */}
      <div className="discussion-footer">
        <div className="sender-selector">
          <label>Sending as</label>

          <select
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            disabled={!employees.length}
          >
            {employees.length === 0 ? (
              <option value="">No employees assigned</option>
            ) : (
              employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="message-input-wrapper">
          <textarea
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!sender}
          />

          <div className="message-input-hint">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>

        <button
          className="send-message-button"
          onClick={sendMessage}
          disabled={!message.trim() || !sender || sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default JobDiscussion;
