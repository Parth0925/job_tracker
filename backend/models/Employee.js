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
        "Founder",
        "Manager",
        "Team Leader",
        "Assistent Team Leader",
        "Senior Accountant",
        "Junior Accountant",
        "Trainee",
        "Intern",
      ],
      default: "Junior Accountant",
    },

    designationLevel: {
      type: Number,
      default: 6,
    },

    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],

    activeRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
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
      enum: ["Full Time", "Part Time", "Contract"],
      default: "Full Time",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive", "Resigned"],
      default: "Active",
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
