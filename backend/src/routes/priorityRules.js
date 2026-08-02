const router = require("express").Router();

const PriorityRule = require("../../models/PriorityRule");

// GET current priority rules
router.get("/", async (req, res) => {
  try {
    let rules = await PriorityRule.findOne();

    if (!rules) {
      rules = await PriorityRule.create({
        highDays: 2,
        mediumDays: 7,
      });
    }

    res.json(rules);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// UPDATE priority rules
router.put("/", async (req, res) => {
  try {
    const { highDays, mediumDays } = req.body;

    if (
      highDays === undefined ||
      mediumDays === undefined ||
      Number(highDays) < 0 ||
      Number(mediumDays) < 0
    ) {
      return res.status(400).json({
        message: "Invalid priority rules.",
      });
    }

    if (Number(highDays) >= Number(mediumDays)) {
      return res.status(400).json({
        message: "High priority days must be less than Medium priority days.",
      });
    }

    let rules = await PriorityRule.findOne();

    if (!rules) {
      rules = new PriorityRule();
    }

    rules.highDays = Number(highDays);
    rules.mediumDays = Number(mediumDays);

    await rules.save();

    res.json(rules);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
