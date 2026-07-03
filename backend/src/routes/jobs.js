const router = require("express").Router();
const Job = require("../../models/Job");
const ActiveTimer = require("../../models/ActiveTimer");

// GET all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find();

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE new job
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;

    const job = await Job.create({
      title,

      description,

      status: "open",

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
            jobTitle: job.title,
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

module.exports = router;
