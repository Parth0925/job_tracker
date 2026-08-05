const router = require("express").Router();
const bcrypt = require("bcryptjs");

const auth = require("../middleware/auth");
const Employee = require("../../models/Employee");
const Role = require("../../models/Role");
const upload = require("../../config/multer");

// GET all employees
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("roles")
      .populate("activeRole")
      .populate("reportsTo", "firstName lastName employeeCode designation");

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
        Founder: 1,
        Manager: 2,
        "Team Leader": 3,
        "Assistent Team Leader": 4,
        "Senior Accountant": 5,
        "Junior Accountant": 6,
        Trainee: 7,
        Intern: 8,
      };

      const designationLevel = designationLevels[req.body.designation] || 6;

      const role = await Role.findOne({
        name: req.body.designation,
      });

      const employee = await Employee.create({
        employeeCode,

        firstName: req.body.firstName,
        lastName: req.body.lastName,

        email: req.body.email,
        password: hashedPassword,

        mobile: req.body.mobile,

        designation: req.body.designation,
        designationLevel,

        reportsTo: req.body.reportsTo || null,

        roles: role ? [role._id] : [],
        activeRole: role ? role._id : null,

        department: req.body.department,

        joiningDate: req.body.joiningDate,
        dateOfBirth: req.body.dateOfBirth,

        interestAreas: req.body.interestAreas
          ? JSON.parse(req.body.interestAreas)
          : [],

        employmentType: req.body.employmentType,

        status: req.body.status,

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

      await employee.populate("roles");
      await employee.populate("activeRole");

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

// UPDATE EMPLOYEE REPORTING MANAGER
router.patch("/:id/reporting", auth, async (req, res) => {
  try {
    const { reportsTo } = req.body;

    if (reportsTo && reportsTo === req.params.id) {
      return res.status(400).json({
        message: "An employee cannot report to themselves.",
      });
    }

    if (reportsTo) {
      const manager = await Employee.findById(reportsTo);

      if (!manager) {
        return res.status(404).json({
          message: "Reporting employee not found.",
        });
      }

      let currentId = reportsTo;

      while (currentId) {
        if (currentId === req.params.id) {
          return res.status(400).json({
            message:
              "Invalid reporting structure. Circular hierarchy detected.",
          });
        }

        const currentEmployee =
          await Employee.findById(currentId).select("reportsTo");

        if (!currentEmployee?.reportsTo) {
          break;
        }

        currentId = currentEmployee.reportsTo.toString();
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        reportsTo: reportsTo || null,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("roles")
      .populate("activeRole")
      .populate("reportsTo", "firstName lastName employeeCode designation");

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    res.json(employee);
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

// UPDATE ACTIVE ROLE
router.patch("/:id/active-role", auth, async (req, res) => {
  try {
    const { activeRole } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    const roleExists = employee.roles.some(
      (roleId) => roleId.toString() === activeRole,
    );

    if (!roleExists) {
      return res.status(400).json({
        message: "This role is not assigned to the employee.",
      });
    }

    employee.activeRole = activeRole;

    await employee.save();

    await employee.populate("roles");
    await employee.populate("activeRole");

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE EMPLOYEE ROLES
router.patch("/:id/roles", auth, async (req, res) => {
  try {
    const { roles } = req.body;

    if (!Array.isArray(roles)) {
      return res.status(400).json({
        message: "Roles must be an array.",
      });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    employee.roles = roles;

    if (
      !employee.activeRole ||
      !roles.includes(employee.activeRole.toString())
    ) {
      employee.activeRole = roles.length ? roles[0] : null;
    }

    await employee.save();

    await employee.populate("roles");
    await employee.populate("activeRole");

    res.json(employee);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
