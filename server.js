require("dotenv").config();

const pg = require("pg");
const express = require("express");
const { log } = require("console");
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

app.use(require("morgan")("dev"));
app.use(express.json());

// GET /api/employees: Returns array of employees
app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = /* sql */ `SELECT * FROM employees`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/departments: Returns an array of departments
app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = /* sql */ `SELECT * FROM departments`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/employees: Returns a created employee
app.post("/api/employees", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
        INSERT INTO employees(name, department_id)
        VALUES($1, $2)
        `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.department_id,
    ]);
    res.status(201).send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/employees/:id: Returns nothing. The ID of the employee to delete is passed in the URL.
app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
      DELETE from employees
      WHERE id=$1
      `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// PUT /api/employees/:id: Returns an updated employee
app.put("/api/employees/:id", async (req, res, next) => {
    try {
      const SQL = /* sql */ `
      UPDATE employees
      SET name=$1, department_id=$2, updated_at=now()
      WHERE id=$3
      RETURNING *
      `;
      const response = await client.query(SQL, [
        req.body.name,
        req.body.department_id,
        req.params.id,
      ]);
      res.send(response.rows[0]);
    } catch (error) {
      next(error);
    }
  });

// Error handling route that returns an object with an error property
app.use((error, req, res, next) => {
  res.status(res.status || 500).send({
    error: error,
  });
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = /* sql */ `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
    CREATE TABLE departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );
  
    CREATE TABLE employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200),
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      department_id INTEGER REFERENCES departments(id) NOT NULL
    );
    `;

  await client.query(SQL);
  console.log("tables created");

  SQL = /* sql */ `
  INSERT INTO departments (name) VALUES('Sales');
  INSERT INTO departments (name) VALUES('Marketing');
  INSERT INTO departments (name) VALUES('Finance');
  INSERT INTO departments (name) VALUES('Operations');
  INSERT INTO departments (name) VALUES('Human Resources');

  INSERT INTO employees (name, department_id) VALUES ('Archana Swamy', 
    (SELECT id FROM departments WHERE name='Human Resources'));
  INSERT INTO employees (name, department_id) VALUES ('Carlos Mendoza', 
    (SELECT id FROM departments WHERE name='Marketing'));
  INSERT INTO employees (name, department_id) VALUES ('Fatima El-Sayed', 
    (SELECT id FROM departments WHERE name='Finance'));
  INSERT INTO employees (name, department_id) VALUES ('Liam Smith', 
    (SELECT id FROM departments WHERE name='Sales'));
  INSERT INTO employees (name, department_id) VALUES ('Jin Park', 
    (SELECT id FROM departments WHERE name='Operations'));
  INSERT INTO employees (name, department_id) VALUES ('Sarah Al-Hussein', 
    (SELECT id FROM departments WHERE name='Finance'));
  INSERT INTO employees (name, department_id) VALUES ('Ethan Patel', 
    (SELECT id FROM departments WHERE name='Marketing'));
  INSERT INTO employees (name, department_id) VALUES ('Marta Novak', 
    (SELECT id FROM departments WHERE name='Operations'));
  INSERT INTO employees (name, department_id) VALUES ('Vivian Chen', 
    (SELECT id FROM departments WHERE name='Sales'));
  INSERT INTO employees (name, department_id) VALUES ('Adam Terhorst', 
    (SELECT id FROM departments WHERE name='Human Resources'));
  INSERT INTO employees (name, department_id) VALUES ('Rachel McCoy', 
    (SELECT id FROM departments WHERE name='Marketing'));
  INSERT INTO employees (name, department_id) VALUES ('James Wilson', 
    (SELECT id FROM departments WHERE name='Finance'));
  INSERT INTO employees (name, department_id) VALUES ('Priya Kaur', 
    (SELECT id FROM departments WHERE name='Human Resources'));
  INSERT INTO employees (name, department_id) VALUES ('Carlos Gutierrez', 
    (SELECT id FROM departments WHERE name='Sales'));
  INSERT INTO employees (name, department_id) VALUES ('Elena Popov', 
    (SELECT id FROM departments WHERE name='Operations'));
  INSERT INTO employees (name, department_id) VALUES ('Sofia Rossi', 
    (SELECT id FROM departments WHERE name='Marketing'));
  INSERT INTO employees (name, department_id) VALUES ('William Ndlovu', 
    (SELECT id FROM departments WHERE name='Finance'));
  `;

  await client.query(SQL);
  console.log("data inserted");

  const port = process.env.PORT;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
