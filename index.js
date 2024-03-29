// import packages
const express = require("express");
const app = express();
const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_hr_directory_db"
);

// parse the body into JS Objects
app.use(express.json());
// Log the requests as they come in
app.use(require("morgan")("dev"));

// READ DEPARTMENTS - GET
app.get("/api/departments", async (req, res) => {
  try {
    const SQL = `
          SELECT * FROM departments 
          `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    // error handling
    res.status(500).json({ error: error.message });
  }
});

// READ EMPLOYEES - GET
app.get("/api/employees", async (req, res) => {
  try {
    const SQL = `
        SELECT * FROM employees ORDER BY created_at DESC;
        `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    // error handling
    res.status(500).json({ error: error.message });
  }
});

// CREATE EMPLOYEES - POST
app.post("/api/employees", async (req, res) => {
  try {
    const SQL = `
          INSERT INTO employees(name, department_id)
          VALUES($1, $2)
          RETURNING *
          `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.department_id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    // error handling
    res.status(500).json({ error: error.message });
  }
});

// UPDATE EMPLOYEES - PUT
app.put("/api/employees/:id", async (req, res) => {
  try {
    const SQL = `
        UPDATE employees
        SET name=$1, department_id=$2, updated_at= now()
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
    // error handling
    res.status(500).json({ error: error.message });
  }
});

// DELETE EMPLOYEES - DELETE
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const SQL = `
        DELETE FROM employees
        WHERE id= $1
        `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    // error handling
    res.status(500).json({ error: error.message });
  }
});

// Create init function
const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = `
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS departments;
        CREATE TABLE departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50)
        );
        CREATE TABLE employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            department_id INTEGER REFERENCES departments(id) NOT NULL
        );
        `;
  await client.query(SQL);
  console.log("table created");

  SQL = `
        INSERT INTO departments(name) VALUES('Administration');
        INSERT INTO departments(name) VALUES('Recruitment');
        INSERT INTO departments(name) VALUES('Wellbeing');
        INSERT INTO employees(name, department_id) VALUES('Edwin', (SELECT id FROM departments WHERE name='Administration'));
        INSERT INTO employees(name, department_id) VALUES('Kavin', (SELECT id FROM departments WHERE name='Recruitment'));
        INSERT INTO employees(name, department_id) VALUES('Liz', (SELECT id FROM departments WHERE name='Wellbeing'));
        INSERT INTO employees(name, department_id) VALUES('Yasin', (SELECT id FROM departments WHERE name='Recruitment'));
        INSERT INTO employees(name, department_id) VALUES('John', (SELECT id FROM departments WHERE name='Wellbeing'));
        INSERT INTO employees(name, department_id) VALUES('Mike', (SELECT id FROM departments WHERE name='Wellbeing'));
        `;
  await client.query(SQL);
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
};

// init function invocation
init();
