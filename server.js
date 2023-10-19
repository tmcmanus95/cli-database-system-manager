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
let employeeChoices = [];

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

function loadEmployees() {
  //Query that gets all the roles found in the database.
  db.query("SELECT * FROM employees;", function (error, results) {
    if (error) {
      console.error("Error fetching employees: ", error);
      return;
    }

    // Adds employees as an option per employee returned from query using the map method.
    employeeChoices = results.map((employee) => employee.last_name);
  });
}

//Function that loads the managers into the manager choices array.
function loadManagerChoices() {
  //Query that returns any user with the role of 1, the manager id
  return new Promise((resolve, reject) => {
    const query =
      "SELECT employee_id, last_name FROM employees WHERE role_id = '1'";

    db.query(query, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      //Adds each returned result to the array.
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

//Function for viewing the departments
function viewDepartments() {
  //Query to return all information from the department table.
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

//Function to view roles
function viewRoles() {
  //Query that returns the information from the roles table
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
        8,
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

function updateEmployee() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employee",
        message: "Select an employee you would like to edit: ",
        choices: employeeChoices,
      },
    ])
    .then((selectedEmployee) => {
      return inquirer
        .prompt([
          {
            type: "input",
            name: "firstName",
            message: "Enter employee's first name:",
          },
          {
            type: "input",
            name: "lastName",
            message: "Enter employee's last name:",
          },
          {
            type: "list",
            name: "jobTitle",
            message: "Select employee's job title:",
            choices: roles,
          },
          {
            type: "list",
            name: "employeeManager",
            message: "Who is this employee's manager?",
            choices: managerChoices,
          },
        ])
        .then((answer) => {
          const query = `UPDATE employees 
                       SET first_name = ?, last_name = ?, role_id = ?, manager_id = ? 
                       WHERE last_name = ?`;
          const values = [
            answer.firstName,
            answer.lastName,
            2,
            answer.employeeManager,
            selectedEmployee.employee,
          ];

          return new Promise((resolve, reject) => {
            db.query(query, values, (err, result) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                console.log("Employee updated successfully!");
                resolve();
              }
            });
          });
        });
    });
}

//Initial menu prompt
function mainMenu() {
  //loads / updates department, roles, managers, and employee arrays.
  loadDepartments();
  loadRoles();
  loadManagerChoices();
  loadEmployees();
  console.log(employeeChoices);
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
          updateEmployee();
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

//Starts application by presenting user with main menu
mainMenu();
