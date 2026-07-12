import { useEffect, useState } from "react";
import api from "../services/api";
import "./ChatWindow.css";

function ChatWindow({ job, employee }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Replace this with logged-in admin later
  const adminId = "6a51db2dda6f64917b932352";

  useEffect(() => {
    if (job && employee) {
      fetchConversation();
    }
  }, [job, employee]);

  const fetchConversation = async () => {
    try {
      const response = await api.get(
        `/messages/conversation/${job._id}/${adminId}/${employee._id}`,
      );

      setMessages(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await api.post("/messages", {
        jobId: job._id,
        sender: adminId,
        receiver: employee._id,
        message: text,
      });

      setText("");

      fetchConversation();
    } catch (error) {
      console.log(error);
    }
  };

  if (!job || !employee) {
    return (
      <div className="chat-window">
        <h3>Select a Job and Employee</h3>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>
          {employee.firstName} {employee.lastName}
        </h3>

        <p>{job.jobName}</p>
      </div>

      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={
              msg.sender._id === adminId ? "message sent" : "message received"
            }
          >
            <p>{msg.message}</p>

            <small>{new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Write a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
