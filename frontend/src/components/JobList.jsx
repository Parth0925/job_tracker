import { useEffect, useState } from "react";
import api from "../services/api";
import "./JobList.css";

function JobList() {
  const [jobs, setJobs] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs");
      setJobs(response.data);
    } catch (error) {
      console.log("Jobs error:", error);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) return;

    try {
      setLoading(true);

      await api.post("/jobs", {
        title,
        description,
      });

      setTitle("");
      setDescription("");

      fetchJobs();
    } catch (error) {
      console.log("Create job error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-list">
      <h2 className="section-title">Create New Job</h2>

      <form className="job-form" onSubmit={handleCreateJob}>
        <input
          type="text"
          placeholder="Job title"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Job description"
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="button" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>

      <h2 className="section-title">All Jobs</h2>

      <div className="jobs-grid">
        {jobs.map((job) => (
          <div key={job._id} className="job-card">
            <h3 className="job-title">{job.title}</h3>

            <p className="job-desc">{job.description}</p>

            <p className="job-info">
              <strong>Status:</strong> {job.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobList;
