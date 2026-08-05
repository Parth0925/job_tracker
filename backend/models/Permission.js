const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      unique: true,
    },

    label: {
      type: String,
      required: true,
    },

    permissions: {
      view: {
        type: Boolean,
        default: false,
      },

      add: {
        type: Boolean,
        default: false,
      },

      edit: {
        type: Boolean,
        default: false,
      },

      delete: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Permission", permissionSchema);
