import { useEffect, useState } from "react";
import api from "../services/api";
import "./EmployeeManagement.css";

function Organisation() {
  const [employees, setEmployees] = useState([]);
  const [draggedEmployee, setDraggedEmployee] = useState(null);
  const [hierarchyError, setHierarchyError] = useState("");
  const [hierarchySaving, setHierarchySaving] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data || []);
    } catch (error) {
      console.log("Fetch employees error:", error);
    }
  };

  const getEmployeeInitials = (employee) => {
    const first = employee?.firstName?.charAt(0) || "";
    const last = employee?.lastName?.charAt(0) || "";

    return `${first}${last}`.toUpperCase() || "?";
  };

  const getEmployeeById = (id) => {
    if (!id) return null;

    return employees.find((employee) => String(employee._id) === String(id));
  };

  const getDirectReports = (managerId) => {
    return employees.filter((employee) => {
      const reportsToId = getReportsToId(employee);

      return reportsToId && String(reportsToId) === String(managerId);
    });
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

  return (
    <section className="organisation-section">
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
    </section>
  );
}

export default Organisation;
