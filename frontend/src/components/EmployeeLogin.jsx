import { useState } from "react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./EmployeeLogin.css";

function EmployeeLogin() {
  const { login } = useAuth();

  const [employeeCode, setEmployeeCode] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!employeeCode || !password) {
      setError("Please enter Employee Code and Password.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      const response = await api.post("/auth/login", {
        employeeCode,

        password,
      });

      login(response.data.employee, response.data.token);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">JT</div>

          <h1>Welcome Back</h1>

          <p>Sign in to access your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Employee Code</label>

            <input
              className="form-input"
              placeholder="Enter employee code"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              className="form-input"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeLogin;
