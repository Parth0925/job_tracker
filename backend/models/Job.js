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
    clientName: {
      type: String,
      required: true,
    },

    projectName: {
      type: String,
      required: true,
    },

    jobName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    budgetedHours: {
      type: Number,
      default: 0,
    },

    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],

    assignmentDate: Date,

    completionDate: Date,

    communicationLog: {
      type: String,
      default: "",
    },

    checklistPrepared: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "On Hold"],
      default: "Open",
    },

    timeLogs: [timeLogSchema],
  },
  {
    timestamps: true,
  },
);

jobSchema.methods.getBudgetSummary = function () {
  const spentHours = this.timeLogs.reduce(
    (total, log) => total + (log.hours || 0),
    0,
  );

  const budgetedHours = this.budgetedHours || 0;

  const remainingHours = Number((budgetedHours - spentHours).toFixed(2));

  const exceededHours =
    spentHours > budgetedHours
      ? Number((spentHours - budgetedHours).toFixed(2))
      : 0;

  const budgetUtilization =
    budgetedHours > 0
      ? Number(((spentHours / budgetedHours) * 100).toFixed(2))
      : 0;

  const efficiency =
    spentHours > 0
      ? Number(((budgetedHours / spentHours) * 100).toFixed(2))
      : 100;

  let budgetStatus = "Within Budget";

  if (spentHours === budgetedHours) {
    budgetStatus = "On Budget";
  }

  if (spentHours > budgetedHours) {
    budgetStatus = "Over Budget";
  }

  return {
    spentHours: Number(spentHours.toFixed(2)),
    remainingHours,
    exceededHours,
    budgetUtilization,
    efficiency,
    budgetStatus,
  };
};

module.exports = mongoose.model("Job", jobSchema);
