import "./EmployeeList.css";

function EmployeeList({ job, selectedEmployee, setSelectedEmployee }) {
  if (!job) {
    return (
      <div className="employee-panel">
        <div className="employee-panel-header">
          <h3>Employees</h3>
        </div>

        <div className="employee-empty">
          <div className="employee-empty-icon">👥</div>

          <strong>Select a job first</strong>

          <p>Choose a job to view its assigned employees.</p>
        </div>
      </div>
    );
  }

  const assignedEmployees = job.assignedEmployees || [];

  return (
    <div className="employee-panel">
      <div className="employee-panel-header">
        <div>
          <h3>Assigned Employees</h3>

          <span className="employee-count">
            {assignedEmployees.length}{" "}
            {assignedEmployees.length === 1 ? "employee" : "employees"}
          </span>
        </div>
      </div>

      {assignedEmployees.length === 0 ? (
        <div className="employee-empty">
          <div className="employee-empty-icon">👤</div>

          <strong>No employees assigned</strong>

          <p>This job currently has no assigned employees.</p>
        </div>
      ) : (
        <div className="employee-list">
          {assignedEmployees.map((employee) => (
            <div
              key={employee._id}
              className={`employee-item ${
                selectedEmployee?._id === employee._id ? "active-employee" : ""
              }`}
              onClick={() => setSelectedEmployee(employee)}
            >
              <div className="employee-avatar">
                {employee.firstName?.charAt(0)}
                {employee.lastName?.charAt(0)}
              </div>

              <div className="employee-details">
                <strong>
                  {employee.firstName} {employee.lastName}
                </strong>

                <p>{employee.designation || "Employee"}</p>
              </div>

              {selectedEmployee?._id === employee._id && (
                <span className="employee-selected">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeList;
