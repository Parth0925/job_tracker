const router = require("express").Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const Employee = require("../../models/Employee");

// GET all employees
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const count = await Employee.countDocuments();

    const employeeCode = `EMP${String(count + 1).padStart(3, "0")}`;

    const hashedPassword = await bcrypt.hash(`${employeeCode}@123`, 10);

    const employee = await Employee.create({
      employeeCode,

      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      mobile: req.body.mobile,

      designation: req.body.designation,
      department: req.body.department,

      joiningDate: req.body.joiningDate,
      dateOfBirth: req.body.dateOfBirth,

      interestAreas: req.body.interestAreas || [],

      employmentType: req.body.employmentType,

      status: req.body.status,

      role: req.body.role || "employee",

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
});

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
