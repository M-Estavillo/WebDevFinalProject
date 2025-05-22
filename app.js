const expenseTable = document.getElementById('expense-table');
const totalExpenseDisplay = document.getElementById('total-expense');
const categoryFilter = document.getElementById('category-filter');
const addExpenseButton = document.getElementById('add-expense');
const expenseName = document.getElementById('expense-name');
const expenseAmount = document.getElementById('expense-amount');
const expenseCategory = document.getElementById('expense-category');
const expenseDate = document.getElementById('expense-date');

let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let editingExpenseId = null;
let deletingExpenseId = null;

const categories = ["Food", "Transport", "Shopping", "Other"];
let expenseData = [0, 0, 0, 0];

const expenseChartCtx = document.getElementById('expenseChart').getContext('2d');
let expenseChart = new Chart(expenseChartCtx, {
    type: 'pie',
    data: {
        labels: categories,
        datasets: [{
            label: 'Expense Distribution',
            data: expenseData,
            backgroundColor: ['#ff6f61', '#4caf50', '#ffeb3b', '#2196f3'],
            borderColor: ['#fff', '#fff', '#fff', '#fff'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: $${context.raw.toFixed(2)}`;
                    }
                }
            }
        }
    }
});

function updateUI() {
    expenseTable.innerHTML = '';
    let total = 0;
    let categoryTotals = [0, 0, 0, 0];

    if (expenses.length === 0) {
        const emptyMessageRow = document.createElement('tr');
        emptyMessageRow.innerHTML = `<td colspan='5' class='empty-table-message'>No expenses recorded.</td>`;
        expenseTable.appendChild(emptyMessageRow);
    } else {
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>
                    <button class='edit-btn' onclick='openEditWindow(${expense.id})'>Edit</button>
                    <button class='delete-btn' onclick='openDeleteWindow(${expense.id})'>Delete</button>
                </td>
            `;
            expenseTable.appendChild(row);
            total += expense.amount;

            const categoryIndex = categories.indexOf(expense.category);
            if (categoryIndex !== -1) {
                categoryTotals[categoryIndex] += expense.amount;
            }
        });
    }

    totalExpenseDisplay.textContent = total.toFixed(2);
    updateChart(categoryTotals);
}

function updateChart(categoryTotals) {
    expenseChart.data.datasets[0].data = categoryTotals;
    expenseChart.update();
}

function checkInputs() {
    if (expenseName.value.trim() && expenseAmount.value && expenseCategory.value && expenseDate.value) {
        addExpenseButton.disabled = false;
    } else {
        addExpenseButton.disabled = true;
    }
}

[expenseName, expenseAmount, expenseCategory, expenseDate].forEach(input => {
    input.addEventListener('input', checkInputs);
});

addExpenseButton.addEventListener('click', () => {
    const name = expenseName.value.trim();
    const amount = parseFloat(expenseAmount.value);
    const category = expenseCategory.value;
    const date = expenseDate.value;

    if (!name || isNaN(amount) || !date) {
        alert('Please fill in all fields.');
        return;
    }

    const expense = { id: Date.now(), name, amount, category, date };
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    expenseName.value = '';
    expenseAmount.value = '';
    expenseCategory.value = '';
    expenseDate.value = '';
    addExpenseButton.disabled = true;

    updateUI();
});

function openEditWindow(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    document.getElementById('edit-expense-name').value = expense.name;
    document.getElementById('edit-expense-amount').value = expense.amount;
    document.getElementById('edit-expense-category').value = expense.category;
    document.getElementById('edit-expense-date').value = expense.date;

    editingExpenseId = id;
    openWindow('edit-window');
}

document.getElementById('confirm-edit').addEventListener('click', () => {
    const name = document.getElementById('edit-expense-name').value.trim();
    const amount = parseFloat(document.getElementById('edit-expense-amount').value);
    const category = document.getElementById('edit-expense-category').value;
    const date = document.getElementById('edit-expense-date').value;

    if (!name || isNaN(amount) || !date) {
        alert('Please fill in all fields.');
        return;
    }

    const index = expenses.findIndex(exp => exp.id === editingExpenseId);
    if (index > -1) {
        expenses[index] = { id: editingExpenseId, name, amount, category, date };
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateUI();
    }
    closeWindow('edit-window');
});

function openDeleteWindow(id) {
    deletingExpenseId = id;
    openWindow('delete-window');
}

document.getElementById('confirm-delete').addEventListener('click', () => {
    expenses = expenses.filter(exp => exp.id !== deletingExpenseId);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateUI();
    closeWindow('delete-window');
});

function openWindow(windowId) {
    document.getElementById(windowId).style.display = 'flex';
}

function closeWindow(windowId) {
    document.getElementById(windowId).style.display = 'none';
}

categoryFilter.addEventListener('change', () => {
    const filterValue = categoryFilter.value;
    if (filterValue !== 'All') {
        expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses = expenses.filter(exp => exp.category === filterValue);
    } else {
        expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    }
    updateUI();
});

updateUI();