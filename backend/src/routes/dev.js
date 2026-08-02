const router = require("express").Router();

const bcrypt = require("bcryptjs");

const Employee = require("../../models/Employee");
const Job = require("../../models/Job");

// =====================================================
// SEED DATABASE
// =====================================================

router.post("/seed", async (req, res) => {
  try {
    // -------------------------------------------------
    // CLEAR EXISTING DATA
    // -------------------------------------------------

    await Employee.deleteMany({});
    await Job.deleteMany({});

    // -------------------------------------------------
    // EMPLOYEES
    // -------------------------------------------------

    const employeeData = [
      {
        employeeCode: "EMP001",
        firstName: "Parth",
        lastName: "Soni",
        designation: "Operational Head",
        department: "IT",
        email: "parth@gmail.com",
        mobile: "9999999991",
        interestAreas: ["React", "Node.js", "Management"],
        role: "admin",
      },

      {
        employeeCode: "EMP002",
        firstName: "Pratham",
        lastName: "Patel",
        designation: "Manager",
        department: "IT",
        email: "pratham@gmail.com",
        mobile: "9999999992",
        interestAreas: ["React", "MongoDB", "Project Management"],
        role: "employee",
      },

      {
        employeeCode: "EMP003",
        firstName: "Jay",
        lastName: "Shah",
        designation: "Team Leader",
        department: "UK Accounts and Taxation",
        email: "jay@gmail.com",
        mobile: "9999999993",
        interestAreas: ["UK Tax", "Accounts", "Team Management"],
        role: "employee",
      },

      {
        employeeCode: "EMP004",
        firstName: "Meet",
        lastName: "Patel",
        designation: "Senior Accountant",
        department: "UK Accounts and Taxation",
        email: "meet@gmail.com",
        mobile: "9999999994",
        interestAreas: ["Accounting", "VAT", "Taxation"],
        role: "employee",
      },

      {
        employeeCode: "EMP005",
        firstName: "Priya",
        lastName: "Patel",
        designation: "Junior Accountant",
        department: "Human Resource",
        email: "priya@gmail.com",
        mobile: "9999999995",
        interestAreas: ["Payroll", "HR Operations"],
        role: "employee",
      },

      {
        employeeCode: "EMP006",
        firstName: "Neha",
        lastName: "Shah",
        designation: "Trainee",
        department: "Learning and Development",
        email: "neha@gmail.com",
        mobile: "9999999996",
        interestAreas: ["Learning", "Training", "Development"],
        role: "employee",
      },
    ];

    const employees = [];

    for (const emp of employeeData) {
      const hashedPassword = await bcrypt.hash(`${emp.employeeCode}@123`, 10);

      const employee = await Employee.create({
        ...emp,

        password: hashedPassword,

        joiningDate: new Date("2026-01-20"),

        dateOfBirth: new Date("2000-01-01"),

        employmentType: "Full Time",

        status: "Active",

        documents: {
          aadharCard: "",
          panCard: "",
          payslips: [],
          qualifications: [],
          certificates: [],
          relievingLetter: "",
          experienceLetter: "",
        },

        notes: "Seed data employee",
      });

      employees.push(employee);
    }

    // -------------------------------------------------
    // EMPLOYEE REFERENCES
    // -------------------------------------------------

    const parth = employees[0];
    const pratham = employees[1];
    const jay = employees[2];
    const meet = employees[3];
    const priya = employees[4];
    const neha = employees[5];

    // -------------------------------------------------
    // HELPER FOR TIME LOGS
    // -------------------------------------------------

    const createTimeLog = (employee, hours, notes) => {
      const endTime = new Date();

      const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

      return {
        employeeId: employee._id,
        hours,
        type: "manual",
        notes,
        startTime,
        endTime,
      };
    };

    // =================================================
    // JOB 1
    // Within Budget
    // Billable
    // Not Started
    // =================================================

    await Job.create({
      clientName: "Smart Labs",
      projectName: "Pharma Connect",
      jobName: "Login Module",

      description: "Develop and test the authentication and login module.",

      budgetedHours: 8,

      jobType: "Billable",

      repeatJob: false,
      repeatFrequency: "None",

      assignments: [
        {
          employeeId: pratham._id,
          role: "Preparer",
          allocatedHours: 6,
        },
        {
          employeeId: jay._id,
          role: "Reviewer",
          allocatedHours: 2,
        },
      ],

      assignmentDate: new Date("2026-07-20"),

      completionDate: null,

      communicationLog:
        "Client provided login requirements and API documentation.",

      checklistPrepared: true,

      priority: "High",

      status: "Not Started",

      submittedForReview: false,

      reviewStatus: "Pending",

      reviewComments: "",

      timeLogs: [createTimeLog(pratham, 4, "Initial login module development")],
    });

    // =================================================
    // JOB 2
    // On Budget
    // Billable
    // In Review
    // =================================================

    await Job.create({
      clientName: "Smart Labs",
      projectName: "Pharma Connect",
      jobName: "Dashboard Module",

      description: "Build the main dashboard and reporting widgets.",

      budgetedHours: 10,

      jobType: "Billable",

      repeatJob: false,
      repeatFrequency: "None",

      assignments: [
        {
          employeeId: pratham._id,
          role: "Preparer",
          allocatedHours: 8,
        },
        {
          employeeId: jay._id,
          role: "Reviewer",
          allocatedHours: 2,
        },
      ],

      assignmentDate: new Date("2026-07-18"),

      completionDate: null,

      communicationLog: "Dashboard completed and submitted to reviewer.",

      checklistPrepared: true,

      priority: "Medium",

      status: "In Review",

      submittedForReview: true,

      reviewStatus: "Pending",

      reviewComments: "",

      timeLogs: [
        createTimeLog(pratham, 8, "Dashboard development"),

        createTimeLog(jay, 2, "Dashboard review"),
      ],
    });

    // =================================================
    // JOB 3
    // Over Budget
    // Billable
    // Completed
    // Approved
    // =================================================

    await Job.create({
      clientName: "ABC Industries",
      projectName: "ERP",
      jobName: "Employee Module",

      description:
        "Employee management module including employee records and profile management.",

      budgetedHours: 8,

      jobType: "Billable",

      repeatJob: false,
      repeatFrequency: "None",

      assignments: [
        {
          employeeId: meet._id,
          role: "Preparer",
          allocatedHours: 6,
        },
        {
          employeeId: jay._id,
          role: "Reviewer",
          allocatedHours: 2,
        },
      ],

      assignmentDate: new Date("2026-07-10"),

      completionDate: new Date("2026-07-17"),

      communicationLog:
        "Additional employee fields were requested by the client during development.",

      checklistPrepared: true,

      priority: "High",

      status: "Completed",

      submittedForReview: true,

      reviewStatus: "Approved",

      reviewComments: "Module reviewed and approved successfully.",

      reviewedAt: new Date("2026-07-18"),

      timeLogs: [
        createTimeLog(meet, 7, "Employee module development"),

        createTimeLog(jay, 3, "Employee module review"),
      ],
    });

    // =================================================
    // JOB 4
    // Awaiting Info
    // Non Billable
    // Recurring Monthly
    // =================================================

    await Job.create({
      clientName: "Global Finance Ltd",
      projectName: "Monthly Accounting",
      jobName: "Monthly Accounts Review",

      description:
        "Monthly internal review of accounting records and pending information.",

      budgetedHours: 12,

      jobType: "Non Billable",

      repeatJob: true,
      repeatFrequency: "Monthly",

      nextDueDate: new Date("2026-08-31"),

      assignments: [
        {
          employeeId: meet._id,
          role: "Preparer",
          allocatedHours: 8,
        },
        {
          employeeId: jay._id,
          role: "Reviewer",
          allocatedHours: 4,
        },
      ],

      assignmentDate: new Date("2026-07-25"),

      completionDate: null,

      communicationLog:
        "Waiting for bank statements and supporting documents from the client.",

      checklistPrepared: false,

      priority: "Medium",

      status: "Awaiting Info",

      submittedForReview: false,

      reviewStatus: "Pending",

      reviewComments: "",

      timeLogs: [createTimeLog(meet, 2, "Initial document review")],
    });

    // =================================================
    // JOB 5
    // Rejected
    // Billable
    // Recurring Weekly
    // =================================================

    await Job.create({
      clientName: "Tech Solutions Ltd",
      projectName: "Support",
      jobName: "Weekly Support Review",

      description: "Weekly review and resolution of client support requests.",

      budgetedHours: 6,

      jobType: "Billable",

      repeatJob: true,
      repeatFrequency: "Weekly",

      nextDueDate: new Date("2026-08-07"),

      assignments: [
        {
          employeeId: pratham._id,
          role: "Preparer",
          allocatedHours: 4,
        },
        {
          employeeId: jay._id,
          role: "Reviewer",
          allocatedHours: 2,
        },
      ],

      assignmentDate: new Date("2026-07-30"),

      completionDate: null,

      communicationLog:
        "Reviewer requested corrections to the submitted support report.",

      checklistPrepared: true,

      priority: "High",

      status: "Rejected",

      submittedForReview: true,

      reviewStatus: "Rejected",

      reviewComments:
        "Please correct the unresolved support tickets before resubmission.",

      reviewedAt: new Date("2026-08-01"),

      timeLogs: [
        createTimeLog(pratham, 4, "Support ticket resolution"),

        createTimeLog(jay, 1, "Initial review"),
      ],
    });

    // =================================================
    // JOB 6
    // Non Billable
    // Completed
    // Exactly On Budget
    // Yearly
    // =================================================

    await Job.create({
      clientName: "Internal",
      projectName: "Human Resources",
      jobName: "Employee Training",

      description: "Internal employee training and development activity.",

      budgetedHours: 5,

      jobType: "Non Billable",

      repeatJob: true,
      repeatFrequency: "Yearly",

      nextDueDate: new Date("2027-07-31"),

      assignments: [
        {
          employeeId: priya._id,
          role: "Preparer",
          allocatedHours: 3,
        },
        {
          employeeId: neha._id,
          role: "Reviewer",
          allocatedHours: 2,
        },
      ],

      assignmentDate: new Date("2026-07-01"),

      completionDate: new Date("2026-07-05"),

      communicationLog: "Annual employee training completed successfully.",

      checklistPrepared: true,

      priority: "Low",

      status: "Completed",

      submittedForReview: true,

      reviewStatus: "Approved",

      reviewComments: "Training activity completed and approved.",

      reviewedAt: new Date("2026-07-06"),

      timeLogs: [
        createTimeLog(priya, 3, "Training preparation"),

        createTimeLog(neha, 2, "Training session"),
      ],
    });

    // =================================================
    // JOB 7
    // Not Started
    // Billable
    // High Priority
    // =================================================

    await Job.create({
      clientName: "Reliance",
      projectName: "HRMS",
      jobName: "Payroll Module",

      description:
        "Develop payroll processing and employee salary calculation functionality.",

      budgetedHours: 20,

      jobType: "Billable",

      repeatJob: false,
      repeatFrequency: "None",

      assignments: [
        {
          employeeId: pratham._id,
          role: "Preparer",
          allocatedHours: 14,
        },
        {
          employeeId: meet._id,
          role: "Reviewer",
          allocatedHours: 6,
        },
      ],

      assignmentDate: new Date("2026-08-01"),

      completionDate: null,

      communicationLog:
        "Payroll requirements received. Development scheduled to begin.",

      checklistPrepared: false,

      priority: "High",

      status: "Not Started",

      submittedForReview: false,

      reviewStatus: "Pending",

      reviewComments: "",

      timeLogs: [],
    });

    // =================================================
    // JOB 8
    // In Review
    // Non Billable
    // =================================================

    await Job.create({
      clientName: "TCS",
      projectName: "GST",
      jobName: "GST Reports",

      description: "Prepare and review GST reporting functionality.",

      budgetedHours: 15,

      jobType: "Non Billable",

      repeatJob: false,
      repeatFrequency: "None",

      assignments: [
        {
          employeeId: meet._id,
          role: "Preparer",
          allocatedHours: 10,
        },
        {
          employeeId: jay._id,
          role: "Reviewer",
          allocatedHours: 5,
        },
      ],

      assignmentDate: new Date("2026-07-28"),

      completionDate: null,

      communicationLog: "GST report prepared and waiting for final review.",

      checklistPrepared: true,

      priority: "Medium",

      status: "In Review",

      submittedForReview: true,

      reviewStatus: "Pending",

      reviewComments: "",

      timeLogs: [
        createTimeLog(meet, 8, "GST report preparation"),

        createTimeLog(jay, 2, "GST report review"),
      ],
    });

    // =================================================
    // RESPONSE
    // =================================================

    res.json({
      success: true,

      message: "Database Seeded Successfully",

      employeesCreated: employees.length,

      jobsCreated: 8,

      defaultPasswords: "EMP001@123 to EMP006@123",
    });
  } catch (err) {
    console.error("SEED ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// =====================================================
// RESET DATABASE
// =====================================================

router.delete("/reset", async (req, res) => {
  try {
    await Employee.deleteMany({});
    await Job.deleteMany({});

    res.json({
      success: true,
      message: "Database Reset Successful",
    });
  } catch (err) {
    console.error("RESET ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
