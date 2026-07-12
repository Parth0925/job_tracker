const jwt = require("jsonwebtoken");
const Employee = require("../../models/Employee");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token missing.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const employee = await Employee.findById(decoded.id).select("-password");

    if (!employee) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = employee;

    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = auth;
