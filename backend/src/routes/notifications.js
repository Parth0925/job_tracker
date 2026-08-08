const router = require("express").Router();

const Notification = require("../../models/Notification");

// GET NOTIFICATIONS FOR EMPLOYEE
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.params.employeeId,
    })
      .populate("sender", "employeeCode firstName lastName designation")
      .populate("jobId", "jobName projectName clientName")
      .populate("messageId", "message createdAt")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.log("Get notifications error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// GET UNREAD NOTIFICATIONS FOR EMPLOYEE
router.get("/employee/:employeeId/unread", async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.params.employeeId,
      isRead: false,
    })
      .populate("sender", "employeeCode firstName lastName designation")
      .populate("jobId", "jobName projectName clientName")
      .populate("messageId", "message createdAt")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.log("Get unread notifications error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// MARK NOTIFICATION AS READ
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
      },
      {
        new: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found.",
      });
    }

    res.json(notification);
  } catch (error) {
    console.log("Mark notification read error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// MARK ALL NOTIFICATIONS AS READ
router.patch("/employee/:employeeId/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.params.employeeId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.json({
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.log("Mark all notifications read error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
