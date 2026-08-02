const router = require("express").Router();
const bcrypt = require("bcryptjs");

const auth = require("../middleware/auth");
const Employee = require("../../models/Employee");
const upload = require("../../config/multer");

// GET all employees
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE EMPLOYEE
router.post(
  "/",
  upload.fields([
    { name: "aadharCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "relievingLetter", maxCount: 1 },
    { name: "experienceLetter", maxCount: 1 },
    { name: "payslips", maxCount: 20 },
    { name: "qualifications", maxCount: 20 },
    { name: "certificates", maxCount: 20 },
  ]),
  async (req, res) => {
    try {
      const count = await Employee.countDocuments();

      const employeeCode = `EMP${String(count + 1).padStart(3, "0")}`;

      const hashedPassword = await bcrypt.hash(`${employeeCode}@123`, 10);

      const designationLevels = {
        "Operational Head": 1,
        Manager: 2,
        "Team Leader": 3,
        "Senior Accountant": 4,
        "Junior Accountant": 5,
        Trainee: 6,
      };

      const designationLevel = designationLevels[req.body.designation] || 6;

      const employee = await Employee.create({
        employeeCode,

        firstName: req.body.firstName,
        lastName: req.body.lastName,

        email: req.body.email,
        password: hashedPassword,

        mobile: req.body.mobile,

        designation: req.body.designation,
        designationLevel,
        department: req.body.department,

        joiningDate: req.body.joiningDate,
        dateOfBirth: req.body.dateOfBirth,

        interestAreas: req.body.interestAreas
          ? JSON.parse(req.body.interestAreas)
          : [],

        employmentType: req.body.employmentType,

        status: req.body.status,

        role: req.body.role || "employee",

        documents: {
          aadharCard: req.files?.aadharCard?.[0]?.filename || "",

          panCard: req.files?.panCard?.[0]?.filename || "",

          relievingLetter: req.files?.relievingLetter?.[0]?.filename || "",

          experienceLetter: req.files?.experienceLetter?.[0]?.filename || "",

          payslips: req.files?.payslips?.map((file) => file.filename) || [],

          qualifications:
            req.files?.qualifications?.map((file) => file.filename) || [],

          certificates:
            req.files?.certificates?.map((file) => file.filename) || [],
        },

        notes: req.body.notes,
      });

      res.status(201).json({
        employee,
        defaultPassword: `${employeeCode}@123`,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
);

// GET employee by name
router.get("/name/:name", async (req, res) => {
  try {
    const employee = await Employee.findOne({
      name: req.params.name,
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
