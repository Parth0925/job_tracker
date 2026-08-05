const router = require("express").Router();

const auth = require("../middleware/auth");
const Role = require("../../models/Role");

// GET all roles
router.get("/", auth, async (req, res) => {
  try {
    const roles = await Role.find().sort({ level: 1 });

    res.json(roles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// CREATE ROLE
router.post("/", auth, async (req, res) => {
  try {
    const { name, level, description } = req.body;

    if (!name || level === undefined) {
      return res.status(400).json({
        message: "Role name and level are required.",
      });
    }

    const existingRole = await Role.findOne({ name });

    if (existingRole) {
      return res.status(400).json({
        message: "A role with this name already exists.",
      });
    }

    const role = await Role.create({
      name,
      level,
      description: description || "",
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
