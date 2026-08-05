import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";

import api from "../services/api";

import "./Configuration.css";

function Configurations() {
  const [activeTab, setActiveTab] = useState("Roles");

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);

  const [roleForm, setRoleForm] = useState({
    name: "",
    level: "",
    description: "",
  });

  const [savingRole, setSavingRole] = useState(false);

  const tabs = ["Roles", "Role Permissions", "Employee Roles"];

  useEffect(() => {
    if (activeTab === "Roles") {
      fetchRoles();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);

      const response = await api.get("/roles");

      setRoles(response.data || []);
    } catch (error) {
      console.log("Roles error:", error);
    } finally {
      setLoadingRoles(false);
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

      setRoleForm({
        name: "",
        level: "",
        description: "",
      });

      setShowRoleModal(false);
    } catch (error) {
      console.log("Add role error:", error);
      alert(error.response?.data?.message || "Failed to add role.");
    } finally {
      setSavingRole(false);
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
                onClick={() => setShowRoleModal(true)}
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
          <div>
            <h2>Role Permissions</h2>

            <p>Configure page-wise permissions for each role.</p>
          </div>
        )}

        {activeTab === "Employee Roles" && (
          <div>
            <h2>Employee Roles</h2>

            <p>
              Assign multiple roles to employees and manage their active role.
            </p>
          </div>
        )}
      </div>
      {showRoleModal && (
        <div className="configuration-modal-overlay">
          <div className="configuration-modal">
            <div className="configuration-modal-header">
              <div>
                <h2>Add Role</h2>
                <p>Create a new organisation role.</p>
              </div>

              <button
                type="button"
                className="configuration-modal-close"
                onClick={() => setShowRoleModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddRole}>
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

                <input
                  type="number"
                  name="level"
                  value={roleForm.level}
                  onChange={handleRoleChange}
                  placeholder="Enter level"
                  min="1"
                  required
                />
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
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="configuration-save-button"
                  disabled={savingRole}
                >
                  {savingRole ? "Saving..." : "Save Role"}
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
