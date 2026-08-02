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

    const trimmedEmployeeCode = employeeCode.trim();

    if (!trimmedEmployeeCode && !password) {
      setError("Please enter Employee Code and Password.");
      return;
    }

    if (!trimmedEmployeeCode) {
      setError("Please enter Employee Code.");
      return;
    }

    if (!password) {
      setError("Please enter Password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        employeeCode: trimmedEmployeeCode,
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

        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="input-group">
            <label htmlFor="employee-code">Employee Code</label>

            <input
              id="employee-code"
              className={`form-input ${error && !employeeCode.trim() ? "input-error" : ""}`}
              type="text"
              placeholder="Enter employee code"
              value={employeeCode}
              onChange={(e) => {
                setEmployeeCode(e.target.value.toUpperCase());
                if (error) setError("");
              }}
              autoComplete="username"
              autoCapitalize="characters"
              spellCheck="false"
              maxLength={30}
              disabled={loading}
              aria-label="Employee Code"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              className={`form-input ${error && !password ? "input-error" : ""}`}
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              autoComplete="current-password"
              maxLength={100}
              disabled={loading}
              aria-label="Password"
            />
          </div>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeLogin;
