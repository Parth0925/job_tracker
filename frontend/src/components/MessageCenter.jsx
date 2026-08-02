import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import CommonCard from "./CommonCard";
import JobDiscussion from "./JobDiscussion";
import "./MessageCenter.css";

function MessageCenter() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const response = await api.get("/jobs");

      setJobs(response.data);

      if (selectedJob) {
        const updatedSelectedJob = response.data.find(
          (job) => job._id === selectedJob._id,
        );

        if (updatedSelectedJob) {
          setSelectedJob(updatedSelectedJob);
        }
      }
    } catch (error) {
      console.log("Messages jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return jobs;
    }

    return jobs.filter((job) => {
      return (
        job.jobName?.toLowerCase().includes(searchValue) ||
        job.clientName?.toLowerCase().includes(searchValue) ||
        job.projectName?.toLowerCase().includes(searchValue) ||
        job.status?.toLowerCase().includes(searchValue)
      );
    });
  }, [jobs, search]);

  const getStatusClass = (status) => {
    return (
      status
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || "not-started"
    );
  };

  return (
    <CommonCard title="Messages">
      {" "}
      <div className="message-center">
        {/* =========================
LEFT JOB SIDEBAR
========================= */}

        <aside className="jobs-panel">
          <div className="jobs-panel-header">
            <div className="jobs-panel-title">
              <div>
                <h3>Job Discussions</h3>

                <span>
                  {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
                </span>
              </div>

              <button
                type="button"
                className={`refresh-jobs-button ${loading ? "refreshing" : ""}`}
                onClick={fetchJobs}
                title="Refresh jobs"
                disabled={loading}
              >
                ↻
              </button>
            </div>

            <div className="jobs-search">
              <span className="jobs-search-icon">⌕</span>

              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  className="clear-search-button"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="jobs-panel-list">
            {loading && jobs.length === 0 ? (
              <div className="jobs-loading">
                <div className="loading-spinner"></div>

                <p>Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="jobs-empty">
                <div className="jobs-empty-icon">⌕</div>

                <h4>No jobs found</h4>

                <p>
                  {search
                    ? "Try a different search."
                    : "There are no jobs available."}
                </p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?._id === job._id;

                return (
                  <button
                    type="button"
                    key={job._id}
                    className={`job-item ${isSelected ? "active-job" : ""}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="job-item-top">
                      <div className="job-item-icon">
                        {job.jobName?.charAt(0)?.toUpperCase() || "J"}
                      </div>

                      <div className="job-item-heading">
                        <strong>{job.jobName}</strong>

                        <span
                          className={`job-status-badge ${getStatusClass(
                            job.status,
                          )}`}
                        >
                          {job.status || "Not Started"}
                        </span>
                      </div>
                    </div>

                    <div className="job-item-details">
                      <p>
                        <span>Client</span>
                        {job.clientName || "—"}
                      </p>

                      <p>
                        <span>Project</span>
                        {job.projectName || "—"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* =========================
        RIGHT DISCUSSION PANEL
    ========================= */}

        <section className="message-discussion-panel">
          <JobDiscussion job={selectedJob} />
        </section>
      </div>
    </CommonCard>
  );
}

export default MessageCenter;
