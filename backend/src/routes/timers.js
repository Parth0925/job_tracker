const router = require("express").Router();
const ActiveTimer = require("../../models/ActiveTimer");

// GET all active timers
router.get("/", async (req, res) => {
  try {
    const timers = await ActiveTimer.find()
      .populate("employeeId")
      .populate("jobId");

    res.json(timers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
