const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      unique: true,
    },

    permissions: {
      type: Map,
      of: {
        type: Boolean,
      },
      default: {},
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RolePermission", rolePermissionSchema);
