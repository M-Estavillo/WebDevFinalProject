const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'expense_tracker',
};


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));


const pool = mysql.createPool(dbConfig);


async function createTables() {
  const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS expenses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      date DATE NOT NULL
    )
  `;
  await pool.query(createExpensesTable);
  console.log(' Expenses table is ready');
}




app.get('/expenses', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM expenses';
    const params = [];

    if (category && category !== 'All') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});


app.post('/expenses', async (req, res) => {
  try {
    const { name, amount, category, date } = req.body;
    const insertQuery = `
      INSERT INTO expenses (name, amount, category, date)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(insertQuery, [name, amount, category, date]);
    res.status(201).json({ message: 'Expense added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});


app.put('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, category, date } = req.body;
    const updateQuery = `
      UPDATE expenses
      SET name = ?, amount = ?, category = ?, date = ?
      WHERE id = ?
    `;
    await pool.query(updateQuery, [name, amount, category, date, id]);
    res.json({ message: 'Expense updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});


app.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = 'DELETE FROM expenses WHERE id = ?';
    await pool.query(deleteQuery, [id]);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


(async () => {
  try {
    await createTables();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();