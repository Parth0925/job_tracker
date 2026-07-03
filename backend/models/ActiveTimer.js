const mongoose = require("mongoose");

const activeTimerSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    pausedAt: {
      type: Date,
      default: null,
    },

    totalPausedSeconds: {
      type: Number,
      default: 0,
    },

    isPaused: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ActiveTimer", activeTimerSchema);
