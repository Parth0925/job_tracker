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

// GET ROLE PAGE PERMISSIONS
router.get("/:id/permissions", auth, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found.",
      });
    }

    res.json({
      pagePermissions: role.pagePermissions || [],
      messagePermission: role.messagePermission || "Individual",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE ROLE PAGE PERMISSIONS
router.put("/:id/permissions", auth, async (req, res) => {
  try {
    const { pagePermissions, messagePermission } = req.body;
    const finalMessagePermission = messagePermission || "Individual";

    if (!Array.isArray(pagePermissions)) {
      return res.status(400).json({
        message: "pagePermissions must be an array.",
      });
    }

    if (!["All", "Individual"].includes(finalMessagePermission)) {
      return res.status(400).json({
        message: "messagePermission must be All or Individual.",
      });
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        pagePermissions,
        messagePermission: finalMessagePermission,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!role) {
      return res.status(404).json({
        message: "Role not found.",
      });
    }

    res.json(role);
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

// UPDATE ROLE
router.put("/:id", auth, async (req, res) => {
  try {
    const { name, level, description } = req.body;

    if (!name || level === undefined) {
      return res.status(400).json({
        message: "Role name and level are required.",
      });
    }

    const existingRole = await Role.findOne({
      name,
      _id: { $ne: req.params.id },
    });

    if (existingRole) {
      return res.status(400).json({
        message: "A role with this name already exists.",
      });
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        level,
        description,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!role) {
      return res.status(404).json({
        message: "Role not found.",
      });
    }

    res.json(role);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
