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

// Create init function
const init = async () => {
  await client.connect();
  let SQL = `
        DROP TABLE IF EXISTS employees;
        DROP TABLE IF EXISTS departments;
        CREATE TABLE departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(20)
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
        INSERT INTO departments (name) VALUES('Administration');
        INSERT INTO departments (name) VALUES('Recruitment');
        INSERT INTO departments (name) VALUES('Wellbeing');
        INSERT INTO employees (name, department_id) VALUES('Edwin', (SELECT id FROM departments WHERE name='Administration'));
        INSERT INTO employees (name, department_id) VALUES('Kavin', (SELECT id FROM departments WHERE name='Recruitment'));
        INSERT INTO employees (name, department_id) VALUES('Liz', (SELECT id FROM departments WHERE name='Wellbeing'));
        INSERT INTO employees (name, department_id) VALUES('Yasin', (SELECT id FROM departments WHERE name='Recruitment'));
        INSERT INTO employees (name, department_id) VALUES('John', (SELECT id FROM departments WHERE name='Wellbeing'));
        INSERT INTO employees (name, department_id) VALUES('Mike', (SELECT id FROM departments WHERE name='Wellbeing'));
        `;

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
};

// init function invocation
init();
