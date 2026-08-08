const router = require("express").Router();

const Message = require("../../models/Message");
const Employee = require("../../models/Employee");
const Role = require("../../models/Role");
const Notification = require("../../models/Notification");

//
// SEND MESSAGE
//
router.post("/", async (req, res) => {
  try {
    const { jobId, sender, receivers, message } = req.body;

    if (!jobId || !sender || !message?.trim()) {
      return res.status(400).json({
        message: "Job, sender and message are required.",
      });
    }

    if (!Array.isArray(receivers) || receivers.length === 0) {
      return res.status(400).json({
        message: "At least one receiver is required.",
      });
    }

    const uniqueReceivers = [
      ...new Set(receivers.map((receiver) => String(receiver))),
    ].filter((receiver) => receiver !== String(sender));

    if (uniqueReceivers.length === 0) {
      return res.status(400).json({
        message: "At least one valid receiver is required.",
      });
    }

    const newMessage = await Message.create({
      jobId,
      sender,
      receivers: uniqueReceivers,
      message: message.trim(),
    });

    //
    // FIND ALL EMPLOYEES WHOSE ROLE HAS
    // "View/Receive All Messages" PERMISSION
    //
    const receiveAllRoles = await Role.find({
      receiveAllMessages: true,
    }).select("_id");

    const receiveAllRoleIds = receiveAllRoles.map((role) => role._id);

    let receiveAllEmployees = [];

    if (receiveAllRoleIds.length > 0) {
      receiveAllEmployees = await Employee.find({
        _id: {
          $ne: sender,
        },
        roles: {
          $in: receiveAllRoleIds,
        },
      }).select("_id");
    }

    //
    // COMBINE SELECTED RECEIVERS + RECEIVE-ALL EMPLOYEES
    //
    const notificationRecipients = [
      ...new Set([
        ...uniqueReceivers,
        ...receiveAllEmployees.map((employee) => String(employee._id)),
      ]),
    ].filter((employeeId) => employeeId !== String(sender));

    //
    // CREATE NOTIFICATION FOR EACH RECIPIENT
    //
    if (notificationRecipients.length > 0) {
      await Notification.insertMany(
        notificationRecipients.map((recipient) => ({
          recipient,
          sender,
          messageId: newMessage._id,
          jobId,
          title: "New Message",
          message: message.trim(),
          isRead: false,
        })),
      );
    }

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "employeeCode firstName lastName designation")
      .populate("receivers", "employeeCode firstName lastName designation");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Send message error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

//
// GET CONVERSATION BETWEEN TWO EMPLOYEES FOR A JOB
//
// router.get("/conversation/:jobId/:user1/:user2", async (req, res) => {
//   try {
//     const { jobId, user1, user2 } = req.params;
//
//     const messages = await Message.find({
//       jobId,
//       $or: [
//         { sender: user1, receiver: user2 },
//         { sender: user2, receiver: user1 },
//       ],
//     })
//       .populate("sender", "firstName lastName employeeCode")
//       .populate("receiver", "firstName lastName employeeCode")
//       .sort({ createdAt: 1 });
//
//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

//
// GET ALL MESSAGES FOR A JOB
//
router.get("/job/:jobId", async (req, res) => {
  try {
    const messages = await Message.find({
      jobId: req.params.jobId,
    })
      .populate("sender", "employeeCode firstName lastName designation")
      .populate("receivers", "employeeCode firstName lastName designation")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//
// GET ALL MESSAGES FOR A USER
//
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.employeeId },
        { receivers: req.params.employeeId },
      ],
    })
      .populate("sender", "firstName lastName")
      .populate("receivers", "firstName lastName")
      .populate("jobId", "jobName projectName clientName")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//
// MARK MESSAGE AS READ
//
router.patch("/:id/read", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
