const router = require("express").Router();
const Message = require("../../models/Message");

// GET all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("employeeId")
      .populate("jobId");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEND message
router.post("/", async (req, res) => {
  try {
    const { jobId, employeeId, text } = req.body;

    const message = await Message.create({
      jobId,
      employeeId,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
