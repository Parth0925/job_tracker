import { useState } from "react";

import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import EmployeeLogin from "./components/EmployeeLogin";

import "./App.css";

function App() {
  const [role, setRole] = useState("employee");

  const [employee, setEmployee] = useState(
    JSON.parse(localStorage.getItem("employee")) || null,
  );

  const handleEmployeeLogin = (employeeData) => {
    setEmployee(employeeData);
  };

  const handleLogout = () => {
    localStorage.removeItem("employee");

    setEmployee(null);
  };

  return (
    <div className="container">
      <div className="button-group">
        <button
          className={`role-btn ${role === "admin" ? "active" : ""}`}
          onClick={() => setRole("admin")}
        >
          Admin
        </button>

        <button
          className={`role-btn ${role === "employee" ? "active" : ""}`}
          onClick={() => setRole("employee")}
        >
          Employee
        </button>
      </div>

      {role === "admin" ? (
        <AdminDashboard />
      ) : employee ? (
        <>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>

          <EmployeeDashboard employee={employee} />
        </>
      ) : (
        <EmployeeLogin onLogin={handleEmployeeLogin} />
      )}
    </div>
  );
}

export default App;
