const router = require("express").Router();
const Job = require("../../models/Job");
const ActiveTimer = require("../../models/ActiveTimer");
// const PriorityRule = require("../../models/PriorityRule");

const { getPriorityFromDueDate } = require("../../utils/priority");

// GET all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate(
      "assignments.employeeId",
      "employeeCode firstName lastName designation",
    );

    const jobsWithSummary = jobs.map((job) => ({
      ...job.toObject(),

      budgetSummary: job.getBudgetSummary(),
    }));

    res.json(jobsWithSummary);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET JOBS FOR SPECIFIC EMPLOYEE
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const jobs = await Job.find({
      "assignments.employeeId": req.params.employeeId,
    }).populate(
      "assignments.employeeId",
      "employeeCode firstName lastName designation",
    );

    const jobsWithSummary = jobs.map((job) => ({
      ...job.toObject(),
      budgetSummary: job.getBudgetSummary(),
    }));

    res.json(jobsWithSummary);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE new job
router.post("/", async (req, res) => {
  try {
    const assignments = req.body.assignments || [];

    const calculatedPriority = await getPriorityFromDueDate(
      req.body.nextDueDate,
    );

    const totalAllocatedHours = assignments.reduce(
      (sum, emp) => sum + Number(emp.allocatedHours || 0),
      0,
    );

    if (totalAllocatedHours !== Number(req.body.budgetedHours)) {
      return res.status(400).json({
        message: "Allocated hours must be equal to Budgeted Hours.",
      });
    }
    const job = await Job.create({
      clientName: req.body.clientName,
      projectName: req.body.projectName,
      jobName: req.body.jobName,

      description: req.body.description,

      budgetedHours: Number(req.body.budgetedHours),

      jobType: req.body.jobType,

      repeatJob: req.body.repeatJob,

      repeatFrequency: req.body.repeatFrequency,

      nextDueDate: req.body.nextDueDate,

      // assignedEmployees: req.body.assignedEmployees || [],

      assignments: assignments.map((assignment) => ({
        employeeId: assignment.employeeId,
        role: assignment.role,
        allocatedHours: Number(assignment.allocatedHours),
        spentHours: 0,
        remainingHours: Number(assignment.allocatedHours),
        budgetStatus: "Within Budget",
      })),

      assignmentDate: req.body.assignmentDate,

      completionDate: req.body.completionDate,

      communicationLog: req.body.communicationLog,

      checklistPrepared: req.body.checklistPrepared,

      priority: calculatedPriority,

      status: req.body.status,

      timeLogs: [],
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// START TIMER
router.post("/:id/start", async (req, res) => {
  try {
    const { employeeId } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const assignment = job.assignments.find(
      (a) => a.employeeId.toString() === employeeId,
    );

    if (!assignment) {
      return res.status(403).json({
        message: "You are not assigned to this job.",
      });
    }

    if (assignment.remainingHours <= 0) {
      return res.status(400).json({
        message: "Allocated hours exhausted.",
      });
    }

    const existingTimer = await ActiveTimer.findOne({
      employeeId,
      jobId: req.params.id,
    });

    if (existingTimer) {
      return res.status(400).json({
        message: "Timer already running",
      });
    }

    const timer = await ActiveTimer.create({
      employeeId,
      jobId: req.params.id,
      startedAt: new Date(),
    });

    if (job.status === "Not Started") {
      job.status = "In Review";
      await job.save();
    }

    res.status(201).json(timer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// STOP TIMER
router.post("/:id/stop", async (req, res) => {
  try {
    const { employeeId, notes } = req.body;

    const activeTimer = await ActiveTimer.findOne({
      employeeId,
      jobId: req.params.id,
    });

    if (!activeTimer) {
      return res.status(404).json({
        message: "No active timer found",
      });
    }

    const endTime = new Date();

    const startTime = activeTimer.startedAt;

    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const timeEntry = {
      employeeId,

      startTime,

      endTime,

      hours: Number(durationHours.toFixed(2)),

      type: "timer",

      notes: notes || "",

      createdAt: new Date(),
    };

    job.timeLogs.push(timeEntry);

    const assignment = job.assignments.find(
      (a) => a.employeeId.toString() === employeeId,
    );

    if (assignment) {
      assignment.spentHours = Number(
        (assignment.spentHours + durationHours).toFixed(2),
      );

      assignment.remainingHours = Number(
        (assignment.allocatedHours - assignment.spentHours).toFixed(2),
      );

      if (assignment.spentHours > assignment.allocatedHours) {
        assignment.budgetStatus = "Over Budget";
      } else if (assignment.spentHours === assignment.allocatedHours) {
        assignment.budgetStatus = "On Budget";
      } else {
        assignment.budgetStatus = "Within Budget";
      }
    }

    await job.save();

    await ActiveTimer.findByIdAndDelete(activeTimer._id);

    res.json(timeEntry);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// ADD TIME LOG
router.post("/:id/time", async (req, res) => {
  try {
    const { employeeId, startTime, endTime, notes } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const start = new Date(startTime);

    const end = new Date(endTime);

    const durationHours = (end - start) / (1000 * 60 * 60);

    if (isNaN(durationHours) || durationHours < 0) {
      return res.status(400).json({
        message: "Invalid time range",
      });
    }

    const timeEntry = {
      employeeId,

      startTime: start,

      endTime: end,

      hours: Number(durationHours.toFixed(2)),

      type: "timer",

      notes: notes || "",

      createdAt: new Date(),
    };

    job.timeLogs.push(timeEntry);

    const assignment = job.assignments.find(
      (a) => a.employeeId.toString() === employeeId,
    );

    if (assignment) {
      assignment.spentHours = Number(
        (assignment.spentHours + durationHours).toFixed(2),
      );

      assignment.remainingHours = Number(
        (assignment.allocatedHours - assignment.spentHours).toFixed(2),
      );

      if (assignment.spentHours > assignment.allocatedHours) {
        assignment.budgetStatus = "Over Budget";
      } else if (assignment.spentHours === assignment.allocatedHours) {
        assignment.budgetStatus = "On Budget";
      } else {
        assignment.budgetStatus = "Within Budget";
      }
    }

    await job.save();

    res.status(201).json(timeEntry);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET ACTIVE TIMER FOR EMPLOYEE + JOB
router.get("/:id/timer/:employeeId", async (req, res) => {
  try {
    const timer = await ActiveTimer.findOne({
      jobId: req.params.id,
      employeeId: req.params.employeeId,
    });

    res.json(timer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// PAUSE TIMER
router.post("/:id/pause", async (req, res) => {
  try {
    const { employeeId } = req.body;

    const timer = await ActiveTimer.findOne({
      jobId: req.params.id,
      employeeId,
    });

    if (!timer) {
      return res.status(404).json({
        message: "Timer not found",
      });
    }

    timer.pausedAt = new Date();
    timer.isPaused = true;

    await timer.save();

    res.json(timer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// RESUME TIMER
router.post("/:id/resume", async (req, res) => {
  try {
    const { employeeId } = req.body;

    const timer = await ActiveTimer.findOne({
      jobId: req.params.id,
      employeeId,
    });

    if (!timer) {
      return res.status(404).json({
        message: "Timer not found",
      });
    }

    timer.isPaused = false;
    timer.pausedAt = null;

    await timer.save();

    res.json(timer);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET EMPLOYEE WORK HISTORY
router.get("/history/:employeeId", async (req, res) => {
  try {
    const jobs = await Job.find({
      "timeLogs.employeeId": req.params.employeeId,
    });

    let history = [];

    jobs.forEach((job) => {
      job.timeLogs.forEach((log) => {
        if (log.employeeId.toString() === req.params.employeeId) {
          history.push({
            jobTitle: job.jobName,
            startTime: log.startTime,
            endTime: log.endTime,
            hours: log.hours,
            notes: log.notes,
          });
        }
      });
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE JOB STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (status === "Completed" && !job.checklistPrepared) {
      return res.status(400).json({
        message: "Job cannot be completed until the checklist is prepared.",
      });
    }

    job.status = status;

    // Create next recurring job automatically
    if (status === "Completed" && job.repeatJob) {
      let nextDate = new Date(job.nextDueDate || new Date());

      if (job.repeatFrequency === "Weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
      }

      if (job.repeatFrequency === "Monthly") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }

      if (job.repeatFrequency === "Yearly") {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      const calculatedPriority = await getPriorityFromDueDate(nextDate);

      await Job.create({
        clientName: job.clientName,

        projectName: job.projectName,

        jobName: job.jobName,

        description: job.description,

        budgetedHours: job.budgetedHours,

        jobType: job.jobType,

        repeatJob: true,

        repeatFrequency: job.repeatFrequency,

        nextDueDate: nextDate,

        assignments: job.assignments.map((a) => ({
          employeeId: a.employeeId,

          role: a.role,

          allocatedHours: a.allocatedHours,

          spentHours: 0,

          remainingHours: a.allocatedHours,

          budgetStatus: "Within Budget",
        })),

        assignmentDate: new Date(),

        completionDate: null,

        communicationLog: job.communicationLog,

        checklistPrepared: job.checklistPrepared,

        priority: calculatedPriority,

        status: "Not Started",

        submittedForReview: false,

        reviewStatus: "Pending",

        timeLogs: [],
      });
    }

    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// SUBMIT JOB FOR REVIEW
router.post("/:id/submit-review", async (req, res) => {
  try {
    const { employeeId } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const assignment = job.assignments.find(
      (a) => a.employeeId.toString() === employeeId,
    );

    if (!assignment) {
      return res.status(403).json({
        message: "You are not assigned to this job.",
      });
    }

    if (assignment.role !== "Preparer") {
      return res.status(403).json({
        message: "Only the Preparer can submit the job for review.",
      });
    }

    if (job.submittedForReview && job.reviewStatus !== "Rejected") {
      return res.status(400).json({
        message: "Job has already been submitted for review.",
      });
    }

    job.submittedForReview = true;
    job.reviewStatus = "Pending";
    job.status = "In Review";

    await job.save();

    res.json({
      message: "Job submitted for review successfully.",
      job,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// REVIEW JOB
router.post("/:id/review", async (req, res) => {
  try {
    const { action, comments } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    if (!job.submittedForReview) {
      return res.status(400).json({
        message: "Job has not been submitted for review.",
      });
    }

    if (action === "approve") {
      job.reviewStatus = "Approved";
      job.status = "Completed";
    } else {
      job.reviewStatus = "Rejected";
      job.status = "Rejected";
    }

    job.reviewComments = comments || "";

    job.reviewedAt = new Date();

    await job.save();

    res.json(job);
  } catch (error) {
    console.error("REVIEW ERROR:", error);

    res.status(500).json({
      message: error.message,
      error: error.toString(),
    });
  }
});

module.exports = router;
