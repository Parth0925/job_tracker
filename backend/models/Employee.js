const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      enum: [
        "Operational Head",
        "Manager",
        "Team Leader",
        "Senior Accountant",
        "Junior Accountant",
        "Trainee",
      ],
      default: "Trainee",
    },

    designationLevel: {
      type: Number,
      default: 6,
    },

    department: {
      type: String,
      enum: [
        "IT",
        "UK Accounts and Taxation",
        "Human Resource",
        "Learning and Development",
      ],
    },

    joiningDate: {
      type: Date,
    },

    dateOfBirth: {
      type: Date,
    },

    interestAreas: {
      type: [String],
      default: [],
    },

    employmentType: {
      type: String,
      default: "Full Time",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },

    documents: {
      aadharCard: {
        type: String,
        default: "",
      },

      panCard: {
        type: String,
        default: "",
      },

      payslips: {
        type: [String],
        default: [],
      },

      qualifications: {
        type: [String],
        default: [],
      },

      certificates: {
        type: [String],
        default: [],
      },

      relievingLetter: {
        type: String,
        default: "",
      },

      experienceLetter: {
        type: String,
        default: "",
      },
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Employee", employeeSchema);
