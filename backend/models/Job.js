const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },

  hours: Number,

  type: String,

  notes: String,

  startTime: Date,

  endTime: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      default: "open",
    },

    timeLogs: [timeLogSchema],
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Job", jobSchema);
