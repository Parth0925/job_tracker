const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../config/db");

const jobsRoutes = require("./routes/jobs");
const messagesRoutes = require("./routes/messages");
const employeesRoutes = require("./routes/employees");
const timersRoutes = require("./routes/timers");
const worklogsRoutes = require("./routes/worklogs");

const app = express();
const PORT = 8000;

// middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  next();
});

app.use(express.json());

connectDB();

// routes
app.use("/api/jobs", jobsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/timers", timersRoutes);
app.use("/api/worklogs", worklogsRoutes);

app.get("/", (req, res) => {
  res.send("Internal Job System API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
