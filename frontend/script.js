const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const addExpenseButton = document.getElementById("addExpense");
const expenseList = document.getElementById("expenseList");

let totalSpent = 0;
const monthlyBudget = 10000;

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function displayExpenses() {
    expenseList.innerHTML = "";
    totalSpent = 0;

    if (expenses.length === 0) {
        expenseList.innerHTML = "<li>No expenses added yet.</li>";
        updateSummary();
        return;
    }

    expenses.forEach(function (expense, index) {
        totalSpent += expense.amount;

        const expenseItem = document.createElement("li");

        expenseItem.textContent =
            expense.name + " - ₹" + expense.amount + " - " + expense.category;

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            expenses.splice(index, 1);

            localStorage.setItem("expenses", JSON.stringify(expenses));

            displayExpenses();
        });

        expenseItem.appendChild(deleteButton);

        expenseList.appendChild(expenseItem);
    });

    updateSummary();
}

function updateSummary() {
    document.querySelector(".summary div:nth-child(2) p").textContent =
        "₹" + totalSpent;

    document.querySelector(".summary div:nth-child(3) p").textContent =
        "₹" + (monthlyBudget - totalSpent);
}

addExpenseButton.addEventListener("click", function () {

    const name = expenseName.value.trim();
    const amount = Number(expenseAmount.value);
    const category = expenseCategory.value;

    if (name === "" || amount <= 0 || category === "") {
        alert("Please fill all the fields.");
        return;
    }

    const newExpense = {
        name: name,
        amount: amount,
        category: category
    };

    expenses.push(newExpense);

    localStorage.setItem("expenses", JSON.stringify(expenses));

    displayExpenses();
    updateChart();

    expenseName.value = "";
    expenseAmount.value = "";
    expenseCategory.value = "";
});

displayExpenses();
let expenseChart;

function updateChart() {
    const categoryTotals = {};

    expenses.forEach(function (expense) {
        if (categoryTotals[expense.category]) {
            categoryTotals[expense.category] += expense.amount;
        } else {
            categoryTotals[expense.category] = expense.amount;
        }
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    const ctx = document.getElementById("expenseChart");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: "bar",

        data: {
            labels: categories,

            datasets: [{
                label: "Amount Spent (₹)",
                data: amounts
            }]
        },

        options: {
            responsive: true,

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

updateChart();