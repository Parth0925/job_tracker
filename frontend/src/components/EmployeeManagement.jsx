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

  const [aadharCard, setAadharCard] = useState(null);
  const [panCard, setPanCard] = useState(null);

  const [payslips, setPayslips] = useState([]);

  const [qualifications, setQualifications] = useState([]);

  const [certificates, setCertificates] = useState([]);

  const [relievingLetter, setRelievingLetter] = useState(null);

  const [experienceLetter, setExperienceLetter] = useState(null);

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
      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("mobile", mobile);

      formData.append("designation", designation);
      formData.append("department", department);

      formData.append("joiningDate", joiningDate);
      formData.append("dateOfBirth", dateOfBirth);

      formData.append(
        "interestAreas",
        JSON.stringify(
          interestAreas
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );

      formData.append("employmentType", employmentType);
      formData.append("status", status);
      formData.append("role", "employee");
      formData.append("notes", notes);

      if (aadharCard) formData.append("aadharCard", aadharCard);

      if (panCard) formData.append("panCard", panCard);

      if (relievingLetter) formData.append("relievingLetter", relievingLetter);

      if (experienceLetter)
        formData.append("experienceLetter", experienceLetter);

      payslips.forEach((file) => formData.append("payslips", file));

      qualifications.forEach((file) => formData.append("qualifications", file));

      certificates.forEach((file) => formData.append("certificates", file));

      await api.post("/employees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

  const fileUrl = (fileName) => {
    if (!fileName) return "#";

    return `${import.meta.env.VITE_API_URL}/uploads/employees/${fileName}`;
  };

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

            <select
              className="form-input"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            >
              <option value="">Select Designation</option>
              <option value="Operational Head">Operational Head</option>
              <option value="Manager">Manager</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Senior Accountant">Senior Accountant</option>
              <option value="Junior Accountant">Junior Accountant</option>
              <option value="Trainee">Trainee</option>
            </select>

            <select
              className="form-input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="UK Accounts and Taxation">
                UK Accounts and Taxation
              </option>
              <option value="Human Resource">Human Resource</option>
              <option value="Learning and Development">
                Learning and Development
              </option>
            </select>
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

            <div className="documents-section">
              <h3>Employee Documents</h3>

              <div className="form-grid">
                <div>
                  <label className="field-label">Aadhar Card</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setAadharCard(e.target.files[0])}
                  />
                </div>

                <div>
                  <label className="field-label">PAN Card</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setPanCard(e.target.files[0])}
                  />
                </div>

                <div>
                  <label className="field-label">Payslips</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setPayslips([...e.target.files])}
                  />
                </div>

                <div>
                  <label className="field-label">Qualifications</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setQualifications([...e.target.files])}
                  />
                </div>

                <div>
                  <label className="field-label">Certificates</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setCertificates([...e.target.files])}
                  />
                </div>

                <div>
                  <label className="field-label">Relieving Letter</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setRelievingLetter(e.target.files[0])}
                  />
                </div>

                <div>
                  <label className="field-label">Experience Letter</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setExperienceLetter(e.target.files[0])}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="button add-btn" disabled={loading}>
            {loading ? "Adding Employee..." : "Add Employee"}
          </button>
        </div>
      </form>

      <div className="organisation-section">
        <div className="employees-header">
          <div>
            <h2>Organisation Tree</h2>
            <p>Employee hierarchy by designation</p>
          </div>
        </div>

        <div className="organisation-tree">
          {[
            "Operational Head",
            "Manager",
            "Team Leader",
            "Senior Accountant",
            "Junior Accountant",
            "Trainee",
          ].map((designation) => {
            const levelEmployees = employees.filter(
              (employee) => employee.designation === designation,
            );

            if (levelEmployees.length === 0) return null;

            return (
              <div className="organisation-level" key={designation}>
                <div className="organisation-designation">{designation}</div>

                <div className="organisation-employees">
                  {levelEmployees.map((employee) => (
                    <div
                      className="organisation-card"
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

                      <div>
                        <h4>
                          {employee.firstName} {employee.lastName}
                        </h4>

                        <p>{employee.department}</p>

                        <span>{employee.employeeCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
              <h4>Employee Documents</h4>

              <div className="documents-list">
                {selectedEmployee.documents?.aadharCard && (
                  <p>
                    <strong>Aadhar Card : </strong>

                    <a
                      href={fileUrl(selectedEmployee.documents.aadharCard)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </p>
                )}

                {selectedEmployee.documents?.panCard && (
                  <p>
                    <strong>PAN Card : </strong>

                    <a
                      href={fileUrl(selectedEmployee.documents.panCard)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </p>
                )}

                {selectedEmployee.documents?.relievingLetter && (
                  <p>
                    <strong>Relieving Letter : </strong>

                    <a
                      href={fileUrl(selectedEmployee.documents.relievingLetter)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </p>
                )}

                {selectedEmployee.documents?.experienceLetter && (
                  <p>
                    <strong>Experience Letter : </strong>

                    <a
                      href={fileUrl(
                        selectedEmployee.documents.experienceLetter,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </p>
                )}

                {selectedEmployee.documents?.payslips?.length > 0 && (
                  <>
                    <strong>Payslips</strong>

                    <ul>
                      {selectedEmployee.documents.payslips.map((file) => (
                        <li key={file}>
                          <a
                            href={fileUrl(file)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {file}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {selectedEmployee.documents?.qualifications?.length > 0 && (
                  <>
                    <strong>Qualifications</strong>

                    <ul>
                      {selectedEmployee.documents.qualifications.map((file) => (
                        <li key={file}>
                          <a
                            href={fileUrl(file)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {file}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {selectedEmployee.documents?.certificates?.length > 0 && (
                  <>
                    <strong>Certificates</strong>

                    <ul>
                      {selectedEmployee.documents.certificates.map((file) => (
                        <li key={file}>
                          <a
                            href={fileUrl(file)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {file}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
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
