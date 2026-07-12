import { useEffect, useState } from "react";
import api from "../services/api";
import CommonCard from "./CommonCard";

import JobDiscussion from "./JobDiscussion";

import "./MessageCenter.css";

function MessageCenter() {
  const [jobs, setJobs] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);
  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs");
      setJobs(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CommonCard title="Messages">
      {/* LEFT PANEL */}
      <div className="jobs-panel">
        <h3>Jobs</h3>

        {jobs.map((job) => (
          <div
            key={job._id}
            className={`job-item ${
              selectedJob?._id === job._id ? "active-job" : ""
            }`}
            onClick={() => {
              setSelectedJob(job);
            }}
          >
            <strong>{job.jobName}</strong>

            <p>{job.projectName}</p>
          </div>
        ))}
      </div>

      {/* MIDDLE PANEL */}

      <JobDiscussion job={selectedJob} />
    </CommonCard>
  );
}

export default MessageCenter;
