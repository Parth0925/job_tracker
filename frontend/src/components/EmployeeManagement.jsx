import { useEffect, useState } from "react";
import api from "../services/api";
import "./EmployeeManagement.css";

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data);
    } catch (error) {
      console.log("Fetch employees error:", error);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setLoading(true);

      await api.post("/employees", {
        name,
        email,
        role: "employee",
      });

      setName("");
      setEmail("");

      fetchEmployees();
    } catch (error) {
      console.log("Add employee error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-management">
      <h2 className="section-title">Add Employee</h2>

      <form className="employee-form" onSubmit={handleAddEmployee}>
        <input
          type="text"
          placeholder="Employee name"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Employee email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Employee"}
        </button>
      </form>

      <h2 className="section-title">Employees</h2>

      <div className="employees-grid">
        {employees.map((employee) => (
          <div className="employee-card" key={employee._id}>
            <h3 className="employee-name">{employee.name}</h3>

            <p className="employee-info">
              <strong>Email:</strong> {employee.email || "No email"}
            </p>

            <p className="employee-info">
              <strong>Role:</strong> {employee.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeManagement;
