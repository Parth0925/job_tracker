const router = require("express").Router();
const Job = require("../../models/Job");

// GET ALL WORK LOGS FOR ADMIN

// GET ALL WORK LOGS

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate(
        "timeLogs.employeeId",
        "employeeCode firstName lastName designation",
      )
      .select("jobName clientName projectName timeLogs");

    const workLogs = [];

    jobs.forEach((job) => {
      job.timeLogs.forEach((log) => {
        workLogs.push({
          jobId: job._id,

          jobName: job.jobName,

          clientName: job.clientName,

          projectName: job.projectName,

          employeeId: log.employeeId?._id,

          employeeCode: log.employeeId?.employeeCode,

          employeeName: log.employeeId
            ? `${log.employeeId.firstName} ${log.employeeId.lastName}`
            : "Unknown",

          designation: log.employeeId?.designation || "",

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
      .populate(
        "timeLogs.employeeId",
        "employeeCode firstName lastName designation",
      )
      .select("jobName clientName projectName timeLogs");

    const employeeLogs = [];

    jobs.forEach((job) => {
      job.timeLogs.forEach((log) => {
        if (
          log.employeeId &&
          log.employeeId._id.toString() === req.params.employeeId
        ) {
          employeeLogs.push({
            jobId: job._id,

            jobName: job.jobName,

            clientName: job.clientName,

            projectName: job.projectName,

            employeeId: log.employeeId._id,

            employeeCode: log.employeeId.employeeCode,

            employeeName: `${log.employeeId.firstName} ${log.employeeId.lastName}`,

            designation: log.employeeId.designation,

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

// EMPLOYEE TIMESHEET REPORT
router.get("/report", async (req, res) => {
  try {
    const { employeeId, from, to } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        message: "employeeId is required",
      });
    }

    const jobs = await Job.find()
      .populate(
        "timeLogs.employeeId",
        "employeeCode firstName lastName designation",
      )
      .select("jobName clientName projectName timeLogs");

    let report = [];

    let totalHours = 0;

    jobs.forEach((job) => {
      job.timeLogs.forEach((log) => {
        if (!log.employeeId) return;

        if (log.employeeId._id.toString() !== employeeId) return;

        if (from && new Date(log.startTime) < new Date(from)) return;

        if (to) {
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);

          if (new Date(log.startTime) > toDate) return;
        }

        totalHours += log.hours;

        report.push({
          jobId: job._id,

          jobName: job.jobName,

          clientName: job.clientName,

          projectName: job.projectName,

          employeeCode: log.employeeId.employeeCode,

          employeeName: `${log.employeeId.firstName} ${log.employeeId.lastName}`,

          designation: log.employeeId.designation,

          startTime: log.startTime,

          endTime: log.endTime,

          hours: log.hours,

          notes: log.notes,

          type: log.type,
        });
      });
    });

    report.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.json({
      totalEntries: report.length,
      totalHours: Number(totalHours.toFixed(2)),
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// JOB REPORT

router.get("/job-report", async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        message: "jobId is required",
      });
    }

    const job = await Job.findById(jobId).populate(
      "timeLogs.employeeId",
      "employeeCode firstName lastName designation",
    );

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const employeeSummary = {};

    let totalHours = 0;

    job.timeLogs.forEach((log) => {
      if (!log.employeeId) return;

      const id = log.employeeId._id.toString();

      if (!employeeSummary[id]) {
        employeeSummary[id] = {
          employeeId: id,
          employeeCode: log.employeeId.employeeCode,
          employeeName: `${log.employeeId.firstName} ${log.employeeId.lastName}`,
          designation: log.employeeId.designation,
          hours: 0,
        };
      }

      employeeSummary[id].hours += log.hours;
      totalHours += log.hours;
    });

    res.json({
      jobName: job.jobName,
      clientName: job.clientName,
      projectName: job.projectName,
      budgetedHours: job.budgetedHours,
      totalHours: Number(totalHours.toFixed(2)),
      employees: Object.values(employeeSummary),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
