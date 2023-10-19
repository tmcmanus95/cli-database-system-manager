INSERT INTO department (department_name)
VALUES ("Management"),
       ("Sales"),
       ("Accounting"),
       ("Human Resources"),
       ("Reception");

INSERT INTO roles (department_id, job_title, salary)
VALUES (1, "Regional Manager", 100000),
       (2, "Salesman", 60000),
       (3, "Accountant", 65000),
       (2, "Junior Salesman", 15000),
       (5, "Desk Receptionist", 45000),
       (2, "Lead Salesman", 70000),
       (4, "HR Generalist", 50000);
       
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Michael", "Scott", 1, NULL),
        ("David", "Wallace", 1, NULL),
        ("Jim", "Halpert", 2, 1),
        ("Dwight", "Schrute", 2, 1),
        ("Pam", "Beesley", 5, 1),
        ("Oscar", "Martinez", 3, 1),
        ("Angela", "Martin", 3, 1),
        ("Toby", "Flenderson", 4, 1);
