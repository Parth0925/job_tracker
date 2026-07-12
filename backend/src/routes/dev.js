const router = require("express").Router();

const bcrypt = require("bcryptjs");
const Message = require("../../models/Message");

const Employee = require("../../models/Employee");
const Job = require("../../models/Job");

router.post("/seed", async (req, res) => {
  try {
    // Clear existing data
    await Employee.deleteMany({});
    await Job.deleteMany({});

    // --------------------
    // Employees
    // --------------------

    const employeeData = [
      {
        employeeCode: "EMP001",
        firstName: "Parth",
        lastName: "Soni",
        designation: "Senior Developer",
        department: "IT",
        email: "parth@gmail.com",
        mobile: "9999999991",
        interestAreas: ["React", "Node"],
        role: "admin",
      },
      {
        employeeCode: "EMP002",
        firstName: "Pratham",
        lastName: "Patel",
        designation: "Software Engineer",
        department: "IT",
        email: "pratham@gmail.com",
        mobile: "9999999992",
        interestAreas: ["React", "SQL"],
        role: "employee",
      },
      {
        employeeCode: "EMP003",
        firstName: "Jay",
        lastName: "Shah",
        designation: "React Developer",
        department: "IT",
        email: "jay@gmail.com",
        mobile: "9999999993",
        role: "employee",
      },
      {
        employeeCode: "EMP004",
        firstName: "Meet",
        lastName: "Patel",
        designation: "Backend Developer",
        department: "IT",
        email: "meet@gmail.com",
        mobile: "9999999994",
        role: "employee",
      },
      {
        employeeCode: "EMP005",
        firstName: "Priya",
        lastName: "Patel",
        designation: "QA Engineer",
        department: "QA",
        email: "priya@gmail.com",
        mobile: "9999999995",
        role: "employee",
      },
    ];

    const employees = [];

    for (const emp of employeeData) {
      const hashedPassword = await bcrypt.hash(`${emp.employeeCode}@123`, 10);

      const employee = await Employee.create({
        ...emp,
        password: hashedPassword,
        joiningDate: new Date("2026-07-01"),
        dateOfBirth: new Date("2000-01-01"),
        employmentType: "Full Time",
        status: "Active",
        notes: "",
      });

      employees.push(employee);
    }

    // --------------------
    // Jobs
    // --------------------

    const jobs = [
      {
        clientName: "Smart Labs",
        projectName: "Pharma Connect",
        jobName: "Login Module",
        budgetedHours: 8,
        spent: 6,
      },
      {
        clientName: "ABC Industries",
        projectName: "ERP",
        jobName: "Employee Module",
        budgetedHours: 8,
        spent: 8,
      },
      {
        clientName: "Infosys",
        projectName: "CRM",
        jobName: "Dashboard",
        budgetedHours: 8,
        spent: 10,
      },
      {
        clientName: "Reliance",
        projectName: "HRMS",
        jobName: "Payroll",
        budgetedHours: 20,
        spent: 28,
      },
      {
        clientName: "TCS",
        projectName: "GST",
        jobName: "Reports",
        budgetedHours: 40,
        spent: 55,
      },
    ];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];

      await Job.create({
        clientName: job.clientName,
        projectName: job.projectName,
        jobName: job.jobName,
        description: `${job.jobName} development`,
        budgetedHours: job.budgetedHours,
        assignedEmployees: [
          employees[i % employees.length]._id,
          employees[(i + 1) % employees.length]._id,
        ],
        assignmentDate: new Date(),
        completionDate: new Date(),
        communicationLog: "Seed Data",
        checklistPrepared: true,
        priority: "Medium",
        status: "Open",

        timeLogs: [
          {
            employeeId: employees[i % employees.length]._id,
            hours: job.spent,
            type: "manual",
            notes: "Development Work",
            startTime: new Date(),
            endTime: new Date(),
          },
        ],
      });
    }

    res.json({
      success: true,
      message: "Database Seeded Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

router.delete("/reset", async (req, res) => {
  try {
    await Employee.deleteMany({});
    await Job.deleteMany({});

    res.json({
      success: true,
      message: "Database Reset Successful",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
