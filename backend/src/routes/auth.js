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
    });

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

    console.log("Employee Code:", employeeCode);
    console.log("Entered Password:", password);
    console.log("Stored Hash:", employee.password);

    // const isMatch = await bcrypt.compare(password, employee.password);
    const isMatch = await bcrypt.compare(password, employee.password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Employee Code or Password.",
      });
    }

    const token = jwt.sign(
      {
        id: employee._id,
        role: employee.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    console.log("Login Successful");
    console.log(token);

    res.json({
      token,

      employee: {
        _id: employee._id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        designation: employee.designation,
        role: employee.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
