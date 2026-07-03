const router = require("express").Router();
const Job = require("../../models/Job");

// GET ALL WORK LOGS FOR ADMIN

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("timeLogs.employeeId")
      .select("title timeLogs");

    const workLogs = [];

    jobs.forEach((job) => {
      job.timeLogs.forEach((log) => {
        workLogs.push({
          jobId: job._id,

          jobTitle: job.title,

          employee: log.employeeId ? log.employeeId.name : "Unknown",

          employeeId: log.employeeId ? log.employeeId._id : null,

          startTime: log.startTime,

          endTime: log.endTime,

          hours: log.hours,

          type: log.type,

          notes: log.notes,

          createdAt: log.createdAt,
        });
      });
    });

    res.json(workLogs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET WORK LOGS BY EMPLOYEE

router.get("/employee/:employeeId", async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("timeLogs.employeeId")
      .select("title timeLogs");

    const employeeLogs = [];

    jobs.forEach((job) => {
      job.timeLogs.forEach((log) => {
        if (
          log.employeeId &&
          log.employeeId._id.toString() === req.params.employeeId
        ) {
          employeeLogs.push({
            jobTitle: job.title,

            startTime: log.startTime,

            endTime: log.endTime,

            hours: log.hours,

            type: log.type,

            notes: log.notes,

            createdAt: log.createdAt,
          });
        }
      });
    });

    res.json(employeeLogs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
