import "./EmployeeList.css";

function EmployeeList({ job, selectedEmployee, setSelectedEmployee }) {
  if (!job) {
    return (
      <div className="employee-panel">
        <h3>Employees</h3>

        <p>Select a job first.</p>
      </div>
    );
  }

  return (
    <div className="employee-panel">
      <h3>Assigned Employees</h3>

      {job.assignedEmployees?.length === 0 && <p>No employees assigned.</p>}

      {job.assignedEmployees?.map((employee) => (
        <div
          key={employee._id}
          className={`employee-item ${
            selectedEmployee?._id === employee._id ? "active-employee" : ""
          }`}
          onClick={() => setSelectedEmployee(employee)}
        >
          <strong>
            {employee.firstName} {employee.lastName}
          </strong>

          <p>{employee.designation}</p>
        </div>
      ))}
    </div>
  );
}

export default EmployeeList;
