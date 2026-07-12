const router = require("express").Router();
const Message = require("../../models/Message");

//
// SEND MESSAGE
//
router.post("/", async (req, res) => {
  try {
    const { jobId, sender, message } = req.body;

    const newMessage = await Message.create({
      jobId,
      sender,
      message,
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "employeeCode firstName lastName designation",
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
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

//     res.json(messages);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

// GET ALL MESSAGES FOR A JOB
router.get("/job/:jobId", async (req, res) => {
  try {
    const messages = await Message.find({
      jobId: req.params.jobId,
    })
      .populate("sender", "employeeCode firstName lastName designation")
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
        { receiver: req.params.employeeId },
      ],
    })
      .populate("sender", "firstName lastName")
      .populate("receiver", "firstName lastName")
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
