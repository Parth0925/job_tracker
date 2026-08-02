const Job = require("../models/Job");

async function createDefaultJobs() {
  const jobs = ["Admin", "Training", "No Work", "Break"];

  for (const name of jobs) {
    const exists = await Job.findOne({
      jobName: name,
      jobType: "Non Billable",
    });

    if (!exists) {
      await Job.create({
        clientName: "Internal",

        projectName: "Internal",

        jobName: name,

        description: `${name} activity`,

        jobType: "Non Billable",

        budgetedHours: 0,

        assignments: [],

        assignmentDate: new Date(),

        priority: "Low",

        status: "Not Started",

        checklistPrepared: false,

        communicationLog: "",

        repeatJob: false,

        timeLogs: [],
      });
    }
  }
}

module.exports = createDefaultJobs;
