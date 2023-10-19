const inquirer = require("inquirer");
const mysql = require("mysql2");

//Databse connection variable declaration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Password1",
  database: "hr_database",
});

// intializing arrays that will store departments and roles
let departments = [];
let roles = [];
let managerChoices = [];

// Function to load departments from the database
function loadDepartments() {
  db.query("SELECT * FROM department;", function (error, results) {
    if (error) {
      console.error("Error fetching departments:", error);
      return;
    }

    departments = results.map((department) => department.department_name);
  });
}

//Function that will populate the array with the roles found in the role table
function loadRoles() {
  //Query that gets all the roles found in the database.
  db.query("SELECT * FROM roles;", function (error, results) {
    if (error) {
      console.error("Error fetching roles: ", error);
      return;
    }

    // Adds roles as an option per role returned from query using the map method.
    roles = results.map((role) => role.job_title);
  });
}

function loadManagerChoices() {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT employee_id, last_name FROM employees WHERE role_id = '1'";

    db.query(query, (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      results.forEach((manager) => {
        managerChoices.push({
          name: manager.last_name,
          value: manager.employee_id,
        });
      });

      resolve(managerChoices);
    });
  });
}

function viewDepartments() {
  db.query("SELECT * FROM department;", function (error, results) {
    if (error) {
      console.error("Error fetching departments:", error);
      return;
    }

    console.table(results);
  });
  setTimeout(() => {
    anotherTask();
  }, 1000);
}

function viewRoles() {
  db.query("SELECT * FROM roles;", function (error, results) {
    if (error) {
      console.error("Error fetching roles: ", error);
      return;
    }

    console.table(results);
  });
  setTimeout(() => {
    anotherTask();
  }, 1000);
}

//Function to return the employees along with their salary and corresponding info
function viewEmployees() {
  //Query returning employee id, first and last name, job title, and also salary using a join table.
  db.query(
    "SELECT e.employee_id, e.first_name, e.last_name, r.job_title, r.salary FROM employees e INNER JOIN roles r ON e.role_id = r.role_id",
    function (error, results) {
      if (error) {
        console.error("Error fetching departments:", error);
        return;
      }
      console.table(results);
    }
  );
  setTimeout(() => {
    anotherTask();
  }, 1000);
}

//Function for adding a department
function addADepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "departmentName",
        message: "Enter the name of the department: ",
      },
    ])
    .then((answer) => {
      const query = `INSERT INTO department (department_name) VALUES (?)`;
      const values = [answer.departmentName];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log("Department added successfully!");
      });
      //Also adds department to the departments array.
      departments.push(values);
    })
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          anotherTask();
          resolve();
        }, 1000);
      });
    });
}

//Function for adding a new role.
function addARole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleName",
        message: "Enter the name of the role: ",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary for this role?",
      },
      {
        type: "list",
        name: "department",
        message: "What department does this role fall under?",
        choices: departments,
      },
    ])
    //Query to add new role into the database.
    .then((answer) => {
      const query = `INSERT INTO roles (job_title, salary, department_id) VALUES (?, ?, ?)`;
      const values = [answer.roleName, answer.salary, 3];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log("Role added successfully!");
      });

      //Adds role to roles array.
      roles.push(values);
    })
    //Wait until the user is done inputting before asking if they would like to peform another task.
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          anotherTask();
          resolve();
        }, 1000);
      });
    });
}

//Function to add an employee
function addAnEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "Enter employees first name:",
      },
      {
        type: "input",
        name: "lastName",
        message: "Enter employees last name:",
      },
      {
        type: "list",
        name: "jobTitle",
        message: "Select employees job title:",
        choices: roles,
      },
      {
        type: "list",
        name: "employeeManager",
        message: "Who is this employee's manager?",
        choices: managerChoices,
      },
    ])
    //Query to insert new employee information into the database.
    .then((answer) => {
      const query = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
      const values = [
        answer.firstName,
        answer.lastName,
        answer.job_title,
        answer.employeeManager,
      ];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }

        console.log("Employee added successfully!");
      });
    })
    //Wait until the user is done inputting before asking if they would like to peform another task.
    .then(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          anotherTask();
          resolve();
        }, 1000);
      });
    });
}

//Initial menu prompt
function mainMenu() {
  //reloads department and roles arrays.
  loadDepartments();
  loadRoles();
  loadManagerChoices();
  inquirer
    .prompt([
      {
        type: "list",
        name: "mainMenu",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a new department",
          "Add a new role",
          "Add a new employee",
          "Update existing employee role",
          "Quit",
        ],
      },
    ])
    .then((answer) => {
      switch (answer.mainMenu) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add a new department":
          addADepartment();
          break;
        case "Add a new role":
          addARole();
          break;
        case "Add a new employee":
          addAnEmployee();
          break;
        case "Update existing employee role":
          break;
        case "Quit":
          process.exit();
        default:
          console.error(
            "An error occured. Please reset the application and try again."
          );
          break;
      }
    });
}

function anotherTask() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "another",
        message: "Would you like to perform another task?",
        choices: ["Yes", "No"],
      },
    ])
    .then((answer) => {
      switch (answer.another) {
        case "Yes":
          mainMenu();
          break;
        case "No":
          process.exit();
      }
    });
}

//loading functions called upon application start

//Starts application by presenting user with main menu
mainMenu();
