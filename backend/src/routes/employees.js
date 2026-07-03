const router = require("express").Router();
const Employee = require("../../models/Employee");

// GET all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const Employee = require("../../models/Employee");

    const employee = await Employee.create({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || "employee",
    });

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
