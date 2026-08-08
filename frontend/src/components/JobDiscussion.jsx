import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./JobDiscussion.css";

function JobDiscussion({ job }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedReceivers, setSelectedReceivers] = useState([]);

  const messageBodyRef = useRef(null);

  const assignedEmployees =
    job?.assignments
      ?.map((assignment) => {
        const employee = assignment?.employeeId;

        if (!employee) return null;

        if (typeof employee === "object") {
          return employee;
        }

        return {
          _id: employee,
        };
      })
      ?.filter(
        (employee) =>
          employee?._id && String(employee._id) !== String(user?._id),
      ) || [];

  useEffect(() => {
    if (!job) return;

    setSelectedReceivers([]);

    fetchMessages();

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
        (response.data || []).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        ),
      );
    } catch (err) {
      console.log("Fetch messages error:", err);
    }
  };

  const toggleReceiver = (employeeId) => {
    const id = String(employeeId);

    setSelectedReceivers((prev) =>
      prev.includes(id)
        ? prev.filter((receiverId) => receiverId !== id)
        : [...prev, id],
    );
  };

  const selectAllReceivers = () => {
    const allReceiverIds = assignedEmployees.map((employee) =>
      String(employee._id),
    );

    const allSelected =
      allReceiverIds.length > 0 &&
      allReceiverIds.every((id) => selectedReceivers.includes(id));

    if (allSelected) {
      setSelectedReceivers([]);
    } else {
      setSelectedReceivers(allReceiverIds);
    }
  };

  const replyToEmployee = (employeeId) => {
    if (!employeeId) return;

    const receiverId = String(employeeId);

    setSelectedReceivers([receiverId]);

    setTimeout(() => {
      const input = document.querySelector(".discussion-message-textarea");

      if (input) {
        input.focus();
      }
    }, 100);
  };

  const sendMessage = async () => {
    if (!message.trim() || !user?._id || sending) {
      return;
    }

    if (selectedReceivers.length === 0) {
      alert("Please select at least one person to send the message to.");
      return;
    }

    try {
      setSending(true);

      await api.post("/messages", {
        jobId: job._id,
        sender: user._id,
        receivers: selectedReceivers,
        message: message.trim(),
      });

      setMessage("");
      setSelectedReceivers([]);

      await fetchMessages();
    } catch (err) {
      console.log("Send message error:", err);

      alert(err.response?.data?.message || "Failed to send message.");
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
      <div className="job-discussion-empty">
        <div className="job-discussion-empty-icon">💬</div>

        <h3>Select a job</h3>

        <p>
          Select a job from the left to view its discussion and send messages.
        </p>
      </div>
    );
  }

  const allReceiverIds = assignedEmployees.map((employee) =>
    String(employee._id),
  );

  const allReceiversSelected =
    allReceiverIds.length > 0 &&
    allReceiverIds.every((id) => selectedReceivers.includes(id));

  return (
    <div className="job-discussion">
      {/* HEADER */}

      <div className="discussion-header">
        <div className="discussion-header-main">
          <div className="discussion-job-icon">
            {job.jobName?.charAt(0)?.toUpperCase() || "J"}
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

              const senderId = msg.sender?._id ? String(msg.sender._id) : "";

              const isCurrentUser = senderId === String(user?._id);

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

                      {!isCurrentUser && senderId && (
                        <button
                          type="button"
                          className="message-reply-button"
                          onClick={() => replyToEmployee(senderId)}
                        >
                          Reply
                        </button>
                      )}
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
        <div className="receiver-selector">
          <div className="receiver-selector-header">
            <label>Send Message To</label>

            {selectedReceivers.length > 0 && (
              <span className="receiver-selected-count">
                {selectedReceivers.length} selected
              </span>
            )}
          </div>

          {assignedEmployees.length === 0 ? (
            <div className="receiver-empty">
              No other assigned employees available.
            </div>
          ) : (
            <div className="receiver-options">
              <label className="receiver-option all-option">
                <input
                  type="checkbox"
                  checked={allReceiversSelected}
                  onChange={selectAllReceivers}
                />

                <span>All Assigned Employees</span>
              </label>

              {assignedEmployees.map((employee) => {
                const employeeId = String(employee._id);

                return (
                  <label key={employeeId} className="receiver-option">
                    <input
                      type="checkbox"
                      checked={selectedReceivers.includes(employeeId)}
                      onChange={() => toggleReceiver(employeeId)}
                    />

                    <span>
                      {employee.firstName || "Employee"}{" "}
                      {employee.lastName || ""}
                    </span>

                    {employee.designation && (
                      <small>{employee.designation}</small>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="message-input-wrapper">
          <textarea
            className="discussion-message-textarea"
            placeholder={
              selectedReceivers.length > 0
                ? "Write a message..."
                : "Select an employee to send a message..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!user?._id || assignedEmployees.length === 0}
          />

          <div className="message-input-hint">
            Press Enter to send • Shift + Enter for new line
          </div>
        </div>

        <button
          type="button"
          className="send-message-button"
          onClick={sendMessage}
          disabled={
            !message.trim() ||
            !user?._id ||
            sending ||
            selectedReceivers.length === 0 ||
            assignedEmployees.length === 0
          }
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default JobDiscussion;
