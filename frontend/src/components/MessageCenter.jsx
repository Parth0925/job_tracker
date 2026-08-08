import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailOpen,
  Plus,
  RefreshCw,
  Reply,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import CommonCard from "./CommonCard";
import "./MessageCenter.css";

function MessageCenter({ selectedMessageId, onMessageOpened }) {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedReceivers, setSelectedReceivers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showComposer, setShowComposer] = useState(false);
  const [page, setPage] = useState(1);

  const messagesPerPage = 10;

  const selectedJob = selectedMessage?.job;

  const assignedEmployees =
    selectedJob?.assignments
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
    if (!user?._id) return;

    fetchJobs();
  }, [user?._id, user?.activeRole?._id, user?.activeRole?.messagePermission]);

  useEffect(() => {
    if (!jobs.length) {
      setMessages([]);
      return;
    }

    fetchAllMessages();
  }, [jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const messagePermission =
        user?.activeRole?.messagePermission || "Individual";

      const response =
        messagePermission === "All"
          ? await api.get("/jobs")
          : await api.get(`/jobs/employee/${user?._id}`);

      setJobs(response.data || []);
    } catch (error) {
      console.log("Messages jobs error:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMessages = async () => {
    try {
      const responses = await Promise.all(
        jobs.map((job) =>
          api
            .get(`/messages/job/${job._id}`)
            .then((response) => response.data || [])
            .catch(() => []),
        ),
      );

      const jobMap = new Map(jobs.map((job) => [job._id, job]));

      const allMessages = responses
        .flat()
        .map((msg) => ({
          ...msg,
          job: jobMap.get(msg.job?._id || msg.jobId) || null,
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      setMessages(allMessages);

      if (selectedMessage) {
        const updatedMessage = allMessages.find(
          (msg) => msg._id === selectedMessage._id,
        );

        setSelectedMessage(updatedMessage || null);
      }
    } catch (error) {
      console.log("Messages fetch error:", error);
      setMessages([]);
    }
  };

  const filteredMessages = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return messages.filter((msg) => {
      const senderName = `${msg.sender?.firstName || ""} ${
        msg.sender?.lastName || ""
      }`.trim();

      const job = msg.job;

      const matchesSearch =
        !searchValue ||
        msg.message?.toLowerCase().includes(searchValue) ||
        senderName.toLowerCase().includes(searchValue) ||
        job?.jobName?.toLowerCase().includes(searchValue) ||
        job?.clientName?.toLowerCase().includes(searchValue) ||
        job?.projectName?.toLowerCase().includes(searchValue);

      if (!matchesSearch) return false;

      if (activeTab === "Sent") {
        return msg.sender?._id === user?._id;
      }

      if (activeTab === "Unread") {
        return !msg.read;
      }

      if (activeTab === "System") {
        return false;
      }

      return true;
    });
  }, [messages, search, activeTab, user?._id]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMessages.length / messagesPerPage),
  );

  const paginatedMessages = useMemo(() => {
    const start = (page - 1) * messagesPerPage;

    return filteredMessages.slice(start, start + messagesPerPage);
  }, [filteredMessages, page]);

  useEffect(() => {
    if (!selectedMessageId || !messages.length) return;

    const messageToOpen = messages.find(
      (msg) => String(msg._id) === String(selectedMessageId),
    );

    if (!messageToOpen) return;

    openMessage(messageToOpen);

    onMessageOpened?.();
  }, [selectedMessageId, messages]);

  const formatDateTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSenderName = (msg) => {
    const firstName = msg.sender?.firstName || "";
    const lastName = msg.sender?.lastName || "";

    return `${firstName} ${lastName}`.trim() || "Unknown User";
  };

  const getInitials = (msg) => {
    const name = getSenderName(msg);

    return (
      name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U"
    );
  };

  const openMessage = (msg) => {
    setSelectedMessage(msg);

    if (msg?.sender?._id && String(msg.sender._id) !== String(user?._id)) {
      setSelectedReceivers([String(msg.sender._id)]);
    } else {
      setSelectedReceivers([]);
    }

    setMessage("");
  };

  const closeMessage = () => {
    setSelectedMessage(null);
    setSelectedReceivers([]);
    setMessage("");
  };

  const toggleReceiver = (employeeId) => {
    setSelectedReceivers((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId],
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

  const sendMessage = async () => {
    if (!message.trim() || !user?._id || sending) return;

    if (!selectedMessage?.job?._id) {
      return;
    }

    if (selectedReceivers.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    try {
      setSending(true);

      await api.post("/messages", {
        jobId: selectedMessage.job._id,
        sender: user._id,
        receivers: selectedReceivers,
        message: message.trim(),
      });

      setMessage("");
      setSelectedReceivers([]);

      await fetchAllMessages();
    } catch (error) {
      console.log("Send message error:", error);

      alert(error.response?.data?.message || "Failed to send message.");
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

  const handleRefresh = async () => {
    await fetchJobs();
  };

  const tabs = [
    {
      label: "All",
      value: "All",
    },
    {
      label: "Messages",
      value: "Messages",
    },
    {
      label: "System",
      value: "System",
    },
    {
      label: "Unread",
      value: "Unread",
    },
    {
      label: "Sent",
      value: "Sent",
    },
  ];

  return (
    <CommonCard>
      <div className="message-center-page">
        {/* =========================
            HEADER
        ========================= */}

        <div className="message-center-header">
          <div className="message-center-heading">
            <div className="message-center-title-icon">
              <Mail size={27} strokeWidth={2} />
            </div>

            <div>
              <h2>Messages</h2>

              <span>
                {messages.length} total • {filteredMessages.length} shown
              </span>
            </div>
          </div>

          <div className="message-center-header-actions">
            <button
              type="button"
              className={`message-refresh-button ${
                loading ? "refreshing" : ""
              }`}
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh messages"
            >
              <RefreshCw size={17} />
            </button>

            <button
              type="button"
              className="new-message-button"
              onClick={() => {
                setShowComposer(true);
                setSelectedMessage(null);
                setSelectedReceivers([]);
                setMessage("");
              }}
            >
              <Plus size={19} />
              <span>New Message</span>
            </button>
          </div>
        </div>

        {/* =========================
            TABS
        ========================= */}

        <div className="message-center-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={activeTab === tab.value ? "active" : ""}
              onClick={() => {
                setActiveTab(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* =========================
            SEARCH
        ========================= */}

        <div className="message-center-toolbar">
          <div className="message-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            {search && (
              <button
                type="button"
                className="message-search-clear"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                ×
              </button>
            )}
          </div>

          <div className="message-select-all">
            <input type="checkbox" id="select-all-messages" />
            <label htmlFor="select-all-messages">
              Select All ({filteredMessages.length})
            </label>
          </div>
        </div>

        {/* =========================
            MESSAGE LIST
        ========================= */}

        <div className="message-list">
          {loading && messages.length === 0 ? (
            <div className="message-list-empty">
              <div className="message-loading-spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : paginatedMessages.length === 0 ? (
            <div className="message-list-empty">
              <div className="message-empty-icon">
                <MailOpen size={28} />
              </div>

              <h3>No messages found</h3>

              <p>
                {search
                  ? "Try a different search."
                  : "There are no messages available."}
              </p>
            </div>
          ) : (
            paginatedMessages.map((msg) => {
              const isSelected = selectedMessage?._id === msg._id;

              return (
                <div
                  key={msg._id}
                  className={`message-list-row ${
                    !msg.read ? "unread-message" : ""
                  } ${isSelected ? "selected-message" : ""}`}
                >
                  <div className="message-row-checkbox">
                    <input
                      type="checkbox"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <button
                    type="button"
                    className="message-row-main"
                    onClick={() => openMessage(msg)}
                  >
                    <div className="message-row-icon">
                      <Mail size={19} strokeWidth={2} />
                    </div>

                    <div className="message-row-content">
                      <div className="message-row-top">
                        <strong>{getSenderName(msg)}</strong>

                        <span className="message-row-date">
                          {formatDateTime(msg.createdAt)}
                        </span>
                      </div>

                      <div className="message-row-preview">{msg.message}</div>

                      {msg.job && (
                        <div className="message-row-job">
                          {msg.job.jobName}

                          {msg.job.clientName && (
                            <>
                              <span>•</span>
                              {msg.job.clientName}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="message-row-actions">
                    <button
                      type="button"
                      title={msg.read ? "Mark unread" : "Mark read"}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {msg.read ? <Mail size={18} /> : <MailOpen size={18} />}
                    </button>

                    <button
                      type="button"
                      title="Reply"
                      onClick={(e) => {
                        e.stopPropagation();
                        openMessage(msg);
                      }}
                    >
                      <Reply size={18} />
                    </button>

                    <button
                      type="button"
                      title="Delete"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* =========================
            PAGINATION
        ========================= */}

        <div className="message-center-pagination">
          <span>
            {filteredMessages.length === 0
              ? "0"
              : `${(page - 1) * messagesPerPage + 1}-${Math.min(
                  page * messagesPerPage,
                  filteredMessages.length,
                )}`}{" "}
            of {filteredMessages.length}
          </span>

          <div className="pagination-buttons">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft size={17} />
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* =========================
            MESSAGE VIEW
        ========================= */}

        {selectedMessage && (
          <div className="message-view-overlay" onClick={closeMessage}>
            <div
              className="message-view-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="message-view-header">
                <div className="message-view-sender">
                  <div className="message-view-avatar">
                    {getInitials(selectedMessage)}
                  </div>

                  <div>
                    <h3>{getSenderName(selectedMessage)}</h3>

                    <span>{formatDateTime(selectedMessage.createdAt)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="message-view-close"
                  onClick={closeMessage}
                >
                  ×
                </button>
              </div>

              <div className="message-view-job">
                <span>Job</span>

                <strong>{selectedMessage.job?.jobName || "Message"}</strong>

                {selectedMessage.job?.clientName && (
                  <>
                    <span>•</span>
                    <span>{selectedMessage.job.clientName}</span>
                  </>
                )}
              </div>

              <div className="message-view-body">{selectedMessage.message}</div>

              <div className="message-view-footer">
                <div className="message-receiver-selector">
                  <label>Send To</label>

                  {assignedEmployees.length === 0 ? (
                    <div className="message-receiver-empty">
                      No other assigned employee
                    </div>
                  ) : (
                    <div className="message-receiver-options">
                      <label className="message-receiver-option">
                        <input
                          type="checkbox"
                          checked={
                            assignedEmployees.length > 0 &&
                            assignedEmployees.every((employee) =>
                              selectedReceivers.includes(String(employee._id)),
                            )
                          }
                          onChange={selectAllReceivers}
                        />

                        <span>All</span>
                      </label>

                      {assignedEmployees.map((employee) => (
                        <label
                          key={employee._id}
                          className="message-receiver-option"
                        >
                          <input
                            type="checkbox"
                            checked={selectedReceivers.includes(
                              String(employee._id),
                            )}
                            onChange={() =>
                              toggleReceiver(String(employee._id))
                            }
                          />

                          <span>
                            {employee.firstName || "Employee"}{" "}
                            {employee.lastName || ""}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  placeholder="Write a reply..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  disabled={!user?._id}
                />

                <button
                  type="button"
                  className="message-send-button"
                  onClick={sendMessage}
                  disabled={!message.trim() || !user?._id || sending}
                >
                  <Send size={17} />
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================
            NEW MESSAGE
        ========================= */}

        {showComposer && (
          <div
            className="message-view-overlay"
            onClick={() => setShowComposer(false)}
          >
            <div
              className="message-view-modal new-message-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="message-view-header">
                <div className="message-view-sender">
                  <div className="message-view-avatar">
                    <Plus size={21} />
                  </div>

                  <div>
                    <h3>New Message</h3>
                    <span>Send a message through Message Centre</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="message-view-close"
                  onClick={() => setShowComposer(false)}
                >
                  ×
                </button>
              </div>

              <div className="new-message-job-list">
                <label>Select Job</label>

                <select
                  value={selectedMessage?.job?._id || ""}
                  onChange={(e) => {
                    const job = jobs.find(
                      (item) => item._id === e.target.value,
                    );

                    if (job) {
                      setSelectedMessage({
                        job,
                      });

                      setSelectedReceivers([]);
                    }
                  }}
                >
                  <option value="">Select a job</option>

                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.jobName}
                      {job.clientName ? ` — ${job.clientName}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="new-message-receiver-list">
                <label>Send To</label>

                {!selectedJob ? (
                  <div className="new-message-receiver-empty">
                    Select a job first
                  </div>
                ) : assignedEmployees.length === 0 ? (
                  <div className="new-message-receiver-empty">
                    No other assigned employee
                  </div>
                ) : (
                  <div className="new-message-receiver-options">
                    <label className="new-message-receiver-option">
                      <input
                        type="checkbox"
                        checked={
                          assignedEmployees.length > 0 &&
                          assignedEmployees.every((employee) =>
                            selectedReceivers.includes(String(employee._id)),
                          )
                        }
                        onChange={selectAllReceivers}
                      />

                      <span>All</span>
                    </label>

                    {assignedEmployees.map((employee) => (
                      <label
                        key={employee._id}
                        className="new-message-receiver-option"
                      >
                        <input
                          type="checkbox"
                          checked={selectedReceivers.includes(
                            String(employee._id),
                          )}
                          onChange={() => toggleReceiver(String(employee._id))}
                        />

                        <span>
                          {employee.firstName || "Employee"}{" "}
                          {employee.lastName || ""}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="new-message-input">
                <label>Message</label>

                <textarea
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="new-message-footer">
                <button
                  type="button"
                  className="cancel-message-button"
                  onClick={() => {
                    setShowComposer(false);
                    setSelectedMessage(null);
                    setSelectedReceivers([]);
                    setMessage("");
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="message-send-button"
                  onClick={async () => {
                    if (!selectedMessage?.job?._id) return;

                    await sendMessage();

                    setShowComposer(false);
                  }}
                  disabled={
                    !selectedMessage?.job?._id ||
                    selectedReceivers.length === 0 ||
                    !message.trim() ||
                    sending
                  }
                >
                  <Send size={17} />
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CommonCard>
  );
}

export default MessageCenter;
