import { useEffect, useState } from "react";
import api from "../services/api";
import "./EmployeeManagement.css";

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");

  const [joiningDate, setJoiningDate] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [interestAreas, setInterestAreas] = useState("");

  const [employmentType, setEmploymentType] = useState("Full Time");
  const [status, setStatus] = useState("Active");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

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

    if (!firstName.trim()) return;

    try {
      setLoading(true);

      await api.post("/employees", {
        firstName,
        lastName,
        email,
        mobile,

        designation,
        department,

        joiningDate,
        dateOfBirth,

        interestAreas: interestAreas
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        employmentType,
        status,

        role: "employee",

        notes,
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setMobile("");

      setDesignation("");
      setDepartment("");

      setJoiningDate("");
      setDateOfBirth("");

      setInterestAreas("");

      setEmploymentType("Full Time");
      setStatus("Active");

      setNotes("");

      fetchEmployees();
    } catch (error) {
      console.log("Add employee error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase();

    return (
      employee.firstName?.toLowerCase().includes(search) ||
      employee.lastName?.toLowerCase().includes(search) ||
      employee.employeeCode?.toLowerCase().includes(search) ||
      employee.designation?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="employee-management">
      <div className="section-header">
        <h2>Add Employee</h2>
        <p>Create and manage employee profiles.</p>
      </div>

      <form className="employee-form" onSubmit={handleAddEmployee}>
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-grid">
            <input
              className="form-input"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              className="form-input"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />

            <input
              className="form-input"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="form-input"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />

            <input
              className="form-input"
              placeholder="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />

            <input
              className="form-input"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Employment Information</h3>

          <div className="form-grid">
            <div>
              <label className="field-label">Joining Date</label>

              <input
                className="form-input"
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">Date of Birth</label>

              <input
                className="form-input"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <select
              className="form-input"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
            >
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Intern</option>
              <option>Contract</option>
            </select>

            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>

          <div className="form-grid">
            <input
              className="form-input"
              placeholder="Interest Areas (React, Node, MongoDB)"
              value={interestAreas}
              onChange={(e) => setInterestAreas(e.target.value)}
            />

            <textarea
              className="form-input notes-box"
              placeholder="Employee Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="button add-btn" disabled={loading}>
            {loading ? "Adding Employee..." : "Add Employee"}
          </button>
        </div>
      </form>

      <div className="employees-section">
        <div className="employees-header">
          <div>
            <h2>Employees</h2>
            <p>{employees.length} Employees Registered</p>
          </div>

          <input
            className="search-input"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="employees-grid">
          {filteredEmployees.map((employee) => (
            <div
              className="employee-card"
              key={employee._id}
              onClick={() => {
                setSelectedEmployee(employee);
                setShowModal(true);
              }}
            >
              <div className="employee-avatar">
                {employee.firstName?.charAt(0)}
                {employee.lastName?.charAt(0)}
              </div>

              <h3 className="employee-name">
                {employee.firstName} {employee.lastName}
              </h3>

              <p className="employee-designation">{employee.designation}</p>

              <span className="employee-code">{employee.employeeCode}</span>

              <div className="employee-footer">
                <span>{employee.department}</span>

                <span
                  className={`status-badge ${
                    employee.status === "Active"
                      ? "active-status"
                      : "inactive-status"
                  }`}
                >
                  {employee.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedEmployee && (
        <div
          className="employee-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="employee-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ✕
            </button>

            <div className="profile-header">
              <div className="profile-avatar">
                {selectedEmployee.firstName?.charAt(0)}
                {selectedEmployee.lastName?.charAt(0)}
              </div>

              <h2>
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h2>

              <p>{selectedEmployee.designation}</p>
            </div>

            <div className="profile-grid">
              <div className="profile-item">
                <label>Employee Code</label>
                <span>{selectedEmployee.employeeCode}</span>
              </div>

              <div className="profile-item">
                <label>Email</label>
                <span>{selectedEmployee.email}</span>
              </div>

              <div className="profile-item">
                <label>Mobile</label>
                <span>{selectedEmployee.mobile}</span>
              </div>

              <div className="profile-item">
                <label>Department</label>
                <span>{selectedEmployee.department}</span>
              </div>

              <div className="profile-item">
                <label>Joining Date</label>
                <span>{selectedEmployee.joiningDate?.substring(0, 10)}</span>
              </div>

              <div className="profile-item">
                <label>Date of Birth</label>
                <span>{selectedEmployee.dateOfBirth?.substring(0, 10)}</span>
              </div>

              <div className="profile-item">
                <label>Employment</label>
                <span>{selectedEmployee.employmentType}</span>
              </div>

              <div className="profile-item">
                <label>Status</label>
                <span>{selectedEmployee.status}</span>
              </div>
            </div>

            <div className="profile-section">
              <h4>Interest Areas</h4>

              <div className="interest-list">
                {selectedEmployee.interestAreas?.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h4>Notes</h4>

              <p>{selectedEmployee.notes || "No notes available."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;
