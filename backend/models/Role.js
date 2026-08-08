const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    level: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },
    pagePermissions: {
      type: [String],
      default: [],
    },
    messagePermission: {
      type: String,
      enum: ["All", "Individual"],
      default: "Individual",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Role", roleSchema);
