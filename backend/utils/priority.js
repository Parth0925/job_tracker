const PriorityRule = require("../models/PriorityRule");

const getPriorityFromDueDate = async (dueDate) => {
  if (!dueDate) {
    return "Medium";
  }

  const rule = await PriorityRule.findOne();

  const highDays = rule?.highDays ?? 2;
  const mediumDays = rule?.mediumDays ?? 7;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const difference = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

  if (difference <= highDays) {
    return "High";
  }

  if (difference <= mediumDays) {
    return "Medium";
  }

  return "Low";
};

module.exports = {
  getPriorityFromDueDate,
};
