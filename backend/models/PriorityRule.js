const mongoose = require("mongoose");

const priorityRuleSchema = new mongoose.Schema(
  {
    highDays: {
      type: Number,
      required: true,
      default: 2,
      min: 0,
    },

    mediumDays: {
      type: Number,
      required: true,
      default: 7,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PriorityRule", priorityRuleSchema);
