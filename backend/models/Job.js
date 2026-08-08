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

    jobType: {
      type: String,
      enum: ["Billable", "Non Billable"],
      default: "Billable",
    },

    repeatJob: {
      type: Boolean,
      default: false,
    },

    repeatFrequency: {
      type: String,
      enum: ["None", "Weekly", "Monthly", "Quarterly", "Yearly"],
      default: "None",
    },

    nextDueDate: {
      type: Date,
    },

    assignments: [
      {
        employeeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
          required: true,
        },

        role: {
          type: String,
          enum: ["Preparer", "Reviewer"],
          required: true,
        },

        allocatedHours: {
          type: Number,
          default: 0,
        },

        spentHours: {
          type: Number,
          default: 0,
        },

        remainingHours: {
          type: Number,
          default: 0,
        },

        budgetStatus: {
          type: String,
          enum: ["Within Budget", "On Budget", "Over Budget"],
          default: "Within Budget",
        },
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
      enum: [
        "Awaiting Info",
        "Not Started",
        "In Review",
        "Completed",
        "Rejected",
      ],
      default: "Not Started",
    },

    submittedForReview: {
      type: Boolean,
      default: false,
    },

    reviewStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    reviewComments: {
      type: String,
      default: "",
    },

    reviewedAt: {
      type: Date,
      default: null,
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
