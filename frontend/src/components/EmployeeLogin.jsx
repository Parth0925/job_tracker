import { useState } from "react";
import api from "../services/api";
import "./EmployeeLogin.css";

function EmployeeLogin({ onLogin }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/employees/name/${name}`);

      const employee = response.data;

      localStorage.setItem("employee", JSON.stringify(employee));

      onLogin(employee);
    } catch (error) {
      setError(
        "Employee not found. Please enter the same name added by admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login">
      <div className="login-card">
        <h1 className="dashboard-title">Employee Access</h1>

        <p className="login-text">Enter your name to continue</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {error && <p className="error-message">{error}</p>}

          <button className="button" disabled={loading}>
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeLogin;
