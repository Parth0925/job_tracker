const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Employee = require("../../models/Employee");

// LOGIN

router.post("/login", async (req, res) => {
  try {
    const { employeeCode, password } = req.body;

    if (!employeeCode || !password) {
      return res.status(400).json({
        message: "Employee Code and Password are required.",
      });
    }

    const employee = await Employee.findOne({
      employeeCode,
    })
      .populate("roles")
      .populate("activeRole");

    if (!employee) {
      return res.status(401).json({
        message: "Invalid Employee Code or Password.",
      });
    }

    if (!employee.password) {
      return res.status(401).json({
        message:
          "This employee account has no password set. Please contact the administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Employee Code or Password.",
      });
    }

    const token = jwt.sign(
      {
        id: employee._id,
        activeRole: employee.activeRole?._id || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,

      employee: {
        _id: employee._id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        designation: employee.designation,

        roles: employee.roles || [],

        activeRole: employee.activeRole || null,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
