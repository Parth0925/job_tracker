import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { PAGE_PERMISSIONS } from "../../../backend/src/constants/pages";

import api from "../services/api";

import "./Configuration.css";

function Configurations() {
  const [activeTab, setActiveTab] = useState("Roles");

  const [roles, setRoles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedPermissionRole, setSelectedPermissionRole] = useState("");
  const [pagePermissions, setPagePermissions] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);

  const [roleForm, setRoleForm] = useState({
    name: "",
    level: "",
    description: "",
  });

  const [savingRole, setSavingRole] = useState(false);

  const [editingRole, setEditingRole] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);

  const tabs = ["Roles", "Role Permissions", "Employee Roles"];

  useEffect(() => {
    if (activeTab === "Roles") {
      fetchRoles();
    }

    if (activeTab === "Role Permissions") {
      fetchRoles();
    }

    if (activeTab === "Employee Roles") {
      fetchRoles();
      fetchEmployees();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Role Permissions" && selectedPermissionRole) {
      fetchRolePermissions(selectedPermissionRole);
    }
  }, [activeTab, selectedPermissionRole]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);

      const response = await api.get("/roles");

      setRoles(response.data || []);

      if (response.data?.length && !selectedPermissionRole) {
        setSelectedPermissionRole(response.data[0]._id);
      }
    } catch (error) {
      console.log("Roles error:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}/permissions`);

      setPagePermissions(response.data.pagePermissions || []);
    } catch (error) {
      console.log("Permission fetch error:", error);

      setPagePermissions([]);
    }
  };

  const togglePagePermission = (page) => {
    if (pagePermissions.includes(page)) {
      setPagePermissions((prev) => prev.filter((item) => item !== page));
    } else {
      setPagePermissions((prev) => [...prev, page]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/employees");
      setEmployees(response.data || []);
    } catch (error) {
      console.log("Employees error:", error);
    }
  };

  const handleRoleChange = (e) => {
    const { name, value } = e.target;

    setRoleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRole = async (e) => {
    e.preventDefault();

    const parsedLevel = parseInt(roleForm.level, 10);
    if (isNaN(parsedLevel)) {
      alert("Please enter a valid number for level.");
      return;
    }

    try {
      setSavingRole(true);

      const response = await api.post("/roles", {
        name: roleForm.name.trim(),
        level: parsedLevel,
        description: roleForm.description,
      });

      // Update state directly or fetch fresh roles
      setRoles((prevRoles) =>
        [...prevRoles, response.data].sort((a, b) => a.level - b.level),
      );

      closeRoleModal();
    } catch (error) {
      console.log("Add role error:", error);
      alert(error.response?.data?.message || "Failed to add role.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();

    const parsedLevel = parseInt(roleForm.level, 10);

    if (isNaN(parsedLevel)) {
      alert("Please select a valid level.");
      return;
    }

    try {
      setSavingRole(true);

      const response = await api.put(`/roles/${editingRole._id}`, {
        name: roleForm.name.trim(),
        level: parsedLevel,
        description: roleForm.description,
      });

      setRoles((prev) =>
        prev
          .map((role) => (role._id === editingRole._id ? response.data : role))
          .sort((a, b) => a.level - b.level),
      );

      closeRoleModal();
    } catch (error) {
      console.log("Update role error:", error);

      alert(error.response?.data?.message || "Failed to update role.");
    } finally {
      setSavingRole(false);
    }
  };

  const handleEditClick = (role) => {
    setEditingRole(role);

    setIsEditMode(true);

    setRoleForm({
      name: role.name,
      level: String(role.level),
      description: role.description || "",
    });

    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setShowRoleModal(false);

    setIsEditMode(false);

    setEditingRole(null);

    setRoleForm({
      name: "",
      level: "",
      description: "",
    });
  };

  const handleEmployeeRolesChange = async (employeeId, roleIds) => {
    try {
      const response = await api.patch(`/employees/${employeeId}/roles`, {
        roles: roleIds,
      });

      setEmployees((prev) =>
        prev.map((employee) =>
          employee._id === employeeId ? response.data : employee,
        ),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update roles.");
    }
  };

  return (
    <div className="configurations-page">
      <div className="configurations-header">
        <div>
          <h1>Configurations</h1>

          <p>Manage roles, permissions, and employee access.</p>
        </div>
      </div>

      <div className="configurations-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`configuration-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="configurations-content">
        {activeTab === "Roles" && (
          <section className="configuration-section">
            <div className="configuration-section-header">
              <div>
                <h2>Roles</h2>

                <p>Manage the roles available in the organisation.</p>
              </div>

              <button
                type="button"
                className="configuration-action-button"
                onClick={() => {
                  setIsEditMode(false);

                  setEditingRole(null);

                  setRoleForm({
                    name: "",
                    level: "",
                    description: "",
                  });

                  setShowRoleModal(true);
                }}
              >
                <Plus size={17} />
                Add Role
              </button>
            </div>

            {loadingRoles ? (
              <div className="configuration-loading">Loading roles...</div>
            ) : roles.length === 0 ? (
              <div className="configuration-empty">
                <h3>No roles found</h3>

                <p>Roles will appear here once they are configured.</p>
              </div>
            ) : (
              <div className="roles-table-wrapper">
                <table className="roles-table">
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Role</th>
                      <th>Description</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {roles.map((role) => (
                      <tr key={role._id}>
                        <td>
                          <span className="role-level">{role.level}</span>
                        </td>

                        <td>
                          <strong>{role.name}</strong>
                        </td>

                        <td>{role.description || "No description"}</td>

                        <td>
                          <button
                            type="button"
                            className="role-edit-button"
                            title={`Edit ${role.name}`}
                            onClick={() => handleEditClick(role)}
                          >
                            <Pencil size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "Role Permissions" && (
          <section className="configuration-section">
            <div className="configuration-section-header">
              <div>
                <h2>Role Permissions</h2>
                <p>Configure page view permissions for each role.</p>
              </div>

              <button
                type="button"
                className="configuration-action-button"
                disabled={!selectedPermissionRole}
                onClick={async () => {
                  try {
                    await api.put(
                      `/roles/${selectedPermissionRole}/permissions`,
                      {
                        pagePermissions,
                      },
                    );

                    alert("Permissions updated successfully.");
                  } catch (error) {
                    alert(
                      error.response?.data?.message ||
                        "Failed to update permissions.",
                    );
                  }
                }}
              >
                Save Permissions
              </button>
            </div>

            {loadingRoles ? (
              <div className="configuration-loading">Loading roles...</div>
            ) : (
              <>
                <div className="configuration-form-group">
                  <label>Select Role</label>

                  <select
                    value={selectedPermissionRole}
                    onChange={(e) => setSelectedPermissionRole(e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="permission-list">
                  {PAGE_PERMISSIONS.map((page) => (
                    <label key={page} className="permission-item">
                      <span>{page}</span>

                      <input
                        type="checkbox"
                        checked={pagePermissions.includes(page)}
                        onChange={() => togglePagePermission(page)}
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === "Employee Roles" && (
          <section className="configuration-section">
            <div className="configuration-section-header">
              <div>
                <h2>Employee Roles</h2>

                <p>Assign or remove roles from employees.</p>
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="configuration-empty">
                <h3>No employees found</h3>

                <p>Create employees first.</p>
              </div>
            ) : (
              <div className="roles-table-wrapper">
                <table className="roles-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Assigned Roles</th>
                    </tr>
                  </thead>

                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee._id}>
                        <td>
                          <strong>
                            {employee.firstName} {employee.lastName}
                          </strong>

                          <br />

                          <small>{employee.employeeCode}</small>
                        </td>

                        <td>
                          <div className="employee-role-list">
                            {roles.map((role) => {
                              const checked = employee.roles.some(
                                (assignedRole) => assignedRole._id === role._id,
                              );

                              return (
                                <label
                                  key={role._id}
                                  className="employee-role-checkbox"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      let updatedRoles;

                                      if (e.target.checked) {
                                        updatedRoles = [
                                          ...employee.roles.map((r) => r._id),
                                          role._id,
                                        ];
                                      } else {
                                        updatedRoles = employee.roles
                                          .map((r) => r._id)
                                          .filter((id) => id !== role._id);
                                      }

                                      handleEmployeeRolesChange(
                                        employee._id,
                                        updatedRoles,
                                      );
                                    }}
                                  />
                                  {role.name}x
                                </label>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
      {showRoleModal && (
        <div className="configuration-modal-overlay">
          <div className="configuration-modal">
            <div className="configuration-modal-header">
              <div>
                <h2>{isEditMode ? "Edit Role" : "Add Role"}</h2>

                <p>
                  {isEditMode
                    ? "Update the organisation role."
                    : "Create a new organisation role."}
                </p>
              </div>

              <button
                type="button"
                className="configuration-modal-close"
                onClick={closeRoleModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={isEditMode ? handleUpdateRole : handleAddRole}>
              <div className="configuration-form-group">
                <label>Role Name</label>

                <input
                  type="text"
                  name="name"
                  value={roleForm.name}
                  onChange={handleRoleChange}
                  placeholder="Enter role name"
                  required
                />
              </div>

              <div className="configuration-form-group">
                <label>Level</label>

                <select
                  name="level"
                  value={roleForm.level}
                  onChange={handleRoleChange}
                  required
                >
                  <option value="">Select Level</option>

                  {Array.from({ length: 20 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Level {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="configuration-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={roleForm.description}
                  onChange={handleRoleChange}
                  placeholder="Enter role description"
                  rows="4"
                />
              </div>

              <div className="configuration-modal-actions">
                <button
                  type="button"
                  className="configuration-cancel-button"
                  onClick={closeRoleModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="configuration-save-button"
                  disabled={savingRole}
                >
                  {savingRole
                    ? "Saving..."
                    : isEditMode
                      ? "Update Role"
                      : "Save Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Configurations;
