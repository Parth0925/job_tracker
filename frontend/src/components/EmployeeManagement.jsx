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

  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [hierarchyError, setHierarchyError] = useState("");
  const [hierarchySaving, setHierarchySaving] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowModal(false);
        setShowAddEmployeeModal(false);
      }
    };

    if (showModal || showAddEmployeeModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showModal, showAddEmployeeModal]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data || []);
    } catch (error) {
      console.log("Fetch employees error:", error);
    }
  };

  const resetForm = () => {
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

    setAadharCard(null);
    setPanCard(null);
    setPayslips([]);
    setQualifications([]);
    setCertificates([]);
    setRelievingLetter(null);
    setExperienceLetter(null);

    const fileInputs = document.querySelectorAll(
      '.employee-form input[type="file"]',
    );

    fileInputs.forEach((input) => {
      input.value = "";
    });
  };

  const validateForm = () => {
    setFormError("");

    if (!firstName.trim()) {
      return "First name is required.";
    }

    if (!lastName.trim()) {
      return "Last name is required.";
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email.trim())) {
        return "Please enter a valid email address.";
      }
    }

    if (mobile.trim()) {
      const mobileRegex = /^[0-9]{10}$/;

      if (!mobileRegex.test(mobile.trim())) {
        return "Mobile number must contain exactly 10 digits.";
      }
    }

    if (!designation) {
      return "Please select a designation.";
    }

    if (!department) {
      return "Please select a department.";
    }

    if (!joiningDate) {
      return "Joining date is required.";
    }

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();

      if (dob > today) {
        return "Date of birth cannot be in the future.";
      }
    }

    if (joiningDate && dateOfBirth) {
      const joining = new Date(joiningDate);
      const dob = new Date(dateOfBirth);

      if (joining < dob) {
        return "Joining date cannot be before date of birth.";
      }
    }

    return "";
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    setFormError("");
    setFormSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("email", email.trim());
      formData.append("mobile", mobile.trim());

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
      formData.append("notes", notes.trim());

      if (aadharCard) formData.append("aadharCard", aadharCard);
      if (panCard) formData.append("panCard", panCard);
      if (relievingLetter) {
        formData.append("relievingLetter", relievingLetter);
      }
      if (experienceLetter) {
        formData.append("experienceLetter", experienceLetter);
      }

      payslips.forEach((file) => formData.append("payslips", file));
      qualifications.forEach((file) => formData.append("qualifications", file));
      certificates.forEach((file) => formData.append("certificates", file));

      await api.post("/employees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      resetForm();

      await fetchEmployees();

      setFormSuccess("Employee added successfully.");

      setTimeout(() => {
        setFormSuccess("");
        setShowAddEmployeeModal(false);
      }, 1200);
    } catch (error) {
      console.log("Add employee error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Unable to add employee. Please try again.";

      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    return (
      employee.firstName?.toLowerCase().includes(search) ||
      employee.lastName?.toLowerCase().includes(search) ||
      employee.employeeCode?.toLowerCase().includes(search) ||
      employee.designation?.toLowerCase().includes(search) ||
      employee.department?.toLowerCase().includes(search) ||
      employee.email?.toLowerCase().includes(search)
    );
  });

  const fileUrl = (fileName) => {
    if (!fileName) return "#";

    return `${import.meta.env.VITE_API_URL}/uploads/employees/${fileName}`;
  };

  const openEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeEmployeeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const closeAddEmployeeModal = () => {
    setShowAddEmployeeModal(false);
    setFormError("");
    setFormSuccess("");
  };

  const handleResignEmployee = async () => {
    if (!selectedEmployee) return;

    const confirmed = window.confirm(
      `Are you sure you want to mark ${selectedEmployee.firstName} ${selectedEmployee.lastName} as resigned?`,
    );

    if (!confirmed) return;

    try {
      await api.patch(`/employees/${selectedEmployee._id}/resign`);

      await fetchEmployees();

      const response = await api.get(`/employees`);
      const updatedEmployee = response.data?.find(
        (employee) => employee._id === selectedEmployee._id,
      );

      setSelectedEmployee(updatedEmployee || null);
    } catch (error) {
      console.log("Resign employee error:", error);

      setFormError(
        error?.response?.data?.message ||
          "Unable to mark employee as resigned.",
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getEmployeeInitials = (employee) => {
    const first = employee?.firstName?.charAt(0) || "";
    const last = employee?.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "?";
  };

  const getEmployeeById = (id) => {
    if (!id) return null;

    return employees.find(
      (employee) => employee._id === id || employee._id?.toString() === id,
    );
  };

  const getDirectReports = (managerId) => {
    return employees.filter(
      (employee) =>
        employee.reportsTo &&
        employee.reportsTo.toString() === managerId.toString(),
    );
  };

  const getReportsToId = (employee) => {
    if (!employee?.reportsTo) return "";

    if (typeof employee.reportsTo === "object") {
      return employee.reportsTo._id || "";
    }

    return employee.reportsTo;
  };

  const canAssignReportsTo = (employeeId, managerId) => {
    if (!managerId) return true;

    if (employeeId === managerId) return false;

    let currentId = managerId;

    while (currentId) {
      if (currentId === employeeId) {
        return false;
      }

      const currentEmployee = getEmployeeById(currentId);

      if (!currentEmployee) {
        break;
      }

      currentId = getReportsToId(currentEmployee);
    }

    return true;
  };

  const updateReportingManager = async (employeeId, managerId) => {
    setHierarchyError("");

    if (!canAssignReportsTo(employeeId, managerId)) {
      setHierarchyError(
        "Invalid reporting structure. This change would create a circular hierarchy.",
      );
      return;
    }

    try {
      setHierarchySaving(employeeId);

      await api.patch(`/employees/${employeeId}/reporting`, {
        reportsTo: managerId || null,
      });

      await fetchEmployees();
    } catch (error) {
      console.log("Update reporting manager error:", error);

      setHierarchyError(
        error?.response?.data?.message ||
          "Unable to update reporting structure.",
      );
    } finally {
      setHierarchySaving(null);
    }
  };

  const handleOrganisationDragStart = (employee) => {
    setDraggedEmployee(employee);
  };

  const handleOrganisationDragEnd = () => {
    setDraggedEmployee(null);
  };

  const handleOrganisationDrop = async (targetEmployee) => {
    if (!draggedEmployee) return;

    const employeeId = draggedEmployee._id;
    const managerId = targetEmployee._id;

    if (employeeId === managerId) {
      setHierarchyError("An employee cannot report to themselves.");
      setDraggedEmployee(null);
      return;
    }

    await updateReportingManager(employeeId, managerId);

    setDraggedEmployee(null);
  };

  const handleOrganisationRootDrop = async (event) => {
    event.preventDefault();

    if (!draggedEmployee) return;

    await updateReportingManager(draggedEmployee._id, null);

    setDraggedEmployee(null);
  };

  const renderOrganisationEmployee = (employee) => {
    const children = getDirectReports(employee._id);
    const reportsToId = getReportsToId(employee);
    const reportsToEmployee = getEmployeeById(reportsToId);

    return (
      <div className="organisation-node" key={employee._id}>
        <div className="organisation-node-content">
          <div
            className={`organisation-card ${
              draggedEmployee?._id === employee._id
                ? "organisation-card-dragging"
                : ""
            }`}
            draggable
            onDragStart={() => handleOrganisationDragStart(employee)}
            onDragEnd={handleOrganisationDragEnd}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleOrganisationDrop(employee)}
          >
            <div className="organisation-card-main">
              <div className="employee-avatar">
                {getEmployeeInitials(employee)}
              </div>

              <div className="organisation-card-info">
                <h4>
                  {employee.firstName} {employee.lastName}
                </h4>

                <p>{employee.designation || "No designation"}</p>

                <span>
                  {employee.department || "No department"} ·{" "}
                  {employee.employeeCode}
                </span>
              </div>
            </div>

            <div
              className="organisation-reporting"
              onClick={(event) => event.stopPropagation()}
            >
              <label htmlFor={`reports-${employee._id}`}>Reports to</label>

              <select
                id={`reports-${employee._id}`}
                value={reportsToId}
                disabled={hierarchySaving === employee._id}
                onChange={(event) =>
                  updateReportingManager(
                    employee._id,
                    event.target.value || null,
                  )
                }
              >
                <option value="">No one / Top level</option>

                {employees
                  .filter(
                    (manager) =>
                      manager._id !== employee._id &&
                      canAssignReportsTo(employee._id, manager._id),
                  )
                  .sort((a, b) => {
                    const levelA = a.designationLevel || 999;
                    const levelB = b.designationLevel || 999;

                    if (levelA !== levelB) {
                      return levelA - levelB;
                    }

                    return `${a.firstName} ${a.lastName}`.localeCompare(
                      `${b.firstName} ${b.lastName}`,
                    );
                  })
                  .map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.firstName} {manager.lastName} —{" "}
                      {manager.designation}
                    </option>
                  ))}
              </select>

              {hierarchySaving === employee._id && <small>Saving...</small>}

              {reportsToEmployee && (
                <span className="organisation-current-manager">
                  ↑ {reportsToEmployee.firstName} {reportsToEmployee.lastName}
                </span>
              )}
            </div>
          </div>

          {children.length > 0 && (
            <div className="organisation-children">
              {children.map((child) => renderOrganisationEmployee(child))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const organisationRoots = employees.filter(
    (employee) => !getReportsToId(employee),
  );

  const getFileNames = (files) => {
    if (!files?.length) return [];

    return files.map((file) => file.name || file);
  };

  return (
    <div className="employee-management">
      <div className="section-header">
        <div>
          <span className="section-eyebrow">Employee Management</span>

          <h1>Employees</h1>

          <p>
            Create and manage employee profiles, documents and organisation
            information.
          </p>
        </div>

        <div className="section-header-actions">
          {/* <div className="employee-count-card">
            <strong>{employees.length}</strong>
            <span>Total Employees</span>
          </div> */}

          <button
            type="button"
            className="button add-btn"
            onClick={() => {
              setFormError("");
              setFormSuccess("");
              setShowAddEmployeeModal(true);
            }}
          >
            + Add Employee
          </button>
        </div>
      </div>
      {showAddEmployeeModal && (
        <div
          className="employee-modal-overlay add-employee-modal-overlay"
          onClick={closeAddEmployeeModal}
          role="presentation"
        >
          <div
            className="employee-modal add-employee-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-employee-title"
          >
            <div className="add-employee-modal-header">
              <div>
                <span className="section-eyebrow">Employee Management</span>

                <h2 id="add-employee-title">Add Employee</h2>

                <p>Create a new employee profile and upload their documents.</p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={closeAddEmployeeModal}
                aria-label="Close add employee form"
              >
                ×
              </button>
            </div>

            <div className="add-employee-modal-body">
              <form
                className="employee-form"
                onSubmit={handleAddEmployee}
                noValidate
              >
                {formError && (
                  <div className="form-alert form-alert-error" role="alert">
                    <span className="alert-icon">!</span>
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="form-alert form-alert-success" role="status">
                    <span className="alert-icon">✓</span>
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="form-section">
                  <div className="form-section-header">
                    <div>
                      <h3>Basic Information</h3>
                      <p>Enter the employee's personal and contact details.</p>
                    </div>

                    <span className="required-note">* Required</span>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label" htmlFor="firstName">
                        First Name <span>*</span>
                      </label>

                      <input
                        id="firstName"
                        className="form-input"
                        placeholder="Enter first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="lastName">
                        Last Name <span>*</span>
                      </label>

                      <input
                        id="lastName"
                        className="form-input"
                        placeholder="Enter last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="email">
                        Email Address
                      </label>

                      <input
                        id="email"
                        className="form-input"
                        type="email"
                        placeholder="employee@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="mobile">
                        Mobile Number
                      </label>

                      <input
                        id="mobile"
                        className="form-input"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={mobile}
                        onChange={(e) =>
                          setMobile(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="designation">
                        Designation <span>*</span>
                      </label>

                      <select
                        id="designation"
                        className="form-input"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        required
                      >
                        <option value="">Select Designation</option>
                        <option value="Founder">Founder</option>
                        <option value="Manager">Manager</option>
                        <option value="Team Leader">Team Leader</option>
                        <option value="Assistent Team Leader">
                          Assistent Team Leader
                        </option>
                        <option value="Senior Accountant">
                          Senior Accountant
                        </option>
                        <option value="Junior Accountant">
                          Junior Accountant
                        </option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="department">
                        Department <span>*</span>
                      </label>

                      <select
                        id="department"
                        className="form-input"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
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
                </div>

                <div className="form-section">
                  <div className="form-section-header">
                    <div>
                      <h3>Employment Information</h3>
                      <p>Set employment dates, type and current status.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label" htmlFor="joiningDate">
                        Joining Date <span>*</span>
                      </label>

                      <input
                        id="joiningDate"
                        className="form-input"
                        type="date"
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="dateOfBirth">
                        Date of Birth
                      </label>

                      <input
                        id="dateOfBirth"
                        className="form-input"
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="employmentType">
                        Employment Type
                      </label>

                      <select
                        id="employmentType"
                        className="form-input"
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                      >
                        <option>Full Time</option>
                        <option>Part Time</option>
                        {/* <option>Intern</option> */}
                        <option>Contract</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="field-label" htmlFor="status">
                        Status
                      </label>

                      <select
                        id="status"
                        className="form-input"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Resigned</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-header">
                    <div>
                      <h3>Additional Information</h3>
                      <p>Add interests, notes and employee documents.</p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-field full-width">
                      <label className="field-label" htmlFor="interestAreas">
                        Interest Areas
                      </label>

                      <input
                        id="interestAreas"
                        className="form-input"
                        placeholder="React, Node, MongoDB"
                        value={interestAreas}
                        onChange={(e) => setInterestAreas(e.target.value)}
                      />

                      <span className="field-help">
                        Separate multiple interests using commas.
                      </span>
                    </div>

                    <div className="form-field full-width">
                      <label className="field-label" htmlFor="notes">
                        Employee Notes
                      </label>

                      <textarea
                        id="notes"
                        className="form-input notes-box"
                        placeholder="Add any relevant employee notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="documents-section">
                    <div className="documents-header">
                      <div>
                        <h3>Employee Documents</h3>
                        <p>Upload supported PDF, JPG, JPEG or PNG documents.</p>
                      </div>
                    </div>

                    <div className="document-grid">
                      <div className="document-field">
                        <label className="field-label">Aadhar Card</label>

                        <input
                          id="aadharCard"
                          className="file-input"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            setAadharCard(e.target.files[0] || null)
                          }
                        />

                        <label className="file-upload-box" htmlFor="aadharCard">
                          <span className="file-upload-icon">↑</span>
                          <strong>
                            {aadharCard ? aadharCard.name : "Choose file"}
                          </strong>
                          <small>
                            {aadharCard
                              ? "File selected"
                              : "PDF, JPG, JPEG, PNG"}
                          </small>
                        </label>
                      </div>

                      <div className="document-field">
                        <label className="field-label">PAN Card</label>

                        <input
                          id="panCard"
                          className="file-input"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            setPanCard(e.target.files[0] || null)
                          }
                        />

                        <label className="file-upload-box" htmlFor="panCard">
                          <span className="file-upload-icon">↑</span>
                          <strong>
                            {panCard ? panCard.name : "Choose file"}
                          </strong>
                          <small>
                            {panCard ? "File selected" : "PDF, JPG, JPEG, PNG"}
                          </small>
                        </label>
                      </div>

                      <div className="document-field">
                        <label className="field-label">Payslips</label>

                        <input
                          id="payslips"
                          className="file-input"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setPayslips([...e.target.files])}
                        />

                        <label className="file-upload-box" htmlFor="payslips">
                          <span className="file-upload-icon">↑</span>
                          <strong>
                            {payslips.length
                              ? `${payslips.length} file(s) selected`
                              : "Choose files"}
                          </strong>
                          <small>Multiple files allowed</small>
                        </label>
                      </div>

                      <div className="document-field">
                        <label className="field-label">Qualifications</label>

                        <input
                          id="qualifications"
                          className="file-input"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            setQualifications([...e.target.files])
                          }
                        />

                        <label
                          className="file-upload-box"
                          htmlFor="qualifications"
                        >
                          <span className="file-upload-icon">↑</span>
                          <strong>
                            {qualifications.length
                              ? `${qualifications.length} file(s) selected`
                              : "Choose files"}
                          </strong>
                          <small>Multiple files allowed</small>
                        </label>
                      </div>

                      <div className="document-field">
                        <label className="field-label">Certificates</label>

                        <input
                          id="certificates"
                          className="file-input"
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setCertificates([...e.target.files])}
                        />

                        <label
                          className="file-upload-box"
                          htmlFor="certificates"
                        >
                          <span className="file-upload-icon">↑</span>
                          <strong>
                            {certificates.length
                              ? `${certificates.length} file(s) selected`
                              : "Choose files"}
                          </strong>
                          <small>Multiple files allowed</small>
                        </label>
                      </div>

                      <div className="document-field">
                        <label className="field-label">Relieving Letter</label>

                        <input
                          id="relievingLetter"
                          className="file-input"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            setRelievingLetter(e.target.files[0] || null)
                          }
                        />

                        <label
                          className="file-upload-box"
                          htmlFor="relievingLetter"
                        >
                          <span className="file-upload-icon">↑</span>
                          <strong>
                            {relievingLetter
                              ? relievingLetter.name
                              : "Choose file"}
                          </strong>
                          <small>
                            {relievingLetter
                              ? "File selected"
                              : "PDF, JPG, JPEG, PNG"}
                          </small>
                        </label>
                      </div>

                      <div className="document-field">
                        <label className="field-label">Experience Letter</label>

                        <input
                          id="experienceLetter"
                          className="file-input"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            setExperienceLetter(e.target.files[0] || null)
                          }
                        />

                        <label
                          className="file-upload-box"
                          htmlFor="experienceLetter"
                        >
                          <span className="file-upload-icon">↑</span>
                          <strong>
                            {experienceLetter
                              ? experienceLetter.name
                              : "Choose file"}
                          </strong>
                          <small>
                            {experienceLetter
                              ? "File selected"
                              : "PDF, JPG, JPEG, PNG"}
                          </small>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Clear Form
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={closeAddEmployeeModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button add-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="button-spinner"></span>
                        Adding Employee...
                      </>
                    ) : (
                      "Add Employee"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* <section className="organisation-section">
        <div className="employees-header">
          <div>
            <span className="section-eyebrow">Organisation</span>
            <h2>Organisation Tree</h2>
            <p>
              Drag an employee onto another employee or use Reports to to change
              the hierarchy.
            </p>
          </div>
        </div>

        {hierarchyError && (
          <div className="form-alert form-alert-error" role="alert">
            <span className="alert-icon">!</span>
            <span>{hierarchyError}</span>
          </div>
        )}

        {employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <h3>No employees available</h3>
            <p>Add your first employee to build the organisation tree.</p>
          </div>
        ) : (
          <div
            className="organisation-tree"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleOrganisationRootDrop}
          >
            <div className="organisation-tree-hint">
              <span>↕</span>
              <span>Drag employees to change reporting structure</span>
            </div>

            <div className="organisation-roots">
              {organisationRoots.map((employee) =>
                renderOrganisationEmployee(employee),
              )}
            </div>

            {organisationRoots.length === 0 && (
              <div className="organisation-no-root">
                <strong>No top-level employee</strong>
                <span>
                  Every employee is currently assigned to another employee.
                </span>
              </div>
            )}
          </div>
        )}
      </section> */}

      <section className="employees-section">
        <div className="employees-header">
          <div>
            {/* <span className="section-eyebrow">Directory</span> */}
            {/* <h2>Employees</h2> */}
            <p>
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>

          <div className="employee-search-wrapper">
            <span className="search-icon">⌕</span>

            <input
              className="search-input"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>

            <h3>No employees found</h3>

            <p>
              {searchTerm
                ? "Try a different search term."
                : "Employees will appear here once they are added."}
            </p>
          </div>
        ) : (
          <div className="employees-table-wrapper">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>EMP CODE</th>
                  <th>EMP ROLE</th>
                  <th>DEPARTMENT</th>
                  <th>EMAIL</th>
                  <th>MOBILE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id}>
                    <td>
                      <strong>{employee.employeeCode || "-"}</strong>
                    </td>

                    <td>
                      {employee.role || employee.designation || "Employee"}
                    </td>

                    <td>{employee.department || "-"}</td>

                    <td>{employee.email || "-"}</td>

                    <td>{employee.mobile || "-"}</td>

                    <td>
                      <span
                        className={`status-badge ${
                          employee.status === "Active"
                            ? "active-status"
                            : employee.status === "Resigned"
                              ? "resigned-status"
                              : "inactive-status"
                        }`}
                      >
                        {employee.status || "Inactive"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="employee-view-button"
                        onClick={() => openEmployee(employee)}
                        aria-label={`View ${employee.firstName} ${employee.lastName}`}
                        title="View Profile"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="employee-view-icon"
                        >
                          <path
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="2.8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && selectedEmployee && (
        <div
          className="employee-modal-overlay"
          onClick={closeEmployeeModal}
          role="presentation"
        >
          <div
            className="employee-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-profile-title"
          >
            <button
              type="button"
              className="close-btn"
              onClick={closeEmployeeModal}
              aria-label="Close employee profile"
            >
              ×
            </button>

            <div className="profile-header">
              <div className="profile-avatar">
                {getEmployeeInitials(selectedEmployee)}
              </div>

              <div className="profile-title-row">
                <div>
                  <span className="profile-code">
                    {selectedEmployee.employeeCode}
                  </span>

                  <h2 id="employee-profile-title">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>

                  <p>{selectedEmployee.designation || "Designation not set"}</p>
                </div>

                <span
                  className={`status-badge ${
                    selectedEmployee?.status === "Active"
                      ? "active-status"
                      : selectedEmployee?.status === "Resigned"
                        ? "resigned-status"
                        : "inactive-status"
                  }`}
                >
                  {selectedEmployee.status}
                </span>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-item">
                <label>Employee Code</label>
                <span>{selectedEmployee.employeeCode || "Not available"}</span>
              </div>

              <div className="profile-item">
                <label>Email</label>
                <span>{selectedEmployee.email || "Not available"}</span>
              </div>

              <div className="profile-item">
                <label>Mobile</label>
                <span>{selectedEmployee.mobile || "Not available"}</span>
              </div>

              <div className="profile-item">
                <label>Department</label>
                <span>{selectedEmployee.department || "Not available"}</span>
              </div>

              <div className="profile-item">
                <label>Joining Date</label>
                <span>{formatDate(selectedEmployee.joiningDate)}</span>
              </div>

              <div className="profile-item">
                <label>Date of Birth</label>
                <span>{formatDate(selectedEmployee.dateOfBirth)}</span>
              </div>

              <div className="profile-item">
                <label>Employment</label>
                <span>
                  {selectedEmployee.employmentType || "Not available"}
                </span>
              </div>

              <div className="profile-item">
                <label>Role</label>
                <span>{selectedEmployee.role || "Employee"}</span>
              </div>
            </div>

            {selectedEmployee.status !== "Resigned" && (
              <div className="profile-section">
                <div className="profile-section-heading">
                  <h4>Employee Status</h4>
                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="resign-button"
                    onClick={handleResignEmployee}
                  >
                    Mark as Resigned
                  </button>
                </div>
              </div>
            )}

            <div className="profile-section">
              <div className="profile-section-heading">
                <h4>Interest Areas</h4>
              </div>

              {selectedEmployee.interestAreas?.length > 0 ? (
                <div className="interest-list">
                  {selectedEmployee.interestAreas.map((item) => (
                    <span key={item} className="tag">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted-text">No interest areas added.</p>
              )}
            </div>

            <div className="profile-section">
              <div className="profile-section-heading">
                <h4>Employee Documents</h4>
              </div>

              <div className="documents-list">
                {selectedEmployee.documents?.aadharCard && (
                  <div className="document-row">
                    <span>Aadhar Card</span>

                    <a
                      href={fileUrl(selectedEmployee.documents.aadharCard)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </div>
                )}

                {selectedEmployee.documents?.panCard && (
                  <div className="document-row">
                    <span>PAN Card</span>

                    <a
                      href={fileUrl(selectedEmployee.documents.panCard)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </div>
                )}

                {selectedEmployee.documents?.relievingLetter && (
                  <div className="document-row">
                    <span>Relieving Letter</span>

                    <a
                      href={fileUrl(selectedEmployee.documents.relievingLetter)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </div>
                )}

                {selectedEmployee.documents?.experienceLetter && (
                  <div className="document-row">
                    <span>Experience Letter</span>

                    <a
                      href={fileUrl(
                        selectedEmployee.documents.experienceLetter,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </div>
                )}

                {selectedEmployee.documents?.payslips?.length > 0 && (
                  <div className="document-group">
                    <strong>Payslips</strong>

                    {selectedEmployee.documents.payslips.map((file) => (
                      <a
                        href={fileUrl(file)}
                        target="_blank"
                        rel="noreferrer"
                        key={file}
                      >
                        {file}
                      </a>
                    ))}
                  </div>
                )}

                {selectedEmployee.documents?.qualifications?.length > 0 && (
                  <div className="document-group">
                    <strong>Qualifications</strong>

                    {selectedEmployee.documents.qualifications.map((file) => (
                      <a
                        href={fileUrl(file)}
                        target="_blank"
                        rel="noreferrer"
                        key={file}
                      >
                        {file}
                      </a>
                    ))}
                  </div>
                )}

                {selectedEmployee.documents?.certificates?.length > 0 && (
                  <div className="document-group">
                    <strong>Certificates</strong>

                    {selectedEmployee.documents.certificates.map((file) => (
                      <a
                        href={fileUrl(file)}
                        target="_blank"
                        rel="noreferrer"
                        key={file}
                      >
                        {file}
                      </a>
                    ))}
                  </div>
                )}

                {!selectedEmployee.documents?.aadharCard &&
                  !selectedEmployee.documents?.panCard &&
                  !selectedEmployee.documents?.relievingLetter &&
                  !selectedEmployee.documents?.experienceLetter &&
                  !selectedEmployee.documents?.payslips?.length &&
                  !selectedEmployee.documents?.qualifications?.length &&
                  !selectedEmployee.documents?.certificates?.length && (
                    <p className="muted-text">No documents uploaded.</p>
                  )}
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-section-heading">
                <h4>Notes</h4>
              </div>

              <div className="notes-preview">
                {selectedEmployee.notes || "No notes available."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;
